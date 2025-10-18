import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { uploadToR2, type R2Config } from "../process-dream/r2-client.ts";

/**
 * Dedicated Video Generation Function
 * 
 * Generates video for a story node and updates the database.
 * This function can be called:
 * 1. Directly via HTTP
 * 2. As a background job
 * 3. Via a queue system
 */

interface VideoRequest {
  storyNodeId: string;  // The story node to generate video for
}

interface VideoResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
  nodeId: string;
}

/**
 * Generate video using Fal.ai based on story content
 */
async function generateVideo(storyContent: string): Promise<Uint8Array> {
  const falApiKey = Deno.env.get("FAL_API_KEY");
  if (!falApiKey) {
    throw new Error("FAL_API_KEY not configured");
  }

  console.log("Generating video with Fal.ai Lightning (optimized for speed)...");

  // Extract key visual elements from story for prompt
  const promptForVideo = `Dreamy, surreal scene: ${storyContent.substring(0, 200)}. Cinematic, ethereal lighting, fantasy art style.`;

  // Use Fal.ai's Lightning model for 6x faster generation (10-20s instead of 60-120s)
  const response = await fetch("https://fal.run/fal-ai/fast-animatediff/text-to-video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Key ${falApiKey}`,
    },
    body: JSON.stringify({
      prompt: promptForVideo,
      negative_prompt: "ugly, blurry, low quality, distorted, deformed, artifacts",
      num_frames: 32,              // 4 seconds at 8 fps (max supported by model)
      num_inference_steps: 6,      // Optimized for speed
      guidance_scale: 6.0,         // Balanced quality vs speed
      fps: 8,                      // 8 frames per second
      motion_scale: 1.3,           // Dynamic movement
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Fal.ai error:", error);
    throw new Error(`Fal.ai video generation failed: ${error}`);
  }

  const result = await response.json();
  
  // Download the generated video
  const videoUrl = result.video?.url || result.images?.[0]?.url;
  if (!videoUrl) {
    throw new Error("No video URL returned from Fal.ai");
  }

  const videoResponse = await fetch(videoUrl);
  const videoBuffer = await videoResponse.arrayBuffer();
  
  console.log("Video generation complete");
  return new Uint8Array(videoBuffer);
}

/**
 * Upload video to Cloudflare R2
 */
async function uploadVideoToR2(
  videoBuffer: Uint8Array,
  userId: string,
  dreamId: string,
  nodeId: string
): Promise<string> {
  const r2Config: R2Config = {
    accountId: Deno.env.get("R2_ACCOUNT_ID")!,
    accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
    secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
    bucketName: Deno.env.get("R2_BUCKET_NAME")!,
    publicUrl: Deno.env.get("R2_PUBLIC_URL"),
  };

  if (!r2Config.accountId || !r2Config.accessKeyId || !r2Config.secretAccessKey || !r2Config.bucketName) {
    throw new Error("R2 credentials not configured");
  }

  console.log("Uploading video to Cloudflare R2...");

  const filePath = `videos/${userId}/${dreamId}/${nodeId}.mp4`;
  
  const publicUrl = await uploadToR2(
    videoBuffer,
    filePath,
    "video/mp4",
    r2Config
  );

  console.log("Video uploaded successfully to R2");
  return publicUrl;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
      },
    });
  }

  try {
    // 1. AUTHENTICATE USER
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract JWT token from Authorization header
    const jwt = authHeader.replace("Bearer ", "");
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating video for user: ${user.id}`);

    // 2. PARSE REQUEST
    const body: VideoRequest = await req.json();
    const { storyNodeId } = body;

    if (!storyNodeId) {
      throw new Error("storyNodeId is required");
    }

    // 3. GET STORY NODE FROM DATABASE
    const { data: storyNode, error: nodeError } = await supabase
      .from("story_nodes")
      .select("id, content, dream_id, video_url")
      .eq("id", storyNodeId)
      .single();

    if (nodeError || !storyNode) {
      throw new Error(`Story node not found: ${nodeError?.message}`);
    }

    // Check if video already exists
    if (storyNode.video_url) {
      return new Response(
        JSON.stringify({
          success: true,
          videoUrl: storyNode.video_url,
          nodeId: storyNodeId,
          message: "Video already exists"
        } as VideoResponse),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 4. GENERATE VIDEO
    console.log(`Generating video for node: ${storyNodeId}`);
    const videoBuffer = await generateVideo(storyNode.content);

    // 5. UPLOAD TO R2
    const videoUrl = await uploadVideoToR2(
      videoBuffer,
      user.id,
      storyNode.dream_id,
      storyNodeId
    );

    // 6. UPDATE DATABASE
    const { error: updateError } = await supabase
      .from("story_nodes")
      .update({ video_url: videoUrl })
      .eq("id", storyNodeId);

    if (updateError) {
      console.error("Failed to update video URL:", updateError);
      throw new Error(`Failed to update database: ${updateError.message}`);
    }

    console.log(`Video generated successfully: ${videoUrl}`);

    // 7. RETURN SUCCESS
    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: videoUrl,
        nodeId: storyNodeId,
      } as VideoResponse),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error: any) {
    console.error("Error generating video:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Video generation failed",
        details: error.toString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

