# Windows Manual Setup Guide

If you can't run the PowerShell script due to execution policies, follow these manual steps:

## Step 1: Start Local Supabase

```powershell
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Start local Supabase
supabase start
```

Wait for it to finish. You'll see output like:
```
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Copy the `service_role key`** - you'll need it in the next step.

## Step 2: Create .env.local File

Navigate to the functions directory:
```powershell
cd supabase\functions
```

Create the file:
```powershell
New-Item -Path .env.local -ItemType File
```

Open it in your editor:
```powershell
notepad .env.local
```

## Step 3: Add Your API Keys

Copy and paste this into `.env.local`, then replace the placeholder values:

```bash
# Supabase (Local)
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=paste-your-key-from-step-1

# ElevenLabs API
# Get from: https://elevenlabs.io/app/settings/api-keys
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Anthropic API
# Get from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Fal.ai API (optional for now, can skip)
# Get from: https://fal.ai/dashboard/keys
FAL_API_KEY=your_fal_api_key_here

# Cloudflare R2 (optional for now, can skip)
# Get from: https://dash.cloudflare.com
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=dream-journal-videos
R2_PUBLIC_URL=
```

**Save and close** the file.

## Step 4: Add to .gitignore

Back in the project root:
```powershell
cd ..\..
```

Add this line to your `.gitignore`:
```powershell
Add-Content -Path .gitignore -Value "`nsupabase/functions/.env.local"
```

## Step 5: Get Your API Keys

### ElevenLabs API Key
1. Go to https://elevenlabs.io
2. Sign up / Log in
3. Go to Settings → API Keys
4. Create a new key
5. Copy it and paste into `.env.local`

### Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Go to Settings → API Keys
4. Create a new key
5. Copy it and paste into `.env.local`

### Fal.ai API Key (Optional - can skip for now)
1. Go to https://fal.ai
2. Sign up / Log in
3. Go to Dashboard → API Keys
4. Create a new key
5. Copy it and paste into `.env.local`

### Cloudflare R2 (Optional - can skip for now)
1. Go to https://dash.cloudflare.com
2. Navigate to R2 → Create bucket
3. Go to R2 → Manage R2 API Tokens
4. Create token with "Object Read & Write"
5. Copy credentials and paste into `.env.local`

## Step 6: Start the Edge Function

```powershell
cd supabase\functions
supabase functions serve process-dream --env-file .\.env.local
```

You should see:
```
Serving functions on http://localhost:54321/functions/v1/
  - process-dream
```

## Step 7: Test It

Open a new PowerShell window and test:

```powershell
# First, create a test user to get a JWT token
# Open http://localhost:54323 in your browser (Supabase Studio)
# Go to Authentication → Add user
# Create a test user (e.g., test@example.com / password123)

# Then test the function (replace YOUR_JWT with actual token)
curl -X POST http://localhost:54321/functions/v1/process-dream `
  -H "Authorization: Bearer YOUR_JWT" `
  -H "Content-Type: application/json" `
  -d '{\"textInput\": \"I dreamed I was flying\", \"generateVideo\": false}'
```

## ✅ Done!

Your local development environment is ready!

## 🔍 Troubleshooting

**"Supabase not found"**
```powershell
npm install -g supabase
```

**"Service role key not working"**
Get it again:
```powershell
supabase status
```

**"Function not starting"**
Check if Supabase is running:
```powershell
supabase status
```

If not:
```powershell
supabase start
```

**"API key errors"**
Make sure you replaced ALL placeholder values in `.env.local` with real keys.

## 💡 What You Can Skip

For initial testing, you only need:
- ✅ SUPABASE_URL
- ✅ SUPABASE_SERVICE_ROLE_KEY  
- ✅ ELEVENLABS_API_KEY
- ✅ ANTHROPIC_API_KEY

You can skip (set generateVideo: false):
- ⏭️ FAL_API_KEY
- ⏭️ R2 credentials

## 📞 Need Help?

Check the function logs in the terminal where you ran `supabase functions serve`.

