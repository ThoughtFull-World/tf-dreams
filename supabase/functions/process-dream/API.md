# Process Dream API Documentation

Complete API reference for the Dream Journal Edge Function.

## Base URL

```
https://<project-ref>.supabase.co/functions/v1/process-dream
```

Replace `<project-ref>` with your Supabase project reference ID.

---

## Authentication

All requests require a valid Supabase user JWT token.

### Headers

```
Authorization: Bearer <user-jwt-token>
Content-Type: application/json
```

### Getting a JWT Token

Using Supabase client:

```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;
```

---

## Endpoints

### POST /process-dream

Processes a dream journal entry with audio or text input.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audioBase64` | string | Conditional* | Base64 encoded audio file |
| `audioMimeType` | string | Conditional** | MIME type of audio (e.g., `audio/webm`) |
| `textInput` | string | Conditional* | Direct text input |
| `dreamId` | string | No | Existing dream session ID |
| `parentNodeId` | string | No | Parent story node ID for branching |
| `generateVideo` | boolean | No | Generate video (default: `true`) |

\* Either `audioBase64` or `textInput` must be provided  
\*\* Required if `audioBase64` is provided

#### Request Examples

**Audio Input:**

```json
{
  "audioBase64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
  "audioMimeType": "audio/webm",
  "generateVideo": true
}
```

**Text Input:**

```json
{
  "textInput": "I dreamed I was flying over a crystal city with glowing spires",
  "generateVideo": true
}
```

**Continuing a Dream:**

```json
{
  "textInput": "I decided to land in the central plaza",
  "dreamId": "550e8400-e29b-41d4-a716-446655440000",
  "parentNodeId": "660e8400-e29b-41d4-a716-446655440001",
  "generateVideo": true
}
```

**Without Video (Cost Optimization):**

```json
{
  "textInput": "My dream about the ocean",
  "generateVideo": false
}
```

#### Success Response

**Status Code:** `200 OK`

**Response Body:**

```json
{
  "dreamId": "550e8400-e29b-41d4-a716-446655440000",
  "storyNode": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "content": "You soar effortlessly through the twilight sky, your arms outstretched as crystalline towers rise beneath you. The city pulses with an inner light, each spire humming a different note in an ethereal symphony. As you glide closer, you notice the streets below are filled with flowing water that reflects the stars above, creating the illusion of flying through space itself.",
    "videoUrl": "https://r2.example.com/videos/user-id/dream-id/node-id.mp4",
    "createdAt": "2025-10-18T14:23:45.678Z"
  },
  "options": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "optionText": "Dive down toward the luminous water-streets"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "optionText": "Fly higher to touch the glowing spires"
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "optionText": "Follow a mysterious figure moving between the towers"
    }
  ],
  "transcript": "I was flying over a crystal city with glowing spires"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `dreamId` | string (UUID) | Dream session ID |
| `storyNode.id` | string (UUID) | Story node ID |
| `storyNode.content` | string | Generated narrative content |
| `storyNode.videoUrl` | string \| null | URL to generated video (if enabled) |
| `storyNode.createdAt` | string (ISO 8601) | Creation timestamp |
| `options[]` | array | Available story continuation choices |
| `options[].id` | string (UUID) | Option ID |
| `options[].optionText` | string | Description of the choice |
| `transcript` | string | Transcribed or provided text |

#### Error Responses

**401 Unauthorized**

```json
{
  "error": "Unauthorized"
}
```

Missing or invalid JWT token.

**400 Bad Request**

```json
{
  "error": "Either audioBase64 or textInput must be provided"
}
```

Invalid request body.

**500 Internal Server Error**

```json
{
  "error": "ElevenLabs transcription failed: API quota exceeded",
  "details": "Error details..."
}
```

Server-side error during processing.

---

## Rate Limits

Recommended rate limits (implement in your application):
- **5 requests per minute** per user
- **100 requests per hour** per user

This Edge Function does not enforce rate limits. Implement them in your application layer.

---

## Workflow

The function follows this processing flow:

```
1. Authenticate User
   ↓
2. Parse Request
   ↓
3. Convert Audio → Text (if audio)
   ↓
4. Upload Audio to Supabase Storage
   ↓
5. Generate Story with Claude
   ↓
6. Generate Video with Fal.ai (optional)
   ↓
7. Upload Video to R2
   ↓
8. Save to Database
   ↓
9. Return Response
```

Processing typically takes:
- **Without video**: 2-5 seconds
- **With video**: 30-60 seconds

---

## Data Flow

### New Dream Session

