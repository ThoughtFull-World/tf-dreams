/**
 * Cloudflare R2 Upload Client
 * 
 * Implements AWS Signature V4 for R2 compatibility
 * R2 uses S3-compatible API
 */

// ============================================================================
// AWS SIGNATURE V4 IMPLEMENTATION
// ============================================================================

async function sha256(message: string): Promise<ArrayBuffer> {
  const msgBuffer = new TextEncoder().encode(message);
  return await crypto.subtle.digest("SHA-256", msgBuffer);
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const msgBuffer = new TextEncoder().encode(message);
  return await crypto.subtle.sign("HMAC", cryptoKey, msgBuffer);
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(
    new TextEncoder().encode("AWS4" + key),
    dateStamp
  );
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
}

// ============================================================================
// R2 UPLOAD FUNCTION
// ============================================================================

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

/**
 * Upload file to Cloudflare R2 with proper AWS SigV4 authentication
 */
export async function uploadToR2(
  fileBuffer: Uint8Array,
  filePath: string,
  contentType: string,
  config: R2Config
): Promise<string> {
  const { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl } = config;

  // R2 endpoint
  const endpoint = `${bucketName}.${accountId}.r2.cloudflarestorage.com`;
  const region = "auto"; // R2 uses "auto" region
  const service = "s3";
  
  // Create timestamp
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  // Create canonical request
  const method = "PUT";
  const canonicalUri = `/${filePath}`;
  const canonicalQuerystring = "";
  
  // Calculate payload hash
  const payloadHash = toHex(await crypto.subtle.digest("SHA-256", fileBuffer));
  
  // Create canonical headers
  const canonicalHeaders = 
    `host:${endpoint}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  
  const canonicalRequest = 
    `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // Create string to sign
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = toHex(await sha256(canonicalRequest));
  
  const stringToSign = 
    `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

  // Calculate signature
  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  // Create authorization header
  const authorizationHeader = 
    `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  // Upload to R2
  const url = `https://${endpoint}/${filePath}`;
  
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Host": endpoint,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      "Authorization": authorizationHeader,
      "Content-Type": contentType,
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`R2 upload failed: ${response.status} - ${errorText}`);
  }

  // Return public URL
  const publicFileUrl = publicUrl 
    ? `${publicUrl}/${filePath}`
    : `https://${endpoint}/${filePath}`;

  return publicFileUrl;
}

