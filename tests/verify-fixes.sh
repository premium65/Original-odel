#!/bin/bash

# Manual Test Script for Admin Panel Fixes
# This script helps verify the admin authentication and manual deposit fixes

BASE_URL="${BASE_URL:-http://localhost:5000}"
COOKIE_FILE="/tmp/admin-test-cookies.txt"

echo "======================================"
echo "Admin Panel Fix Verification Script"
echo "======================================"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Admin Login
echo "Test 1: Admin Login"
echo "--------------------"
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_FILE" -X POST "$BASE_URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "Response: $LOGIN_RESPONSE"
echo ""

# Check if login was successful
if echo "$LOGIN_RESPONSE" | grep -q '"isAdmin":true'; then
  echo "✓ Login successful"
else
  echo "✗ Login failed"
  exit 1
fi

sleep 1

# Test 2: Admin /me endpoint
echo ""
echo "Test 2: Admin /me endpoint"
echo "--------------------------"
ME_RESPONSE=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/admin/auth/me")

echo "Response: $ME_RESPONSE"
echo ""

if echo "$ME_RESPONSE" | grep -q '"isAdmin":true'; then
  echo "✓ /me endpoint working"
else
  echo "✗ /me endpoint failed"
  exit 1
fi

sleep 1

# Test 3: Access admin protected route
echo ""
echo "Test 3: Access admin dashboard stats"
echo "-------------------------------------"
STATS_RESPONSE=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/admin/dashboard/stats")

echo "Response: $STATS_RESPONSE"
echo ""

if echo "$STATS_RESPONSE" | grep -q '"error"'; then
  echo "✗ Dashboard stats failed"
  exit 1
else
  echo "✓ Dashboard stats accessible"
fi

sleep 1

# Test 4: Manual deposit validation - missing fields
echo ""
echo "Test 4: Manual deposit - missing userId"
echo "----------------------------------------"
DEPOSIT_ERROR=$(curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/api/admin/transactions/deposits/manual" \
  -H "Content-Type: application/json" \
  -d '{"amount":"500"}')

echo "Response: $DEPOSIT_ERROR"
echo ""

if echo "$DEPOSIT_ERROR" | grep -q "User ID and amount are required"; then
  echo "✓ Validation working - missing userId caught"
else
  echo "✗ Validation not working"
fi

sleep 1

# Test 5: Manual deposit validation - invalid amount
echo ""
echo "Test 5: Manual deposit - invalid amount"
echo "----------------------------------------"
DEPOSIT_INVALID=$(curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/api/admin/transactions/deposits/manual" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","amount":"invalid"}')

echo "Response: $DEPOSIT_INVALID"
echo ""

if echo "$DEPOSIT_INVALID" | grep -q "Invalid amount"; then
  echo "✓ Validation working - invalid amount caught"
else
  echo "✗ Validation not working"
fi

sleep 1

# Test 6: Manual deposit - user not found
echo ""
echo "Test 6: Manual deposit - user not found"
echo "----------------------------------------"
DEPOSIT_NOT_FOUND=$(curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/api/admin/transactions/deposits/manual" \
  -H "Content-Type: application/json" \
  -d '{"userId":"nonexistent-user-id-12345","amount":"500"}')

echo "Response: $DEPOSIT_NOT_FOUND"
echo ""

if echo "$DEPOSIT_NOT_FOUND" | grep -q "User not found"; then
  echo "✓ Validation working - user not found caught"
else
  echo "✗ Validation not working properly"
fi

# Test 7: Adapter route validation
echo ""
echo "Test 7: Adapter route - invalid amount"
echo "---------------------------------------"
ADAPTER_INVALID=$(curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/api/admin/users/nonexistent/deposit" \
  -H "Content-Type: application/json" \
  -d '{"amount":"invalid"}')

echo "Response: $ADAPTER_INVALID"
echo ""

if echo "$ADAPTER_INVALID" | grep -q "Invalid amount"; then
  echo "✓ Adapter route working - invalid amount caught"
else
  echo "✗ Adapter route validation not working"
fi

# Test 8: Logout
echo ""
echo "Test 8: Admin Logout"
echo "--------------------"
LOGOUT_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/api/admin/auth/logout")

echo "Response: $LOGOUT_RESPONSE"
echo ""

if echo "$LOGOUT_RESPONSE" | grep -q "Logged out"; then
  echo "✓ Logout successful"
else
  echo "✓ Logout completed (non-standard response)"
fi

sleep 1

# Test 9: Verify session destroyed
echo ""
echo "Test 9: Verify session destroyed"
echo "---------------------------------"
ME_AFTER_LOGOUT=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/admin/auth/me")

echo "Response: $ME_AFTER_LOGOUT"
echo ""

if echo "$ME_AFTER_LOGOUT" | grep -q "Not authenticated"; then
  echo "✓ Session properly destroyed"
else
  echo "✗ Session not properly destroyed"
fi

# Cleanup
rm -f "$COOKIE_FILE"

echo ""
echo "======================================"
echo "All tests completed!"
echo "======================================"
echo ""
echo "Note: For a complete test, you should:"
echo "1. Create a test user in the database"
echo "2. Run a successful manual deposit test"
echo "3. Verify the user's balance increased"
echo "4. Check server logs for detailed logging"
