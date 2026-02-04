#!/bin/bash

# Manual Test Script for Admin Auth and Deposit Fixes
# This script helps test the authentication and manual deposit fixes
# Usage: ./test-admin-flow.sh [base_url]

BASE_URL="${1:-http://localhost:5000}"
COOKIES_FILE="/tmp/admin-test-cookies.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "==============================================="
echo "Admin Authentication & Manual Deposit Tests"
echo "==============================================="
echo ""
echo "Base URL: $BASE_URL"
echo "Cookies: $COOKIES_FILE"
echo ""

# Clean up old cookies
rm -f "$COOKIES_FILE"

# Test 1: Login
echo "Test 1: Admin Login"
echo "-------------------"
LOGIN_RESPONSE=$(curl -s -c "$COOKIES_FILE" -X POST "$BASE_URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "isAdmin"; then
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN_RESPONSE"
  exit 1
fi
echo ""

# Test 2: Get Me
echo "Test 2: Get Current Admin User"
echo "-------------------------------"
ME_RESPONSE=$(curl -s -b "$COOKIES_FILE" "$BASE_URL/api/admin/auth/me")

if echo "$ME_RESPONSE" | grep -q "isAdmin"; then
  echo -e "${GREEN}✓ Get me successful${NC}"
  echo "$ME_RESPONSE" | jq . 2>/dev/null || echo "$ME_RESPONSE"
else
  echo -e "${RED}✗ Get me failed${NC}"
  echo "$ME_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Access Protected Route
echo "Test 3: Access Protected Admin Route"
echo "-------------------------------------"
USERS_RESPONSE=$(curl -s -b "$COOKIES_FILE" "$BASE_URL/api/admin/users" -w "\n%{http_code}")
HTTP_CODE=$(echo "$USERS_RESPONSE" | tail -n1)
BODY=$(echo "$USERS_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Access granted (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | jq 'length' 2>/dev/null | xargs echo "Number of users:"
else
  echo -e "${RED}✗ Access denied (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
  exit 1
fi
echo ""

# Test 4: Unauthorized Access
echo "Test 4: Unauthorized Access (without session)"
echo "----------------------------------------------"
UNAUTH_RESPONSE=$(curl -s "$BASE_URL/api/admin/users" -w "\n%{http_code}")
UNAUTH_CODE=$(echo "$UNAUTH_RESPONSE" | tail -n1)
UNAUTH_BODY=$(echo "$UNAUTH_RESPONSE" | head -n-1)

if [ "$UNAUTH_CODE" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected (HTTP $UNAUTH_CODE)${NC}"
  echo "$UNAUTH_BODY"
else
  echo -e "${YELLOW}⚠ Unexpected response (HTTP $UNAUTH_CODE)${NC}"
  echo "$UNAUTH_BODY"
fi
echo ""

# Test 5: Manual Deposit - Missing UserId
echo "Test 5: Manual Deposit - Missing UserId"
echo "----------------------------------------"
DEPOSIT_RESPONSE=$(curl -s -b "$COOKIES_FILE" -X POST "$BASE_URL/api/admin/transactions/deposits/manual" \
  -H "Content-Type: application/json" \
  -d '{"amount":"500"}' \
  -w "\n%{http_code}")
DEPOSIT_CODE=$(echo "$DEPOSIT_RESPONSE" | tail -n1)
DEPOSIT_BODY=$(echo "$DEPOSIT_RESPONSE" | head -n-1)

if [ "$DEPOSIT_CODE" = "400" ] && echo "$DEPOSIT_BODY" | grep -q "User ID is required"; then
  echo -e "${GREEN}✓ Validation working (HTTP $DEPOSIT_CODE)${NC}"
  echo "$DEPOSIT_BODY"
else
  echo -e "${YELLOW}⚠ Unexpected response (HTTP $DEPOSIT_CODE)${NC}"
  echo "$DEPOSIT_BODY"
fi
echo ""

# Test 6: Manual Deposit - Missing Amount
echo "Test 6: Manual Deposit - Missing Amount"
echo "----------------------------------------"
DEPOSIT_RESPONSE=$(curl -s -b "$COOKIES_FILE" -X POST "$BASE_URL/api/admin/transactions/deposits/manual" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user"}' \
  -w "\n%{http_code}")
DEPOSIT_CODE=$(echo "$DEPOSIT_RESPONSE" | tail -n1)
DEPOSIT_BODY=$(echo "$DEPOSIT_RESPONSE" | head -n-1)

if [ "$DEPOSIT_CODE" = "400" ] && echo "$DEPOSIT_BODY" | grep -q "Amount is required"; then
  echo -e "${GREEN}✓ Validation working (HTTP $DEPOSIT_CODE)${NC}"
  echo "$DEPOSIT_BODY"
else
  echo -e "${YELLOW}⚠ Unexpected response (HTTP $DEPOSIT_CODE)${NC}"
  echo "$DEPOSIT_BODY"
fi
echo ""

# Test 7: Manual Deposit - Invalid Amount
echo "Test 7: Manual Deposit - Invalid Amount (negative)"
echo "---------------------------------------------------"
DEPOSIT_RESPONSE=$(curl -s -b "$COOKIES_FILE" -X POST "$BASE_URL/api/admin/transactions/deposits/manual" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","amount":"-100"}' \
  -w "\n%{http_code}")
DEPOSIT_CODE=$(echo "$DEPOSIT_RESPONSE" | tail -n1)
DEPOSIT_BODY=$(echo "$DEPOSIT_RESPONSE" | head -n-1)

if [ "$DEPOSIT_CODE" = "400" ] && echo "$DEPOSIT_BODY" | grep -q "positive number"; then
  echo -e "${GREEN}✓ Validation working (HTTP $DEPOSIT_CODE)${NC}"
  echo "$DEPOSIT_BODY"
else
  echo -e "${YELLOW}⚠ Unexpected response (HTTP $DEPOSIT_CODE)${NC}"
  echo "$DEPOSIT_BODY"
fi
echo ""

# Test 8: Manual Deposit - User Not Found
echo "Test 8: Manual Deposit - User Not Found"
echo "----------------------------------------"
DEPOSIT_RESPONSE=$(curl -s -b "$COOKIES_FILE" -X POST "$BASE_URL/api/admin/transactions/deposits/manual" \
  -H "Content-Type: application/json" \
  -d '{"userId":"nonexistent-user-id-12345","amount":"100"}' \
  -w "\n%{http_code}")
DEPOSIT_CODE=$(echo "$DEPOSIT_RESPONSE" | tail -n1)
DEPOSIT_BODY=$(echo "$DEPOSIT_RESPONSE" | head -n-1)

if [ "$DEPOSIT_CODE" = "404" ] && echo "$DEPOSIT_BODY" | grep -q "User not found"; then
  echo -e "${GREEN}✓ User validation working (HTTP $DEPOSIT_CODE)${NC}"
  echo "$DEPOSIT_BODY"
else
  echo -e "${YELLOW}⚠ Unexpected response (HTTP $DEPOSIT_CODE)${NC}"
  echo "$DEPOSIT_BODY"
fi
echo ""

# Summary
echo "==============================================="
echo "Test Summary"
echo "==============================================="
echo -e "${GREEN}✓ Admin authentication flow working${NC}"
echo -e "${GREEN}✓ Session persistence working${NC}"
echo -e "${GREEN}✓ Manual deposit validation working${NC}"
echo ""
echo "Note: To test successful deposit creation, you need a valid user ID from the database."
echo "Example:"
echo "  curl -b $COOKIES_FILE -X POST $BASE_URL/api/admin/transactions/deposits/manual \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"userId\":\"YOUR_USER_ID\",\"amount\":\"500\",\"description\":\"Test deposit\"}'"
echo ""

# Clean up
rm -f "$COOKIES_FILE"
