# Manual Deposit API Documentation

## Overview

The admin panel provides two endpoints for manually adding deposits to user accounts. Both endpoints have identical functionality and are maintained for backward compatibility.

## Authentication

All manual deposit endpoints require:
- **Admin authentication**: User must be logged in as an admin
- **Session-based auth**: Admin must have an active session with `isAdmin: true`

If authentication fails, the API will return:
- `401 Unauthorized` - No active session
- `403 Forbidden` - User is not an admin

## Endpoints

### 1. Primary Endpoint: Create Manual Deposit

```
POST /api/admin/transactions/deposits/manual
```

**Headers:**
```
Content-Type: application/json
Cookie: connect.sid=<session-cookie>
```

**Request Body:**
```json
{
  "userId": "user-uuid-or-id",
  "amount": "1000.00",
  "description": "Bonus deposit" // optional
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "deposit": {
    "id": 123,
    "userId": "user-uuid",
    "amount": "1000.00",
    "type": "manual_add",
    "method": "admin_manual",
    "description": "Bonus deposit",
    "reference": "MANUAL-1738704587000",
    "status": "approved",
    "createdAt": "2026-02-04T20:09:47.000Z"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Missing or invalid fields
```json
{
  "error": "User ID and amount are required"
}
// or
{
  "error": "Amount must be greater than zero"
}
// or
{
  "error": "Invalid amount format"
}
```

- **404 Not Found** - User not found
```json
{
  "error": "User not found"
}
```

- **500 Internal Server Error** - Server error
```json
{
  "error": "Failed to process manual deposit",
  "details": "Error message details"
}
```

### 2. Legacy Endpoint: User Deposit

```
POST /api/admin/users/:id/deposit
```

This endpoint is maintained for backward compatibility with existing client code.

**URL Parameters:**
- `id` (string, required) - The user ID

**Headers:**
```
Content-Type: application/json
Cookie: connect.sid=<session-cookie>
```

**Request Body:**
```json
{
  "amount": "1000.00",
  "description": "Bonus deposit" // optional
}
```

**Success Response (201 Created):**
```json
{
  "id": "user-uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "balance": "1500.00",
  "hasDeposit": true,
  // ... other user fields ...
  "deposit": {
    "id": 123,
    "userId": "user-uuid",
    "amount": "1000.00",
    "type": "manual_add",
    "method": "admin_manual",
    "description": "Bonus deposit",
    "reference": "MANUAL-1738704587000",
    "status": "approved",
    "createdAt": "2026-02-04T20:09:47.000Z"
  }
}
```

**Error Responses:** Same as primary endpoint

## Business Logic

When a manual deposit is successfully processed, the following actions occur atomically within a database transaction:

1. **Create Deposit Record**: A new deposit entry is created with:
   - Status: `approved`
   - Method: `admin_manual`
   - Type: `manual_add`
   - Reference: `MANUAL-<timestamp>`

2. **Update User Balance**: The user's balance is incremented by the deposit amount
   - `balance = balance + amount`
   - `hasDeposit = true`
   - `updatedAt = current timestamp`

3. **Create Transaction Record**: A transaction log entry is created with:
   - Type: `deposit`
   - Status: `approved`
   - Description: From request or default message

If any step fails, the entire operation is rolled back.

## Validation Rules

### User ID
- **Required**: Yes
- **Type**: String (UUID or numeric ID)
- **Validation**: Must exist in the database

### Amount
- **Required**: Yes
- **Type**: String or Number
- **Format**: Numeric value (e.g., "1000.00" or 1000)
- **Minimum**: Must be greater than 0
- **Validation**: Must be a valid number, no negative values

### Description
- **Required**: No
- **Type**: String
- **Default**: "Manual deposit by admin"
- **Length**: No explicit limit (database column dependent)

## Logging

All manual deposit operations are logged server-side with the following information:
- Admin user ID making the request
- Target user ID
- Deposit amount
- Operation result (success/failure)

Log prefix: `[MANUAL_DEPOSIT]` or `[MANUAL_DEPOSIT_LEGACY]`

Example logs:
```
[MANUAL_DEPOSIT] Request from admin: admin-uuid for user: user-uuid amount: 1000
[MANUAL_DEPOSIT] Success - Deposit ID: 123 Amount: 1000
[MANUAL_DEPOSIT] Error: User not found: user-uuid
```

## Client-Side Usage

### Using the API Client

```typescript
import { api } from "@/lib/api";

