# Dream Journal Edge Function

This Supabase Edge Function processes dream journal entries with audio/text input, generates AI-powered story continuations, and optionally creates videos.

## Features

- ✅ User authentication via Supabase Auth
- 🎤 Audio-to-text transcription (ElevenLabs STT)
- 🤖 AI story generation (Claude by Anthropic)
- 🎬 Video generation (Fal.ai)
- ☁️ Audio storage (Supabase Storage)
- 🪣 Video storage (Cloudflare R2)
- 💾 Database persistence (Supabase PostgreSQL)

## Prerequisites

1. **Supabase Project** - Create at [supabase.com](https://supabase.com)
2. **API Keys**:
   - ElevenLabs API Key ([elevenlabs.io](https://elevenlabs.io))
   - Anthropic API Key ([anthropic.com](https://console.anthropic.com))
   - Fal.ai API Key ([fal.ai](https://fal.ai))
   - Cloudflare R2 credentials ([cloudflare.com](https://cloudflare.com))

## Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dreams table
CREATE TABLE dreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story nodes table
CREATE TABLE story_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  parent_node_id UUID REFERENCES story_nodes(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story options table
CREATE TABLE story_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_node_id UUID NOT NULL REFERENCES story_nodes(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  next_node_id UUID REFERENCES story_nodes(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_dreams_user_id ON dreams(user_id);
CREATE INDEX idx_dreams_created_at ON dreams(created_at DESC);
CREATE INDEX idx_story_nodes_dream_id ON story_nodes(dream_id);
CREATE INDEX idx_story_nodes_parent_id ON story_nodes(parent_node_id);
CREATE INDEX idx_story_options_node_id ON story_options(story_node_id);

-- Row Level Security (RLS)
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dreams
CREATE POLICY "Users can view their own dreams"
  ON dreams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dreams"
  ON dreams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dreams"
  ON dreams FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for story_nodes
CREATE POLICY "Users can view story nodes from their dreams"
  ON story_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = story_nodes.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert story nodes to their dreams"
  ON story_nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = story_nodes.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- RLS Policies for story_options
CREATE POLICY "Users can view options from their story nodes"
  ON story_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM story_nodes
      JOIN dreams ON dreams.id = story_nodes.dream_id
      WHERE story_nodes.id = story_options.story_node_id
      AND dreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert options to their story nodes"
  ON story_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM story_nodes
      JOIN dreams ON dreams.id = story_nodes.dream_id
      WHERE story_nodes.id = story_options.story_node_id
      AND dreams.user_id = auth.uid()
    )
  );
```

## Storage Setup

Create the audio bucket in Supabase Storage:

1. Go to Supabase Dashboard → Storage
2. Create new bucket named `audio`
3. Set as **public** (or configure RLS as needed)

## Environment Variables

Set these in your Supabase project:

```bash
# Supabase (auto-configured)
SUPABASE_URL=<your-project-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# ElevenLabs
ELEVENLABS_API_KEY=<your-elevenlabs-api-key>

# Anthropic
ANTHROPIC_API_KEY=<your-anthropic-api-key>

# Fal.ai
FAL_API_KEY=<your-fal-api-key>

# Cloudflare R2
R2_ACCOUNT_ID=<your-cloudflare-account-id>
R2_ACCESS_KEY_ID=<your-r2-access-key-id>
R2_SECRET_ACCESS_KEY=<your-r2-secret-access-key>
R2_BUCKET_NAME=<your-r2-bucket-name>
R2_PUBLIC_URL=<optional-custom-domain-for-r2>
```

### Setting Environment Variables

Using Supabase CLI:

```bash
supabase secrets set ELEVENLABS_API_KEY=your_key_here
supabase secrets set ANTHROPIC_API_KEY=your_key_here
supabase secrets set FAL_API_KEY=your_key_here
supabase secrets set R2_ACCOUNT_ID=your_account_id
supabase secrets set R2_ACCESS_KEY_ID=your_access_key
supabase secrets set R2_SECRET_ACCESS_KEY=your_secret_key
supabase secrets set R2_BUCKET_NAME=your_bucket_name
```

Or via Supabase Dashboard:
- Go to Project Settings → Edge Functions → Manage secrets

## Deployment

### Prerequisites
Install Supabase CLI:
```bash
npm install -g supabase
```

### Deploy

1. Login to Supabase:
```bash
supabase login
```

2. Link your project:
```bash
supabase link --project-ref <your-project-ref>
```

3. Deploy the function:
```bash
supabase functions deploy process-dream
```

4. Verify deployment:
```bash
supabase functions list
```

## API Usage

### Endpoint

```
POST https://<project-ref>.supabase.co/functions/v1/process-dream
```

### Headers

```
Authorization: Bearer <user-jwt-token>
Content-Type: application/json
```

### Request Body

#### With Audio Input

```json
{
  "audioBase64": "<base64-encoded-audio-data>",
  "audioMimeType": "audio/webm",
  "dreamId": "optional-existing-dream-id",
  "parentNodeId": "optional-parent-node-id",
  "generateVideo": true
}
```

#### With Text Input

```json
{
  "textInput": "I was flying over a crystal city...",
  "dreamId": "optional-existing-dream-id",
  "parentNodeId": "optional-parent-node-id",
  "generateVideo": true
}
```

### Response

```json
{
  "dreamId": "uuid",
  "storyNode": {
    "id": "uuid",
    "content": "The vivid dream narrative...",
    "videoUrl": "https://r2.example.com/videos/...",
    "createdAt": "2025-10-18T12:00:00Z"
  },
  "options": [
    {
      "id": "uuid",
      "optionText": "Fly higher into the clouds"
    },
    {
      "id": "uuid",
      "optionText": "Land in the crystal plaza"
    },
    {
      "id": "uuid",
      "optionText": "Follow the glowing pathway"
    }
  ],
  "transcript": "The transcribed or provided text"
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Frontend Integration

Example JavaScript/TypeScript usage:

```typescript
async function submitDream(audioBlob: Blob) {
  // Get user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("User not authenticated");
  }

  // Convert audio to base64
  const audioBase64 = await blobToBase64(audioBlob);

  // Call Edge Function
  const response = await fetch(
    `${supabaseUrl}/functions/v1/process-dream`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audioBase64: audioBase64.split(",")[1], // Remove data:audio/webm;base64, prefix
        audioMimeType: audioBlob.type,
        generateVideo: true,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  return data;
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

## Testing

Test locally with Supabase CLI:

```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve process-dream --env-file ./supabase/.env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/process-dream \
  -H "Authorization: Bearer <your-test-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "textInput": "I was in a dream...",
    "generateVideo": false
  }'
```

## Monitoring

View logs:

```bash
# Real-time logs
supabase functions logs process-dream

# Or in Supabase Dashboard
# Edge Functions → process-dream → Logs
```

## Cost Considerations

- **ElevenLabs**: ~$0.10 per minute of audio transcribed
- **Anthropic Claude**: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
- **Fal.ai**: ~$0.05-0.20 per video (varies by model)
- **Cloudflare R2**: Storage $0.015/GB/month, egress free
- **Supabase**: Check your plan's included resources

Consider disabling video generation for cost savings:
```json
{ "generateVideo": false }
```

## Troubleshooting

### "Missing authorization header"
- Ensure you're passing `Authorization: Bearer <jwt>` header
- Verify user is logged in via Supabase Auth

### "ELEVENLABS_API_KEY not configured"
- Check environment variables are set correctly
- Redeploy function after setting secrets

### "R2 upload failed"
- Verify R2 credentials and bucket name
- Ensure bucket has correct CORS settings if accessing from browser

### Video generation timeout
- Fal.ai can take 30-60 seconds
- Consider making video generation async or optional

## Security Notes

- ✅ All API keys stored securely in Edge Function environment
- ✅ User authentication enforced
- ✅ RLS policies protect database access
- ✅ Frontend cannot access backend API keys
- ⚠️ Implement rate limiting for production use
- ⚠️ Consider adding file size limits for audio uploads

## License

MIT

