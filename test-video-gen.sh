#!/bin/bash

# Test video generation for the most recent dream without a video

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SUPABASE_URL="https://vnoyyctltxouigjyqvav.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZub3l5Y3RsdHhvdWlnanlxdmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3Njg2NzAsImV4cCI6MjA3NjM0NDY3MH0.BX3aB2FedpSVJy27cBcC8b32WXb-lMGeDC9St8SeP-k"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎬 Manual Video Generation Test${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Login first
echo -e "${YELLOW}🔐 Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ian.yap@thoughtfull.world","password":"Ianmental@1988"}')

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Get the most recent dream without a video
echo -e "${YELLOW}📝 Finding recent dream without video...${NC}"
NODE_ID="1af68c68-746d-45e6-85d5-4bc9356735e3"  # From diagnostic
echo "Node ID: $NODE_ID"
echo ""

# Try to generate video
echo -e "${YELLOW}🎥 Triggering video generation...${NC}"
VIDEO_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/generate-video" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"storyNodeId\":\"$NODE_ID\"}")

echo ""
echo -e "${GREEN}Response:${NC}"
echo "$VIDEO_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$VIDEO_RESPONSE"
echo ""

# Check if it succeeded
if echo "$VIDEO_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Video generation started!${NC}"
  echo ""
  echo "Wait 2-3 minutes, then check the database:"
  echo "👉 https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/editor"
else
  echo -e "${YELLOW}⚠️  Check the response for errors${NC}"
fi

echo ""

