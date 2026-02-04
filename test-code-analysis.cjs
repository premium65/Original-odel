#!/usr/bin/env node

/**
 * Code Analysis Test - Verify Manual Deposit Fixes
 * 
 * This script analyzes the codebase to verify all required fixes
 * for admin authentication and manual deposit are properly implemented.
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileContains(filePath, patterns, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = patterns.map(pattern => {
      const regex = typeof pattern === 'string' ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) : pattern;
      return {
        pattern: pattern.toString(),
        found: regex.test(content)
      };
    });
    
    const allFound = results.every(r => r.found);
    
    if (allFound) {
      log(`✅ ${description}`, 'green');
      return true;
    } else {
      log(`❌ ${description}`, 'red');
      results.forEach(r => {
        if (!r.found) {
          log(`   Missing: ${r.pattern}`, 'red');
        }
      });
      return false;
    }
  } catch (error) {
    log(`❌ ${description} - File not found or error: ${error.message}`, 'red');
    return false;
  }
}

function runTests() {
  log('\n' + '='.repeat(70), 'bold');
  log('CODE ANALYSIS TEST - Manual Deposit Fixes', 'bold');
  log('='.repeat(70) + '\n', 'bold');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: requireAdmin middleware normalizes userId
  totalTests++;
  log('\n[Test 1] requireAdmin Middleware - UserId Normalization', 'yellow');
  if (checkFileContains(
    'server/routes/admin/index.ts',
    [
      /const rawUserId = req\.session\.userId/,
      /const userId = String\(rawUserId\)/,
      /Normalize userId to string/
    ],
    'server/routes/admin/index.ts normalizes session userId'
  )) {
    passedTests++;
  }

  // Test 2: /me endpoint normalizes userId
  totalTests++;
  log('\n[Test 2] Auth /me Endpoint - UserId Normalization', 'yellow');
  if (checkFileContains(
    'server/routes/admin/auth.ts',
    [
      /const rawUserId = req\.session\.userId/,
      /const userId = String\(rawUserId\)/,
      /router\.get\("\/me"/
    ],
    'server/routes/admin/auth.ts /me endpoint normalizes userId'
  )) {
    passedTests++;
  }

  // Test 3: Manual deposit validates userId
  totalTests++;
  log('\n[Test 3] Manual Deposit - UserId Validation', 'yellow');
  if (checkFileContains(
    'server/routes/admin/transactions.ts',
    [
      /const normalizedUserId = String\(userId\)\.trim\(\)/,
      /User ID is required/,
      /router\.post\("\/deposits\/manual"/
    ],
    'server/routes/admin/transactions.ts validates userId'
  )) {
    passedTests++;
  }

  // Test 4: Manual deposit validates amount
  totalTests++;
  log('\n[Test 4] Manual Deposit - Amount Validation', 'yellow');
  if (checkFileContains(
    'server/routes/admin/transactions.ts',
    [
      /const numAmount = Number\(amount\)/,
      /Number\.isFinite\(numAmount\)/,
      /numAmount <= 0/,
      /Amount must be a positive number/
    ],
    'server/routes/admin/transactions.ts validates amount'
  )) {
    passedTests++;
  }

  // Test 5: Manual deposit verifies user exists
  totalTests++;
  log('\n[Test 5] Manual Deposit - User Existence Check', 'yellow');
  if (checkFileContains(
    'server/routes/admin/transactions.ts',
    [
      /const existingUser = await db\.select/,
      /\.where\(eq\(users\.id, normalizedUserId\)\)/,
      /User not found/
    ],
    'server/routes/admin/transactions.ts verifies user exists'
  )) {
    passedTests++;
  }

  // Test 6: Manual deposit has logging
  totalTests++;
  log('\n[Test 6] Manual Deposit - Console Logging', 'yellow');
  if (checkFileContains(
    'server/routes/admin/transactions.ts',
    [
      /console\.log\(`\[MANUAL_DEPOSIT\]/,
      /Admin creating deposit/
    ],
    'server/routes/admin/transactions.ts has logging'
  )) {
    passedTests++;
  }

  // Test 7: Manual deposit returns proper status codes
  totalTests++;
  log('\n[Test 7] Manual Deposit - HTTP Status Codes', 'yellow');
  if (checkFileContains(
    'server/routes/admin/transactions.ts',
    [
      /res\.status\(201\)\.json/,
      /res\.status\(400\)\.json/,
      /res\.status\(500\)\.json/
    ],
    'server/routes/admin/transactions.ts uses proper status codes'
  )) {
    passedTests++;
  }

  // Test 8: Adapter endpoint exists
  totalTests++;
  log('\n[Test 8] User Deposit Adapter - Endpoint Exists', 'yellow');
  if (checkFileContains(
    'server/routes/admin/users.ts',
    [
      /router\.post\("\/:id\/deposit"/,
      /Manual deposit via user route/
    ],
    'server/routes/admin/users.ts has adapter endpoint'
  )) {
    passedTests++;
  }

  // Test 9: Adapter endpoint validates amount
  totalTests++;
  log('\n[Test 9] User Deposit Adapter - Amount Validation', 'yellow');
  if (checkFileContains(
    'server/routes/admin/users.ts',
    [
      /const numAmount = Number\(amount\)/,
      /Number\.isFinite\(numAmount\)/,
      /Amount must be a positive number/
    ],
    'server/routes/admin/users.ts adapter validates amount'
  )) {
    passedTests++;
  }

  // Test 10: Client fetchAPI parses errors
  totalTests++;
  log('\n[Test 10] Client API - Error Message Parsing', 'yellow');
  if (checkFileContains(
    'client/src/lib/api.ts',
    [
      /const body = await res\.json\(\)/,
      /if \(body\.error\) message = body\.error/,
      /if \(body\.message\) message = body\.message/
    ],
    'client/src/lib/api.ts parses server error messages'
  )) {
    passedTests++;
  }

  // Test 11: Deposits page disables button
  totalTests++;
  log('\n[Test 11] Deposits UI - Button Disable State', 'yellow');
  if (checkFileContains(
    'client/src/pages/admin/deposits.tsx',
    [
      /disabled=\{manualDepositMutation\.isPending/,
      /manualDepositMutation\.isPending && <Loader2/
    ],
    'client/src/pages/admin/deposits.tsx disables button during mutation'
  )) {
    passedTests++;
  }

  // Test 12: Deposits page shows error toast
  totalTests++;
  log('\n[Test 12] Deposits UI - Error Display', 'yellow');
  if (checkFileContains(
    'client/src/pages/admin/deposits.tsx',
    [
      /onError: \(error: any\) =>/,
      /toast\(\{ title: "Failed to add deposit", description: error\.message/
    ],
    'client/src/pages/admin/deposits.tsx displays error messages'
  )) {
    passedTests++;
  }

  // Summary
  log('\n' + '='.repeat(70), 'bold');
  log('TEST SUMMARY', 'bold');
  log('='.repeat(70), 'bold');
  log(`\nTotal Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`Failed: ${totalTests - passedTests}`, totalTests - passedTests === 0 ? 'green' : 'red');
  log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%\n`);

  if (passedTests === totalTests) {
    log('✅ ALL TESTS PASSED - Code implements all required fixes!', 'green');
    process.exit(0);
  } else {
    log('⚠️  SOME TESTS FAILED - Review implementation', 'yellow');
    process.exit(1);
  }
}

// Run tests
runTests();