// Create manual deposit
const result = await api.createManualDeposit({
  userId: "user-uuid",
  amount: "1000.00",
  description: "Bonus deposit"
});
```

### Using React Query Mutation

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (data: { userId: string; amount: string; description?: string }) =>
    api.createManualDeposit(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    // Show success message
  },
  onError: (error: any) => {
    // Show error message
    console.error("Manual deposit error:", error.message);
  }
});

// Usage
mutation.mutate({
  userId: selectedUser.id,
  amount: depositAmount,
  description: "Promotional bonus"
});
```

## Security Considerations

1. **Admin-Only Access**: Both endpoints are protected by the `requireAdmin` middleware
2. **Session Validation**: Session must contain valid `userId` and `isAdmin: true`
3. **Input Sanitization**: All inputs are validated and sanitized before database operations
4. **Transaction Safety**: Database transactions ensure atomicity and data consistency
5. **Audit Logging**: All operations are logged for audit trails
6. **No Sensitive Data in Logs**: Logs do not contain passwords or sensitive user information

## Error Handling

The client-side `fetchAPI` function includes enhanced error handling:

```typescript
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    let errorMessage = "API Error";
    try {
      const error = await res.json();
      errorMessage = error.error || error.details || errorMessage;
    } catch (parseError) {
      // Fallback to text if JSON parsing fails
      try {
        const textError = await res.text();
        errorMessage = textError || `HTTP ${res.status}: ${res.statusText}`;
      } catch {
        errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }
  return res.json();
}
```

This ensures that error messages are properly extracted and displayed to the user, whether they are JSON or plain text responses.

## Testing Recommendations

### Manual Testing Checklist

1. **Authentication Tests**:
   - [ ] Login as admin
   - [ ] Verify session is created with `isAdmin: true`
   - [ ] Access `/api/admin/transactions` to verify authentication

2. **Successful Deposit Tests**:
   - [ ] Create deposit with valid user ID and amount
   - [ ] Verify deposit record is created
   - [ ] Verify user balance is updated
   - [ ] Verify transaction record is created
   - [ ] Check all operations within single transaction

3. **Validation Tests**:
   - [ ] Test with missing userId (expect 400)
   - [ ] Test with missing amount (expect 400)
   - [ ] Test with negative amount (expect 400)
   - [ ] Test with zero amount (expect 400)
   - [ ] Test with invalid amount format (expect 400)
   - [ ] Test with non-existent user ID (expect 404)

4. **Error Handling Tests**:
   - [ ] Test without admin authentication (expect 401)
   - [ ] Test with non-admin user (expect 403)
   - [ ] Test database connection failure (expect 500)
   - [ ] Verify error messages are clear and helpful

5. **UI Tests**:
   - [ ] Test manual deposit modal in admin panel
   - [ ] Verify user search functionality
   - [ ] Verify amount input validation
   - [ ] Verify success toast message
   - [ ] Verify error toast message with details
   - [ ] Verify button is disabled during submission
   - [ ] Verify data refresh after successful deposit

## Troubleshooting

### Issue: 401 Unauthorized Error

**Symptoms**: API returns 401 when accessing admin routes

**Possible Causes**:
1. Session expired or not set
2. Session cookie not being sent
3. userId not in session

**Solutions**:
1. Verify admin login is successful
2. Check browser cookie settings
3. Check SESSION_SECRET environment variable
4. Verify session middleware configuration

### Issue: 500 Server Error

**Symptoms**: Manual deposit fails with 500 error

**Possible Causes**:
1. Database connection issue
2. Invalid data type in request
3. Transaction rollback due to constraint violation

**Solutions**:
1. Check database connection status
2. Verify DATABASE_URL environment variable
3. Check server logs for detailed error messages
4. Verify user exists before attempting deposit

### Issue: Amount Not Updating

**Symptoms**: Deposit created but user balance not updated

**Possible Causes**:
1. Transaction not completing successfully
2. Database constraint preventing update
3. Caching issue on client side

**Solutions**:
1. Check server logs for transaction errors
2. Verify database schema and constraints
3. Clear query cache and refetch user data
4. Ensure transaction is being used (check code)

## Changelog

### Version 1.1 (2026-02-04)
- Added transaction support for atomic operations
- Improved error handling and validation
- Added comprehensive logging
- Added backward-compatible legacy endpoint
- Enhanced client-side error messages
- Added session type declaration for TypeScript
- Normalized userId handling (string/number support)

### Version 1.0 (Initial)
- Basic manual deposit functionality
- Admin authentication
- Database insertion
