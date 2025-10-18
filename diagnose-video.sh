#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Video Generation Diagnostic${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check recent dreams
echo -e "${YELLOW}📊 Recent Dreams Status:${NC}"
echo ""

SUPABASE_URL="https://vnoyyctltxouigjyqvav.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZub3l5Y3RsdHhvdWlnanlxdmF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc2ODY3MCwiZXhwIjoyMDc2MzQ0NjcwfQ.BboM-5OEL_6l7vML4VdOzrWuGf2jPe67wJv4QrsRdXQ"

DREAMS=$(curl -s "${SUPABASE_URL}/rest/v1/story_nodes?select=id,created_at,video_url&order=created_at.desc&limit=5" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}")

echo "$DREAMS" | python3 -c "
import sys, json
from datetime import datetime

data = json.load(sys.stdin)
print('ID                                   | Age (hours) | Video')
print('-------------------------------------|-------------|-------')
for item in data:
    created = datetime.fromisoformat(item['created_at'].replace('Z', '+00:00'))
    now = datetime.now(created.tzinfo)
    age_hours = (now - created).total_seconds() / 3600
    has_video = '✅' if item.get('video_url') else '❌'
    print(f\"{item['id']} | {age_hours:11.1f} | {has_video}\")
"

echo ""
echo -e "${YELLOW}🔑 Environment Check:${NC}"

# Check if secrets are configured
npx supabase secrets list 2>/dev/null | grep -E "FAL_API_KEY|OPENAI_API_KEY|ELEVENLABS_API_KEY|MEM0_API_KEY|R2_"

echo ""
echo -e "${YELLOW}📝 Function Logs (last 20 lines):${NC}"
echo ""
echo "Note: You can view full logs in Supabase Dashboard:"
echo "👉 https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/functions"
echo ""

# Get recent function logs
npx supabase functions logs process-dream --limit 20 2>/dev/null || echo "Cannot fetch logs via CLI (use Dashboard instead)"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 Diagnosis:${NC}"
echo ""

# Count videos
TOTAL=$(echo "$DREAMS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
WITH_VIDEO=$(echo "$DREAMS" | python3 -c "import sys, json; print(sum(1 for x in json.load(sys.stdin) if x.get('video_url')))")
WITHOUT_VIDEO=$((TOTAL - WITH_VIDEO))

if [ $WITHOUT_VIDEO -gt 2 ]; then
  echo -e "${RED}❌ Issue Detected: $WITHOUT_VIDEO recent dreams have no video${NC}"
  echo ""
  echo "Possible causes:"
  echo "  1. Fal.ai API key not configured"
  echo "  2. Fal.ai account out of credits"
  echo "  3. Async video generation not triggering"
  echo "  4. Function timeout (Edge Functions have 150s limit)"
  echo ""
  echo "Recommendations:"
  echo "  • Check Fal.ai balance: https://fal.ai/dashboard/billing"
  echo "  • View function logs in Dashboard"
  echo "  • Check FAL_API_KEY is configured in secrets"
else
  echo -e "${GREEN}✅ Video generation appears to be working${NC}"
fi

echo ""

