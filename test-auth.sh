#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUPABASE_URL="https://vnoyyctltxouigjyqvav.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZub3l5Y3RsdHhvdWlnanlxdmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3Njg2NzAsImV4cCI6MjA3NjM0NDY3MH0.BX3aB2FedpSVJy27cBcC8b32WXb-lMGeDC9St8SeP-k"

# Generate random email for testing
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 Testing Authentication Functions${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# TEST 1: SIGNUP
# ============================================================================
echo -e "${YELLOW}📝 Test 1: User Signup${NC}"
echo "   Email: $TEST_EMAIL"
echo "   Password: $TEST_PASSWORD"
echo ""

SIGNUP_START=$(date +%s)
SIGNUP_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/signup" \
  -H "Content-Type: application/json" \
  -H "apikey: ${ANON_KEY}" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"metadata\": {
      \"name\": \"Test User\"
    }
  }")
SIGNUP_END=$(date +%s)
SIGNUP_DURATION=$((SIGNUP_END - SIGNUP_START))

# Check if signup was successful
if echo "$SIGNUP_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Signup successful!${NC}"
  echo "   Duration: ${SIGNUP_DURATION}s"
  
  # Extract user ID
  USER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "   User ID: $USER_ID"
else
  echo -e "${RED}❌ Signup failed${NC}"
  echo "   Response: $SIGNUP_RESPONSE"
  exit 1
fi
echo ""

# ============================================================================
# TEST 2: LOGIN
# ============================================================================
echo -e "${YELLOW}🔑 Test 2: User Login${NC}"
echo "   Email: $TEST_EMAIL"
echo ""

LOGIN_START=$(date +%s)
LOGIN_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/login" \
  -H "Content-Type: application/json" \
  -H "apikey: ${ANON_KEY}" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")
LOGIN_END=$(date +%s)
LOGIN_DURATION=$((LOGIN_END - LOGIN_START))

# Check if login was successful
if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Login successful!${NC}"
  echo "   Duration: ${LOGIN_DURATION}s"
  
  # Extract tokens
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
  echo "   Access Token: ${ACCESS_TOKEN:0:50}..."
else
  echo -e "${RED}❌ Login failed${NC}"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

# ============================================================================
# TEST 3: INVALID LOGIN
# ============================================================================
echo -e "${YELLOW}🚫 Test 3: Invalid Login (Should Fail)${NC}"

INVALID_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/login" \
  -H "Content-Type: application/json" \
  -H "apikey: ${ANON_KEY}" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"WrongPassword123!\"
  }")

if echo "$INVALID_RESPONSE" | grep -q '"success":false'; then
  echo -e "${GREEN}✅ Invalid login correctly rejected${NC}"
else
  echo -e "${RED}❌ Invalid login should have failed${NC}"
  echo "   Response: $INVALID_RESPONSE"
fi
echo ""

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Authentication Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "✅ Signup Function: Working"
echo "✅ Login Function: Working"
echo "✅ Authentication: Working"
echo ""
echo "🔑 Test Credentials:"
echo "   Email: $TEST_EMAIL"
echo "   Password: $TEST_PASSWORD"
echo "   User ID: $USER_ID"
echo ""
echo "🎯 Next Step: Use this access token for authenticated requests"
echo "   Authorization: Bearer $ACCESS_TOKEN"
echo ""

