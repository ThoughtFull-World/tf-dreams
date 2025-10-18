# Environment Variables Configuration

This file documents all required environment variables for the Dream Journal Edge Function.

## Required Environment Variables

### Supabase (Auto-configured)

These are automatically available in Supabase Edge Functions:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### ElevenLabs Configuration

Audio-to-text transcription service.

```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**Where to get it:**
1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Go to Settings → API Keys
3. Create a new API key

### Anthropic Configuration

Claude AI for story generation.

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Where to get it:**
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to Settings → API Keys
3. Create a new API key

### Fal.ai Configuration

Video generation service.

```bash
FAL_API_KEY=your_fal_api_key_here
```

**Where to get it:**
1. Sign up at [fal.ai](https://fal.ai)
2. Go to Dashboard → API Keys
3. Create a new API key

### Cloudflare R2 Configuration

Video storage using R2 (S3-compatible).

```bash
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=dream-journal-videos
R2_PUBLIC_URL=https://your-custom-domain.com  # Optional
```

**Where to get them:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2** → **Create bucket** (note the bucket name)
3. Go to **R2** → **Manage R2 API Tokens**
4. Create a new API token with "Object Read & Write" permissions
5. Copy the Account ID, Access Key ID, and Secret Access Key
6. (Optional) Set up a custom domain for public access

## Setting Environment Variables

### Using Supabase CLI

Set secrets one by one:

```bash
supabase secrets set ELEVENLABS_API_KEY=your_key_here
supabase secrets set ANTHROPIC_API_KEY=your_key_here
supabase secrets set FAL_API_KEY=your_key_here
supabase secrets set R2_ACCOUNT_ID=your_account_id
supabase secrets set R2_ACCESS_KEY_ID=your_access_key
supabase secrets set R2_SECRET_ACCESS_KEY=your_secret_key
supabase secrets set R2_BUCKET_NAME=your_bucket_name
supabase secrets set R2_PUBLIC_URL=https://your-domain.com  # Optional
```

### Using Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **Project Settings** → **Edge Functions**
3. Click **Manage secrets**
4. Add each variable with its corresponding value

### Verify Secrets

List all configured secrets:

```bash
supabase secrets list
```

Output should show all required keys (values are hidden).

## Local Development

For local testing, create a `.env.local` file:

```bash
# Create the file
cd supabase/functions
nano .env.local
```

Add all variables:

```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-local-key

ELEVENLABS_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
FAL_API_KEY=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=dream-videos
R2_PUBLIC_URL=...
```

Then serve locally:

```bash
supabase functions serve process-dream --env-file ./supabase/functions/.env.local
```

## Security Notes

⚠️ **Never commit `.env.local` or any file containing actual API keys to git!**

✅ Add to `.gitignore`:
```
supabase/functions/.env.local
.env
.env.local
```

✅ All production secrets are stored securely in Supabase
✅ Frontend never has access to these keys
✅ Keys are encrypted at rest in Supabase

## Validation

After setting all variables, test the function:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/process-dream \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"textInput": "test", "generateVideo": false}'
```

If successful, all API keys are configured correctly.

## Troubleshooting

**"ELEVENLABS_API_KEY not configured"**
```bash
supabase secrets set ELEVENLABS_API_KEY=your_key
```

**"Missing authorization header"**
→ This is expected; you need a valid user JWT token from Supabase Auth

**Secrets not taking effect after setting**
→ Redeploy the function:
```bash
supabase functions deploy process-dream
```

**Check which secrets are set**
```bash
supabase secrets list
```

## Cost Monitoring

Monitor usage in each provider's dashboard:
- **ElevenLabs**: [elevenlabs.io/app/usage](https://elevenlabs.io/app/usage)
- **Anthropic**: [console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage)
- **Fal.ai**: Check your dashboard for usage
- **Cloudflare R2**: Cloudflare Dashboard → R2 → Usage

Set up usage alerts in each service to avoid unexpected costs.

