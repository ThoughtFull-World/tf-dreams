# Dream Journal - Supabase Setup Guide

Quick setup guide for deploying the Dream Journal Edge Function.

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

## Step 2: Initialize Supabase Project

If you haven't already:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>
```

Find your project ref in Supabase Dashboard → Project Settings → General → Reference ID

## Step 3: Run Database Migration

```bash
# Apply the migration
supabase db push
```

This will create all necessary tables, indexes, and RLS policies.

## Step 4: Create Storage Bucket

In Supabase Dashboard:
1. Go to **Storage** → **New bucket**
2. Create bucket named `audio`
3. Set as **Public** (or configure custom RLS policies)

## Step 5: Set Up Cloudflare R2

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2** → **Create bucket**
3. Name it (e.g., `dream-journal-videos`)
4. Go to **R2** → **Manage R2 API Tokens** → **Create API token**
5. Select "Object Read & Write" permissions
6. Note down:
   - Account ID
   - Access Key ID
   - Secret Access Key
   - Bucket name

Optional: Set up custom domain for R2:
- R2 → Your bucket → Settings → Domain
- Add custom domain and configure DNS

## Step 6: Get API Keys

### ElevenLabs
1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Go to Settings → API Keys
3. Create new API key

### Anthropic
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to Settings → API Keys
3. Create new API key

### Fal.ai
1. Sign up at [fal.ai](https://fal.ai)
2. Go to Dashboard → API Keys
3. Create new API key

## Step 7: Configure Environment Variables

Using Supabase CLI:

```bash
# ElevenLabs
supabase secrets set ELEVENLABS_API_KEY=<your-key>

# Anthropic
supabase secrets set ANTHROPIC_API_KEY=<your-key>

# Fal.ai
supabase secrets set FAL_API_KEY=<your-key>

# Cloudflare R2
supabase secrets set R2_ACCOUNT_ID=<your-account-id>
supabase secrets set R2_ACCESS_KEY_ID=<your-access-key>
supabase secrets set R2_SECRET_ACCESS_KEY=<your-secret-key>
supabase secrets set R2_BUCKET_NAME=<your-bucket-name>
supabase secrets set R2_PUBLIC_URL=<optional-custom-domain>
```

Or via Supabase Dashboard:
- Project Settings → Edge Functions → Manage secrets

## Step 8: Deploy Edge Function

```bash
cd supabase/functions
supabase functions deploy process-dream
```

## Step 9: Test the Function

Get your function URL:
```
https://<project-ref>.supabase.co/functions/v1/process-dream
```

Test with curl (replace `<JWT>` with a valid user token):

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/process-dream \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "textInput": "I dreamed I was flying over a crystal city",
    "generateVideo": false
  }'
```

## Step 10: Update Frontend

In your Next.js frontend, configure the Supabase client to use this function:

```typescript
const { data, error } = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-dream`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioBase64: audioData,
      audioMimeType: 'audio/webm',
      generateVideo: true,
    }),
  }
);
```

## Verification Checklist

- [ ] Database tables created (dreams, story_nodes, story_options)
- [ ] RLS policies enabled
- [ ] Storage bucket `audio` created
- [ ] R2 bucket created and configured
- [ ] All API keys set as secrets
- [ ] Edge Function deployed successfully
- [ ] Test request returns valid response
- [ ] Frontend can call the function

## Local Development

For local testing:

```bash
# Start Supabase locally
supabase start

# Copy .env.example to .env.local and fill in values
cp supabase/functions/.env.example supabase/functions/.env.local

# Serve function locally
supabase functions serve process-dream --env-file ./supabase/functions/.env.local

# Test locally
curl -X POST http://localhost:54321/functions/v1/process-dream \
  -H "Authorization: Bearer <local-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"textInput": "test dream", "generateVideo": false}'
```

## Troubleshooting

### Function not deploying
- Ensure you're logged in: `supabase login`
- Check project is linked: `supabase projects list`
- Verify function name matches directory name

### Database errors
- Run migrations: `supabase db push`
- Check RLS policies in Dashboard → Database → Policies

### API key errors
- Verify secrets are set: `supabase secrets list`
- Check spelling of environment variable names

### CORS errors
- Function includes CORS headers automatically
- For custom domains, add to allowed origins in Supabase settings

## Monitoring

View function logs:
```bash
supabase functions logs process-dream --follow
```

Or in Supabase Dashboard:
- Edge Functions → process-dream → Logs

## Cost Optimization Tips

1. **Disable video generation** for development:
   ```json
   { "generateVideo": false }
   ```

2. **Use shorter audio clips** during testing

3. **Cache Claude responses** for identical inputs (implement in future)

4. **Monitor API usage** in each service's dashboard

5. **Set up usage alerts** in Anthropic, ElevenLabs, and Fal.ai dashboards

## Next Steps

- Add rate limiting
- Implement webhook for async video generation
- Add error notifications (e.g., via email or Slack)
- Set up monitoring with Sentry or similar
- Create admin dashboard for usage tracking

## Support

For issues:
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- ElevenLabs: [elevenlabs.io/docs](https://elevenlabs.io/docs)
- Anthropic: [docs.anthropic.com](https://docs.anthropic.com)
- Fal.ai: [fal.ai/docs](https://fal.ai/docs)
- Cloudflare R2: [developers.cloudflare.com/r2](https://developers.cloudflare.com/r2/)

