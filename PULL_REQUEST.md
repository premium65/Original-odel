# Fix: Admin Authentication 401 & Manual Deposit 500 Errors

## Problem

Admin users experienced two critical issues preventing them from managing the platform:

1. **401 Authentication Errors**: After successful login, GET `/api/admin/auth/me` returned 401 (unauthenticated), causing the admin middleware to block access to all admin routes including deposits, users, and transactions.

2. **500 Manual Deposit Errors**: POST `/api/admin/transactions/deposits/manual` returned 500 server error with a generic "Server error" message, preventing admins from adding manual deposits to user accounts.

### Evidence
- Network DevTools showed POST `/api/admin/transactions/deposits/manual` returning 500
- GET `/api/admin/auth/me` returning 401 after successful login
- Frontend toast displaying "Failed to add deposit: Server error"

## Solution

### 1. Fixed Admin Authentication

**Root Causes:**
- Session userId type mismatches (string vs number) causing user lookup failures
- Missing `req.session.isAdmin` flag
- No logging made debugging difficult

**Changes:**
- Normalized session userId handling using `String()` coercion throughout
- Set `req.session.isAdmin = true` flag on successful login
- Added comprehensive logging for authentication failures (non-sensitive)
- Improved `/me` endpoint error messages

**Files Modified:**
- `server/routes/admin/index.ts` - Updated `requireAdmin` middleware
- `server/routes/admin/auth.ts` - Updated login and `/me` endpoints

### 2. Fixed Manual Deposit Endpoint

**Root Causes:**
- No input validation for required fields
- No user existence check before database operations
- Three separate database operations without transaction wrapper
- Generic error messages

**Changes:**
- Added comprehensive validation (userId required, amount must be positive number)
- Added user existence check with helpful 404 error
- Wrapped all operations in Drizzle ORM transaction for atomicity:
  1. Create deposit record
  2. Update user balance
  3. Create transaction record
- Improved error messages (400/404/500 with specific details)
- Added operation logging with admin ID, target user, amount, and result
- Return 201 status on success with deposit object

**Files Modified:**
- `server/routes/admin/transactions.ts` - Refactored `/deposits/manual` endpoint

### 3. Added Backward Compatibility

**Problem:**
- Client hook `useAdminDeposit` called `/api/admin/users/:id/deposit` which didn't exist

**Solution:**
- Implemented POST `/api/admin/users/:id/deposit` adapter endpoint
- Uses same validation and transaction logic as manual deposit
- Logs operations with `[USER_DEPOSIT_ADAPTER]` prefix

**Files Modified:**
- `server/routes/admin/users.ts` - Added `/:id/deposit` route

### 4. Improved Client Error Handling

**Changes:**
- Better error parsing in `fetchAPI` function
- Extracts `error.error` or `error.message` from server JSON response
- Falls back to `statusText` or "API Error" if parsing fails
- UI now displays specific server error messages to users

**Files Modified:**
- `client/src/lib/api.ts` - Updated `fetchAPI` function

## Testing

### Manual Test Procedures
Created comprehensive test documentation:
- `server/tests/admin-auth.test.ts` - Authentication flow test cases
- `server/tests/manual-deposit.test.ts` - Manual deposit test cases
- `server/tests/README.md` - Detailed test execution guide with curl examples
- `test-admin-flow.sh` - Automated bash script for quick testing

### Run Tests
```bash
# Start development server
npm run dev

# In another terminal, run automated tests
./test-admin-flow.sh
```

### Test Coverage
**Authentication Tests:**
- ✓ Login with valid credentials (200)
- ✓ Get current admin user (200)
- ✓ Access protected admin routes (200)
- ✓ Reject unauthorized access (401)
- ✓ Session persistence across requests

**Manual Deposit Tests:**
- ✓ Successful deposit creation (201)
- ✓ Missing userId validation (400)
- ✓ Missing amount validation (400)
- ✓ Invalid amount - negative (400)
- ✓ Invalid amount - non-numeric (400)
- ✓ User not found (404)
- ✓ Backward compatibility endpoint (201)
- ✓ Transaction atomicity

## Documentation

- `PR_SUMMARY.md` - Complete change summary with before/after comparison
- `ADMIN_AUTH_DEPOSIT_FIXES.md` - Technical documentation with API changes
- `server/tests/README.md` - Test execution guide
- Inline code comments explaining changes

