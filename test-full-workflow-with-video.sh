#!/bin/bash

# Complete Audio-to-Video Workflow Test with Authentication
# Tests: Login → Audio/Text → Story → Video → Status Check

SUPABASE_URL="https://vnoyyctltxouigjyqvav.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZub3l5Y3RsdHhvdWlnanlxdmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3Njg2NzAsImV4cCI6MjA3NjM0NDY3MH0.BX3aB2FedpSVJy27cBcC8b32WXb-lMGeDC9St8SeP-k"
EMAIL="ian.yap@thoughtfull.world"
PASSWORD="Ianmental@1988"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎤 Complete Dream Journal Workflow Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Authentication
echo "🔐 Step 1: User Authentication"
echo "   Email: $EMAIL"

LOGIN_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//g')
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//g')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Authentication failed"
  exit 1
fi

echo "✅ Authentication successful!"
echo "   User ID: $USER_ID"
echo ""

# Step 2: Create Dream with Text (simulating audio transcription)
echo "📝 Step 2: Creating Dream Story"
echo "   Mode: Text input (audio requires real recording)"
echo "   • Mem0: Retrieving past dream memories"
echo "   • OpenAI: Generating story with GPT-4"
echo ""

DREAM_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/process-dream" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "textInput": "I dreamed I was exploring an ancient underwater temple filled with glowing coral and mysterious symbols",
    "generateVideo": false
  }')

NODE_ID=$(echo $DREAM_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//g')
DREAM_ID=$(echo $DREAM_RESPONSE | grep -o '"dreamId":"[^"]*' | sed 's/"dreamId":"//g')

if [ -z "$NODE_ID" ]; then
  echo "❌ Dream creation failed"
  echo "Response: $DREAM_RESPONSE" | head -c 300
  exit 1
fi

echo "✅ Dream story created!"
echo "   Dream ID: $DREAM_ID"
echo "   Node ID: $NODE_ID"
echo ""

# Show the generated story
STORY_CONTENT=$(echo $DREAM_RESPONSE | grep -o '"content":"[^"]*' | head -1 | sed 's/"content":"//g' | head -c 150)
echo "📖 Story Preview:"
echo "   \"$STORY_CONTENT...\""
echo ""

# Step 3: Check initial video status
echo "🔍 Step 3: Checking Initial Video Status"
STATUS_RESPONSE=$(curl -s -X GET "$SUPABASE_URL/functions/v1/check-video-status?nodeId=$NODE_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "   Status: $(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*' | sed 's/"status":"//g')"
echo ""

# Step 4: Generate Video
echo "🎬 Step 4: Generating Video with Fal.ai"
echo "   This will take 30-60 seconds..."
echo "   • Fal.ai: Creating video from story"
echo "   • R2: Uploading to Cloudflare"
echo ""

VIDEO_START=$(date +%s)

VIDEO_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/generate-video" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"storyNodeId\": \"$NODE_ID\"}")

VIDEO_END=$(date +%s)
VIDEO_DURATION=$((VIDEO_END - VIDEO_START))

if echo "$VIDEO_RESPONSE" | grep -q '"success":true'; then
  VIDEO_URL=$(echo $VIDEO_RESPONSE | grep -o '"videoUrl":"[^"]*' | sed 's/"videoUrl":"//g' | sed 's/\\//g')
  echo "✅ Video generated successfully!"
  echo "   Duration: ${VIDEO_DURATION}s"
  echo "   Video URL: $VIDEO_URL"
else
  echo "❌ Video generation failed"
  echo "   Duration: ${VIDEO_DURATION}s"
  echo "   Response: $VIDEO_RESPONSE" | head -c 300
fi
echo ""

# Step 5: Verify final status
echo "🔍 Step 5: Verifying Final Status"
FINAL_STATUS=$(curl -s -X GET "$SUPABASE_URL/functions/v1/check-video-status?nodeId=$NODE_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

FINAL_VIDEO_URL=$(echo $FINAL_STATUS | grep -o '"videoUrl":"[^"]*' | sed 's/"videoUrl":"//g' | sed 's/\\//g')
FINAL_STATUS_TEXT=$(echo $FINAL_STATUS | grep -o '"status":"[^"]*' | sed 's/"status":"//g')

echo "   Status: $FINAL_STATUS_TEXT"
if [ "$FINAL_STATUS_TEXT" = "ready" ]; then
  echo "   ✅ Video is ready!"
  echo "   URL: $FINAL_VIDEO_URL"
else
  echo "   ⏳ Video still processing"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Workflow Test Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Results Summary:"
echo "   ✅ Authentication: Success"
echo "   ✅ Dream Creation: Success"
echo "   ✅ Story Generation: Success"
if [ "$FINAL_STATUS_TEXT" = "ready" ]; then
  echo "   ✅ Video Generation: Success"
else
  echo "   ⚠️  Video Generation: Check logs"
fi
echo ""
echo "🔗 Resources:"
echo "   • Dream in DB: https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/editor"
echo "   • Function Logs: https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/functions/process-dream/logs"
if [ -n "$FINAL_VIDEO_URL" ] && [ "$FINAL_VIDEO_URL" != "null" ]; then
  echo "   • Video URL: $FINAL_VIDEO_URL"
fi
echo ""
echo "📋 Note: Audio input requires real audio recording from frontend/mobile app"
echo "   The function supports audioBase64 + audioMimeType parameters"
echo ""
