# Local Development Guide

## Environment Variables for Local Testing

### Production Deployment
**You do NOT need an `.env` file for production.** Use Supabase secrets instead:

```bash
supabase secrets set ELEVENLABS_API_KEY=your_key
supabase secrets set ANTHROPIC_API_KEY=your_key
# etc...
```

### Local Development (Optional)

If you want to test locally with `supabase functions serve`, create a `.env.local` file:

#### 1. Create the file

```bash
cd supabase/functions
touch .env.local
```

#### 2. Add your variables

```bash
# .env.local
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

ELEVENLABS_API_KEY=your_elevenlabs_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
FAL_API_KEY=your_fal_api_key

R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=dream-journal-videos
R2_PUBLIC_URL=https://your-domain.com
```

#### 3. Serve locally

```bash
supabase functions serve process-dream --env-file ./supabase/functions/.env.local
```

#### 4. Add to .gitignore

**IMPORTANT:** Never commit `.env.local` to git!

```bash
echo "supabase/functions/.env.local" >> .gitignore
```

## Summary

| Environment | Needs .env file? | How to set secrets? |
|-------------|------------------|---------------------|
| **Production** | ❌ No | `supabase secrets set KEY=value` |
| **Local Dev** | ✅ Optional | Create `.env.local` file |

## Testing Production Secrets

Verify your production secrets are set:

```bash
supabase secrets list
```

This shows all configured secrets (values are hidden for security).