```
User Input (audio/text)
  ↓
[Edge Function]
  ↓
dreams table (new row)
  ↓
story_nodes table (root node)
  ↓
story_options table (3 choices)
```

### Continuing a Dream

```
User Input + dreamId + parentNodeId
  ↓
[Edge Function with context]
  ↓
dreams table (update transcript)
  ↓
story_nodes table (new child node)
  ↓
story_options table (new choices)
  ↓
story_options (update parent's next_node_id)
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
async function processDream(input: {
  audio?: Blob;
  text?: string;
  dreamId?: string;
  parentNodeId?: string;
  generateVideo?: boolean;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Not authenticated");
  }

  let body: any = {
    generateVideo: input.generateVideo ?? true,
  };

  if (input.audio) {
    const base64 = await blobToBase64(input.audio);
    body.audioBase64 = base64.split(",")[1];
    body.audioMimeType = input.audio.type;
  } else if (input.text) {
    body.textInput = input.text;
  }

  if (input.dreamId) body.dreamId = input.dreamId;
  if (input.parentNodeId) body.parentNodeId = input.parentNodeId;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-dream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

### React Hook

```typescript
import { useState } from 'react';

export function useProcessDream() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processDream = async (input: {
    audio?: Blob;
    text?: string;
    dreamId?: string;
    parentNodeId?: string;
    generateVideo?: boolean;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await processDreamAPI(input);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { processDream, loading, error };
}
```

### cURL

```bash
# With text input
curl -X POST https://your-project.supabase.co/functions/v1/process-dream \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "textInput": "I dreamed of flying",
    "generateVideo": false
  }'

# With audio (from file)
BASE64_AUDIO=$(base64 -w 0 recording.webm)
curl -X POST https://your-project.supabase.co/functions/v1/process-dream \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"audioBase64\": \"$BASE64_AUDIO\",
    \"audioMimeType\": \"audio/webm\",
    \"generateVideo\": true
  }"
```

---

## Database Schema Reference

### dreams

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| transcript | TEXT | Latest transcript |
| created_at | TIMESTAMP | Creation time |

### story_nodes

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dream_id | UUID | Foreign key to dreams |
| parent_node_id | UUID | Parent node (nullable) |
| content | TEXT | Story narrative |
| video_url | TEXT | Video URL (nullable) |
| created_at | TIMESTAMP | Creation time |

### story_options

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| story_node_id | UUID | Foreign key to story_nodes |
| option_text | TEXT | Choice description |
| next_node_id | UUID | Next node (nullable) |

---

## Performance Considerations

### Timeouts

- **Function timeout**: 60 seconds (Supabase default)
- Video generation may approach this limit
- Consider async processing for video generation

### Optimization Tips

1. **Disable video for development**: Set `generateVideo: false`
2. **Limit audio length**: Keep recordings under 2 minutes
3. **Cache responses**: Store common narratives client-side
4. **Batch requests**: Don't send multiple simultaneous requests

### Monitoring

Check function performance:

```bash
supabase functions logs process-dream
```

Or in Dashboard: Edge Functions → process-dream → Logs

---

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | Missing/invalid JWT | Ensure user is logged in |
| "ELEVENLABS_API_KEY not configured" | Missing API key | Set environment variable |
| "Audio upload failed" | Storage permissions | Check bucket policy |
| "R2 upload failed" | Invalid R2 credentials | Verify R2 configuration |
| Timeout | Video generation too slow | Disable video or implement async |

---

## Security

### Authentication
- ✅ JWT-based user authentication
- ✅ Row Level Security (RLS) on all tables
- ✅ Only authenticated users can access

### API Keys
- ✅ All keys stored in Edge Function environment
- ✅ Frontend never sees API keys
- ✅ Keys encrypted at rest

### Data Access
- ✅ Users can only access their own dreams
- ✅ RLS policies enforce data isolation
- ✅ Cascading deletes protect integrity

---

## Webhooks (Future Enhancement)

For async video generation:

```typescript
// Send webhook when video is ready
await fetch(callbackUrl, {
  method: 'POST',
  body: JSON.stringify({
    dreamId,
    nodeId,
    videoUrl,
  }),
});
```

---

## Support

- **Documentation**: See [README.md](./README.md)
- **Setup Guide**: See [../SETUP.md](../SETUP.md)
- **Issues**: Check function logs first

---

## Changelog

### v1.0.0 (2025-10-18)
- Initial release
- Audio transcription with ElevenLabs
- Story generation with Claude
- Video generation with Fal.ai
- Storage with Supabase + R2
- Complete authentication & RLS

