# Local Development Setup Guide

Quick guide to get the Edge Function running locally for testing.

## 🚀 Quick Start (Automated)

### On Windows (PowerShell)

```powershell
cd c:\Users\ian\Desktop\tf-dreams-1
.\supabase\functions\setup-local.ps1
```

### On Mac/Linux (Bash)

```bash
cd ~/your-project
chmod +x supabase/functions/setup-local.sh
./supabase/functions/setup-local.sh
```

The script will:
1. ✅ Prompt you for each API key
2. ✅ Create `.env.local` file automatically
3. ✅ Add to `.gitignore`
4. ✅ Start Supabase if needed
5. ✅ Optionally start the Edge Function

---

## 📝 Manual Setup

### Step 1: Start Local Supabase

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Start local Supabase (this creates a local database)
supabase start
```

This will output your local credentials including the `service_role key`.

### Step 2: Create Environment File

Create `supabase/functions/.env.local`:

```bash
# Navigate to functions directory
cd supabase/functions

# Create the file
touch .env.local  # Mac/Linux
# OR
New-Item .env.local  # Windows PowerShell
```

### Step 3: Add Your API Keys

Edit `supabase/functions/.env.local` and add:

```bash
# Supabase (Local)
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-status

# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Fal.ai API (optional for testing)
FAL_API_KEY=your_fal_api_key

# Cloudflare R2 (optional for testing)
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=dream-journal-videos
R2_PUBLIC_URL=
```

### Step 4: Start the Edge Function

```bash
cd supabase/functions
supabase functions serve process-dream --env-file ./.env.local
```

You should see:
```
Serving functions on http://localhost:54321/functions/v1/
  - process-dream
```

---

## 🧪 Testing Locally

### Get a Test JWT Token

First, create a test user:

```bash
# In Supabase Dashboard (http://localhost:54323)
# Go to Authentication → Add user
# Or use the API:

curl -X POST http://localhost:54321/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

This will return a JWT token in the response.

### Test the Function

```bash
# Replace YOUR_JWT_TOKEN with the token from above
curl -X POST http://localhost:54321/functions/v1/process-dream \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "textInput": "I dreamed I was flying over mountains",
    "generateVideo": false
  }'
```

Expected response:
```json
{
  "dreamId": "uuid...",
  "storyNode": {
    "id": "uuid...",
    "content": "AI-generated dream narrative...",
    "videoUrl": null,
    "createdAt": "2025-10-18..."
  },
  "options": [
    {"id": "uuid...", "optionText": "Choice 1"},
    {"id": "uuid...", "optionText": "Choice 2"},
    {"id": "uuid...", "optionText": "Choice 3"}
  ],
  "transcript": "I dreamed I was flying over mountains"
}
```

---

## 🔍 Troubleshooting

### "Supabase is not running"

```bash
supabase start
```

If this fails, check Docker is running.

### "Service role key not found"

Get it with:
```bash
supabase status
```

Look for the line: `service_role key: eyJh...`

### "ELEVENLABS_API_KEY not configured"

Make sure your `.env.local` file exists and has the correct key.

Check the file:
```bash
cat supabase/functions/.env.local  # Mac/Linux
Get-Content supabase\functions\.env.local  # Windows
```

### "Database connection error"

Make sure Supabase is running:
```bash
supabase status
```

If not running:
```bash
supabase start
```

### Function not reloading changes

Restart the function:
- Press `Ctrl+C` to stop
- Run the serve command again

---

## 💡 Tips for Local Development

### Disable Video Generation

Save API costs during development:
```json
{
  "textInput": "test dream",
  "generateVideo": false
}
```

### View Logs

The Edge Function logs appear in the terminal where you ran `supabase functions serve`.

### Hot Reload

Changes to `index.ts` are automatically picked up. Just save the file and test again.

### Database Changes

If you modify the schema:
```bash
supabase db reset
```

This applies all migrations fresh.

---

## 📊 What's Running Locally

When you run `supabase start`, you get:

- **API**: http://localhost:54321
- **DB**: postgresql://postgres:postgres@localhost:54322/postgres
- **Studio**: http://localhost:54323 (Database UI)
- **Inbucket**: http://localhost:54324 (Email testing)

---

## 🎯 Next Steps

Once local testing works:

1. **Deploy to production**:
   ```bash
   supabase secrets set ELEVENLABS_API_KEY=...
   supabase functions deploy process-dream
   ```

2. **Test production**:
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/process-dream \
     -H "Authorization: Bearer PROD_JWT" \
     -H "Content-Type: application/json" \
     -d '{"textInput": "test", "generateVideo": false}'
   ```

---

## 🔐 Security Reminder

**Never commit `.env.local` to git!**

Add to `.gitignore`:
```
supabase/functions/.env.local
.env
.env.local
```

---

## 📚 Resources

- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Deno Manual](https://deno.land/manual)

---

**Happy coding! 🌙✨**

