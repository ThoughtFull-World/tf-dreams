#!/bin/bash

# Start ngrok for Dream Journal App
# Usage: ./start-ngrok.sh

echo "🚀 Starting ngrok tunnel for localhost:3000..."
echo ""

# Check if ngrok is configured
if ! ~/bin/ngrok config check &>/dev/null; then
    echo "❌ ngrok is not configured!"
    echo ""
    echo "Please run:"
    echo "  ~/bin/ngrok config add-authtoken YOUR_TOKEN_HERE"
    echo ""
    echo "Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    exit 1
fi

# Start ngrok
~/bin/ngrok http 3000 --log=stdout 2>&1 | tee /tmp/ngrok.log &
NGROK_PID=$!

echo "⏳ Waiting for ngrok to start..."
sleep 3

# Get the public URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Checking logs..."
    cat /tmp/ngrok.log | tail -10
    exit 1
fi

echo ""
echo "✅ ngrok is running!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Your public URL:"
echo "   $NGROK_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Next steps:"
echo ""
echo "1. Update Supabase Dashboard:"
echo "   → Go to: https://supabase.com/dashboard/project/vnoyyctltxouigjyqvav/auth/url-configuration"
echo "   → Set Site URL to: $NGROK_URL"
echo "   → Add to Redirect URLs: ${NGROK_URL}/**"
echo ""
echo "2. Update .env.local:"
echo "   NEXT_PUBLIC_BASE_URL=$NGROK_URL"
echo ""
echo "3. Restart your Next.js dev server"
echo ""
echo "4. Open in browser: $NGROK_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Magic links will now work!"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo ""

# Wait for ngrok process
wait $NGROK_PID