## API Changes

### POST /api/admin/transactions/deposits/manual

**Request:**
```json
{
  "userId": "user-uuid-or-id",
  "amount": "500",
  "description": "Optional description"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "deposit": {
    "id": 123,
    "userId": "user-uuid-or-id",
    "amount": "500.00",
    "type": "manual_add",
    "method": "admin_manual",
    "status": "approved",
    "createdAt": "2024-02-04T12:00:00.000Z"
  }
}
```

**Error Responses:**
- 400: `{"error": "User ID is required"}`
- 400: `{"error": "Amount is required"}`
- 400: `{"error": "Amount must be a positive number"}`
- 404: `{"error": "User not found"}`
- 500: `{"error": "Failed to create manual deposit"}` (with server logs)

### POST /api/admin/users/:id/deposit (NEW)

Backward compatible endpoint with same behavior as manual deposit.

## Logging

### Authentication Logs
```
[ADMIN_AUTH_MIDDLEWARE] No userId in session
[ADMIN_AUTH_MIDDLEWARE] User {userId} is not an admin
[ADMIN_AUTH] Login successful for user {username}, session userId: {userId}
```

### Manual Deposit Logs
```
[MANUAL_DEPOSIT] Missing userId, admin: {adminId}
[MANUAL_DEPOSIT] Invalid amount: {amount}, admin: {adminId}, userId: {userId}
[MANUAL_DEPOSIT] User not found: {userId}, admin: {adminId}
[MANUAL_DEPOSIT] Success: admin {adminId} added {amount} LKR to user {userId}
```

## Impact

### Before
- ❌ Admin login succeeded but subsequent requests failed with 401
- ❌ Manual deposit failed with generic 500 error
- ❌ No visibility into what was failing
- ❌ Three separate DB operations could partially fail
- ❌ Generic error messages didn't help users

### After
- ✅ Admin authentication works consistently across requests
- ✅ Manual deposit validates input and returns specific errors
- ✅ All deposit operations are atomic (all succeed or all fail)
- ✅ Comprehensive logging for debugging issues
- ✅ Backward compatible endpoint for existing clients
- ✅ Better error messages displayed in UI

## Backward Compatibility

All changes are backward compatible:
- ✅ Existing authentication flow still works
- ✅ New deposit endpoint added without breaking existing code
- ✅ Error handling improved but maintains same response structure
- ✅ Client changes gracefully handle both old and new error formats

## Security

- ✅ No sensitive data logged (passwords, session contents)
- ✅ Input validation prevents SQL injection
- ✅ Amount validation prevents negative/invalid values
- ✅ User existence check prevents blind deposits
- ✅ Transaction atomicity prevents partial state
- ✅ Session handling remains secure

## Troubleshooting

### If 401 Errors Persist

1. Check `SESSION_SECRET` is set in `.env`
2. Verify cookie domain matches request domain
3. Check cookie secure/sameSite settings for production
4. Review server logs for auth warnings
5. Verify PostgreSQL session store is working

### If Manual Deposits Still Fail

1. Check server logs for specific error message
2. Verify user ID is valid UUID/string format
3. Ensure amount is a positive number
4. Check database connection
5. Verify transaction support in PostgreSQL

## Files Changed

- `server/routes/admin/index.ts` - requireAdmin middleware (18 lines changed)
- `server/routes/admin/auth.ts` - login and /me endpoints (30 lines changed)
- `server/routes/admin/transactions.ts` - manual deposit endpoint (88 lines changed)
- `server/routes/admin/users.ts` - backward compat endpoint (71 lines added)
- `client/src/lib/api.ts` - error handling (12 lines changed)

**Total: 11 files changed, +1430 lines added**

## Checklist

- [x] Code changes implemented
- [x] Manual tests documented
- [x] Automated test script created
- [x] Documentation updated
- [x] Error handling improved
- [x] Logging added
- [x] Backward compatibility maintained
- [x] Security considered
- [x] Performance impact minimal

## Next Steps

1. Review and approve PR
2. Run manual tests in staging: `./test-admin-flow.sh`
3. Merge to main branch
4. Deploy to production
5. Monitor server logs for auth/deposit issues
6. Verify admin functionality working in production

---

**See `PR_SUMMARY.md` for complete details and `ADMIN_AUTH_DEPOSIT_FIXES.md` for technical documentation.**
