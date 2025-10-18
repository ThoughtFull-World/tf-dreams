#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎨 Frontend Setup for Dream Journal${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
  echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
  echo ""
  read -p "Do you want to overwrite it? (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✓ Keeping existing .env.local${NC}"
    exit 0
  fi
fi

# Create .env.local file
echo -e "${BLUE}📝 Creating .env.local file...${NC}"

cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://vnoyyctltxouigjyqvav.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZub3l5Y3RsdHhvdWlnanlxdmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3Njg2NzAsImV4cCI6MjA3NjM0NDY3MH0.BX3aB2FedpSVJy27cBcC8b32WXb-lMGeDC9St8SeP-k
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF

echo -e "${GREEN}✓ .env.local created successfully!${NC}"
echo ""

# Check if dependencies are installed
echo -e "${BLUE}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ] || [ ! -d "node_modules/@supabase" ]; then
  echo -e "${YELLOW}⚠️  Dependencies not found. Installing...${NC}"
  npm install
  echo -e "${GREEN}✓ Dependencies installed!${NC}"
else
  echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Display summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Frontend Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Environment Variables:"
echo "   ✓ NEXT_PUBLIC_SUPABASE_URL"
echo "   ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   ✓ NEXT_PUBLIC_BASE_URL"
echo ""
echo "🚀 Next Steps:"
echo "   1. Run: npm run dev"
echo "   2. Open: http://localhost:3000"
echo "   3. Test recording a dream"
echo "   4. Sign up/Login when prompted"
echo ""
echo "📖 Documentation:"
echo "   - See FRONTEND_INTEGRATION_GUIDE.md for details"
echo "   - See COMPLETE_WORKFLOW.md for API reference"
echo ""
echo -e "${GREEN}Happy dream making! ✨${NC}"
echo ""

