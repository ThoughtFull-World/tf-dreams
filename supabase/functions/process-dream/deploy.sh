#!/bin/bash

# Deploy script for Dream Journal Edge Function
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying Dream Journal Edge Function..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase."
    echo "Run: supabase login"
    exit 1
fi

# Deploy function
echo "📦 Deploying function..."
supabase functions deploy process-dream

echo "✅ Deployment complete!"
echo ""
echo "Your function is available at:"
echo "https://<your-project-ref>.supabase.co/functions/v1/process-dream"
echo ""
echo "View logs with:"
echo "supabase functions logs process-dream"

