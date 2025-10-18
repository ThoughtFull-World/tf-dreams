# Dream Journal - Supabase Backend

Complete Supabase backend implementation for the Dream Journal app.

## 📁 Project Structure

```
supabase/
├── functions/
│   └── process-dream/          # Main Edge Function
│       ├── index.ts            # Handler with all integrations
│       ├── r2-client.ts        # Cloudflare R2 upload client
│       ├── types.ts            # TypeScript definitions
│       ├── test.ts             # Test utilities
│       ├── deno.json           # Deno configuration
│       ├── import_map.json     # Import mappings
│       ├── deploy.sh           # Deployment script
│       ├── README.md           # Function documentation
│       └── API.md              # API reference
├── migrations/
│   └── 20241018000000_initial_schema.sql  # Database schema
├── config.toml                 # Supabase config
├── QUICKSTART.md               # ⚡ 5-minute setup
├── SETUP.md                    # 📘 Complete guide
├── ENV_VARIABLES.md            # 🔐 Environment vars
├── IMPLEMENTATION_SUMMARY.md   # 📊 Full overview
└── README.md                   # 👈 You are here
```

## 🚀 Quick Start

**New to this project? Start here:**

1. **First time setup**: [QUICKSTART.md](./QUICKSTART.md) - Get running in 5 minutes
2. **Detailed setup**: [SETUP.md](./SETUP.md) - Step-by-step instructions
3. **API docs**: [functions/process-dream/API.md](./functions/process-dream/API.md) - API reference
4. **Environment vars**: [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Configuration guide

## 🎯 What This Does

The Supabase backend handles complete dream journal processing:

### Features
- 🎤 **Audio transcription** using ElevenLabs STT
- 🤖 **Story generation** using Claude 3.5 Sonnet
- 🎬 **Video generation** using Fal.ai (optional)
- ☁️ **Media storage** via Supabase Storage & Cloudflare R2
- 🗄️ **Database** with PostgreSQL + Row Level Security
- 🔒 **Authentication** with Supabase Auth

### Architecture

```
Frontend (Next.js)
    ↓ POST /functions/v1/process-dream
Edge Function (Deno)
    ↓
├─ ElevenLabs → Audio transcription
├─ Claude AI → Story generation
├─ Fal.ai → Video generation
├─ Supabase Storage → Audio storage
├─ Cloudflare R2 → Video storage
└─ PostgreSQL → Data persistence
```

## 📋 Prerequisites

- Supabase account ([sign up](https://supabase.com))
- Node.js & npm
- API keys:
  - ElevenLabs ([elevenlabs.io](https://elevenlabs.io))
  - Anthropic ([console.anthropic.com](https://console.anthropic.com))
  - Fal.ai ([fal.ai](https://fal.ai))
  - Cloudflare R2 ([cloudflare.com](https://cloudflare.com))

## 🛠️ Installation

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Initialize

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

### 3. Setup Database

```bash
supabase db push
```

This creates:
- `dreams` table
- `story_nodes` table
- `story_options` table
- RLS policies
- Indexes

### 4. Create Storage Bucket

In Supabase Dashboard:
- Storage → New bucket → Name: `audio` → Make public

### 5. Configure Secrets

```bash
supabase secrets set ELEVENLABS_API_KEY=<key>
supabase secrets set ANTHROPIC_API_KEY=<key>
supabase secrets set FAL_API_KEY=<key>
supabase secrets set R2_ACCOUNT_ID=<id>
supabase secrets set R2_ACCESS_KEY_ID=<key>
supabase secrets set R2_SECRET_ACCESS_KEY=<key>
supabase secrets set R2_BUCKET_NAME=<name>
```

See [ENV_VARIABLES.md](./ENV_VARIABLES.md) for details.

### 6. Deploy

```bash
cd functions
supabase functions deploy process-dream
```

## 🧪 Testing

### Local Development Setup (Easy Way)

**Windows (PowerShell):**
```powershell
.\supabase\functions\setup-local.ps1
```

**Mac/Linux (Bash):**
```bash
chmod +x supabase/functions/setup-local.sh
./supabase/functions/setup-local.sh
```

The script will prompt you for API keys and automatically set everything up!

See [LOCAL_SETUP_GUIDE.md](./functions/LOCAL_SETUP_GUIDE.md) for detailed instructions.

### Manual Local Testing

```bash
# Start Supabase locally
supabase start

# Serve function
cd functions
supabase functions serve process-dream --env-file ./.env.local

# Test
curl -X POST http://localhost:54321/functions/v1/process-dream \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"textInput": "test dream", "generateVideo": false}'
```

### Run Tests

```bash
cd functions/process-dream
deno test --allow-net --allow-env test.ts
```

## 📡 API Usage

### Endpoint

```
POST https://<project-ref>.supabase.co/functions/v1/process-dream
```

### Request

```typescript
{
  // Option 1: Audio
  audioBase64?: string;
  audioMimeType?: string;
  
  // Option 2: Text
  textInput?: string;
  
  // Optional
  dreamId?: string;
  parentNodeId?: string;
  generateVideo?: boolean;
}
```

### Response

```typescript
{
  dreamId: string;
  storyNode: {
    id: string;
    content: string;
    videoUrl?: string;
    createdAt: string;
  };
  options: Array<{
    id: string;
    optionText: string;
  }>;
  transcript: string;
}
```

See [API.md](./functions/process-dream/API.md) for complete reference.

## 🔌 Frontend Integration

### Example (Next.js + TypeScript)

```typescript
async function submitDream(audio: Blob) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const base64 = await blobToBase64(audio);
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-dream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioBase64: base64.split(',')[1],
        audioMimeType: audio.type,
        generateVideo: true,
      }),
    }
  );

  const data = await response.json();
  return data;
}
```

## 🗄️ Database Schema

### Tables

**dreams**
- Stores dream sessions
- Links to user via `user_id`
- Contains latest transcript

**story_nodes**
- Story narrative nodes
- Tree structure via `parent_node_id`
- Contains AI-generated content

**story_options**
- Branching choices (3 per node)
- Links to next nodes when chosen

### Security

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own dreams
- ✅ Automatic enforcement at database level

## 💰 Cost Estimates

### Per Request

**With video:**
- ElevenLabs: ~$0.02
- Claude: ~$0.01
- Fal.ai: ~$0.10
- **Total: ~$0.13**

**Without video:**
- ElevenLabs: ~$0.02
- Claude: ~$0.01
- **Total: ~$0.03**

### Optimization

Disable video for development:
```json
{ "generateVideo": false }
```

## 📊 Monitoring

### View Logs

```bash
supabase functions logs process-dream --follow
```

### Dashboard

Supabase Dashboard → Edge Functions → process-dream → Logs

### Metrics
- Invocation count
- Error rate
- Response time
- Success rate

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unauthorized" | User not logged in |
| "API key not configured" | Set secrets with `supabase secrets set` |
| Timeout | Disable video or increase timeout |
| Database errors | Run `supabase db push` |

See [SETUP.md](./SETUP.md) for more troubleshooting.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | 5-minute quick start |
| [SETUP.md](./SETUP.md) | Complete setup guide |
| [ENV_VARIABLES.md](./ENV_VARIABLES.md) | Environment configuration |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Full technical overview |
| [functions/process-dream/README.md](./functions/process-dream/README.md) | Function details |
| [functions/process-dream/API.md](./functions/process-dream/API.md) | API reference |

## 🔒 Security

- ✅ JWT authentication required
- ✅ RLS policies on all tables
- ✅ API keys in secure environment
- ✅ CORS properly configured
- ✅ Data isolation per user

## 🚢 Deployment Checklist

- [ ] Supabase CLI installed
- [ ] Project linked
- [ ] Database migrated
- [ ] Storage bucket created
- [ ] All secrets configured
- [ ] Edge Function deployed
- [ ] Test request successful
- [ ] Frontend integration working

## 🎓 Learning Resources

- [Supabase Docs](https://supabase.com/docs)
- [Deno Manual](https://deno.land/manual)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [Anthropic Claude](https://docs.anthropic.com)
- [Fal.ai Docs](https://fal.ai/docs)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

## 💬 Support

- **Supabase**: [Discord](https://discord.supabase.com)
- **Issues**: Check logs with `supabase functions logs`
- **Docs**: See documentation files above

## 📝 License

MIT

---

**Built with ❤️ for Dream Journal**

Ready to deploy? Start with [QUICKSTART.md](./QUICKSTART.md)!

