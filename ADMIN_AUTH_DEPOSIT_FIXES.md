# Admin Authentication & Manual Deposit Fixes

## Overview

This document describes the fixes implemented to resolve admin authentication and manual deposit issues in the ODEL ADS platform.

## Issues Fixed

### 1. Admin Authentication (401 Errors)

**Problem:**
- GET `/api/admin/auth/me` returned 401 (unauthenticated) after successful login
- `requireAdmin` middleware blocked admin routes even with valid sessions
- Session userId type mismatches (string vs number) caused user lookup failures

**Root Causes:**
- Inconsistent session userId handling across different storage backends
- No type normalization when retrieving `req.session.userId`
- Insufficient logging made debugging difficult

**Solution:**
- Normalized session userId handling using `String()` coercion
- Added logging for authentication failures (non-sensitive)
- Ensured login sets `req.session.isAdmin = true` flag
- Added explicit session save with callback

**Files Modified:**
- `server/routes/admin/index.ts` - Updated `requireAdmin` middleware
- `server/routes/admin/auth.ts` - Updated login and `/me` endpoints

### 2. Manual Deposit Endpoint (500 Errors)

**Problem:**
- POST `/api/admin/transactions/deposits/manual` returned 500 server error
- Generic error messages didn't indicate what went wrong
- No validation for required fields or amount values
- Database operations weren't atomic (could partially fail)

**Root Causes:**
- Missing input validation
- No user existence check before database operations
- Separate database operations without transaction wrapper
- Poor error handling and logging

**Solution:**
- Added comprehensive validation for userId and amount
- Added user existence check with helpful 404 error
- Wrapped all database operations in Drizzle ORM transaction
- Improved error messages and server-side logging
- Return 201 status on success with deposit object

**Files Modified:**
- `server/routes/admin/transactions.ts` - Refactored `/deposits/manual` endpoint

### 3. Backward Compatibility

**Problem:**
- Client hook `useAdminDeposit` called `/api/admin/users/:id/deposit` which didn't exist

**Solution:**
- Implemented POST `/api/admin/users/:id/deposit` adapter
- Calls same internal logic as manual deposit endpoint
- Validates and logs operations consistently

**Files Modified:**
- `server/routes/admin/users.ts` - Added `/:id/deposit` route

### 4. Client Error Handling

**Problem:**
- fetchAPI threw generic "API Error" message
- UI couldn't display specific server error messages

**Solution:**
- Improved error parsing in fetchAPI
- Try to extract `error.error` or `error.message` from JSON response
- Fallback to `res.statusText` or "API Error" if parsing fails

**Files Modified:**
- `client/src/lib/api.ts` - Updated `fetchAPI` function

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
    "description": "Manual deposit by admin",
    "reference": "MANUAL-1234567890",
    "status": "approved",
    "createdAt": "2024-02-04T12:00:00.000Z"
  }
}
```

**Error Responses:**
- 400: `{ "error": "User ID is required" }`
- 400: `{ "error": "Amount is required" }`
- 400: `{ "error": "Amount must be a positive number" }`
- 404: `{ "error": "User not found" }`
- 500: `{ "error": "Failed to create manual deposit" }` (with server logs)

### POST /api/admin/users/:id/deposit (NEW)

Backward compatible endpoint with same behavior as manual deposit.

**Request:**
```json
{
  "amount": "500",
  "description": "Optional description"
}
```

**Response:** Same as manual deposit endpoint

## Logging

### Admin Authentication Logs

```
[ADMIN_AUTH_MIDDLEWARE] No userId in session
[ADMIN_AUTH_MIDDLEWARE] User {userId} is not an admin
[ADMIN_AUTH_MIDDLEWARE] User {userId} not found in any storage
[ADMIN_AUTH] Login successful for user {username}, session userId: {userId}
[ADMIN_AUTH] /me called without userId in session
```

### Manual Deposit Logs

```
[MANUAL_DEPOSIT] Missing userId, admin: {adminId}
[MANUAL_DEPOSIT] Invalid amount: {amount}, admin: {adminId}, userId: {userId}
[MANUAL_DEPOSIT] User not found: {userId}, admin: {adminId}
[MANUAL_DEPOSIT] Success: admin {adminId} added {amount} LKR to user {userId}
[USER_DEPOSIT_ADAPTER] ... (same patterns for backward compat endpoint)
```

## Database Operations

Manual deposit now uses Drizzle ORM transaction to ensure atomicity:

```typescript
await db.transaction(async (tx) => {
  // 1. Create deposit record
  const [deposit] = await tx.insert(deposits).values({ ... }).returning();

  // 2. Update user balance
  await tx.update(users).set({
    balance: sql`${users.balance} + ${numAmount}::numeric`,
    hasDeposit: true
  }).where(eq(users.id, targetUserId));

  // 3. Create transaction record
  await tx.insert(transactions).values({ ... });

  return deposit;
});
```

All three operations succeed together or fail together.

## Testing

Manual test procedures are provided in `server/tests/README.md`:

1. **Admin Auth Tests:** Login, get me, access protected routes
2. **Manual Deposit Tests:** Success, validation failures, user not found

## Session Configuration

For production deployments, verify session configuration:

```typescript
// server/app.ts or session setup
{
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: true,      // HTTPS only in production
    sameSite: 'lax',   // or 'strict'
    domain: '.yourdomain.com'  // Set if needed
  }
}
```

## Troubleshooting

### 401 Errors Persist

1. Check `SESSION_SECRET` is set in environment
2. Verify cookies are enabled in browser
3. Check cookie domain matches request domain
4. Review server logs for auth warnings
5. Verify PostgreSQL session store is working

### Manual Deposit Still Fails

1. Check server logs for specific error
2. Verify user ID is valid UUID/string
3. Ensure amount is positive number
4. Check database connection
5. Verify transaction support in PostgreSQL

### Session Lost Between Requests

1. Ensure session store is persistent (not in-memory in production)
2. Check session cookie expiry
3. Verify cookie is being sent with credentials: 'include'
4. Check proxy/load balancer session affinity

## Future Improvements

1. Add automated test suite with test runner (Jest/Vitest)
2. Add rate limiting for deposit endpoints
3. Add deposit approval workflow for large amounts
4. Add email/SMS notifications for deposits
5. Add audit log for all admin actions

## References

- [Admin Authentication Middleware](../../server/routes/admin/index.ts)
- [Admin Auth Routes](../../server/routes/admin/auth.ts)
- [Transaction Routes](../../server/routes/admin/transactions.ts)
- [User Routes](../../server/routes/admin/users.ts)
- [Client API](../../client/src/lib/api.ts)
