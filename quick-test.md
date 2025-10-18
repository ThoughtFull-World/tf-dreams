# Quick Test Guide for process-dream Function

## Step 1: Get Your Credentials

Go to: https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/settings/api

Copy these values:
- **Project URL**: `https://vnoyyctltxouigjyqvav.supabase.co`
- **Anon/Public Key**: (the long JWT token under "Project API keys" -> "anon public")

## Step 2: Create a Test User (if you don't have one)

Go to: https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/auth/users

Click "Add user" and create a test account with email/password.

## Step 3: Test Login & Function

Replace the placeholders below and run in your terminal:

```bash
# Set your credentials
SUPABASE_URL="https://vnoyyctltxouigjyqvav.supabase.co"
ANON_KEY="YOUR_ANON_KEY_HERE"
EMAIL="your-test-email@example.com"
PASSWORD="your-test-password"

# Login to get access token
LOGIN_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Extract token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')

echo "Access Token: $ACCESS_TOKEN"

# Test the function
curl -X POST "$SUPABASE_URL/functions/v1/process-dream" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "textInput": "I dreamed I was flying over a crystal city",
    "generateVideo": false
  }'
```

## Step 4: Check Results

If successful, you should get a JSON response with:
- `dreamId`: UUID of the created dream
- `storyNode`: The generated story content
- `options`: 3 choices for continuing the dream
- `transcript`: Your input text

## Common Errors:

### "OPENAI_API_KEY not configured"
Run: `npx supabase secrets set OPENAI_API_KEY=sk-...`

### "Unauthorized" or 401
- Check your email/password are correct
- Verify the ANON_KEY is correct

### "relation 'dreams' does not exist"
- You need to apply the database migration via SQL Editor
- Go to: https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/sql/new
- Copy contents from: supabase/migrations/20241018000000_initial_schema.sql
- Run it

## Check Logs

View function logs here:
https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/functions/process-dream/logs

