#!/bin/bash

# Check recent dreams with video status

SUPABASE_URL="https://vnoyyctltxouigjyqvav.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZub3l5Y3RsdHhvdWlnanlxdmF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc2ODY3MCwiZXhwIjoyMDc2MzQ0NjcwfQ.5V0rNVPVFJHe5Z0Gv0Y-Y_CiXhZPjQyBfBe9YwYq5AI"

echo "🔍 Checking recent dreams with videos..."
echo ""

curl -s "${SUPABASE_URL}/rest/v1/story_nodes?select=id,content,video_url,video_status&order=created_at.desc&limit=5" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" | jq -r '.[] | "Dream: \(.id)\nVideo URL: \(.video_url // "none")\nStatus: \(.video_status // "none")\n---"'

