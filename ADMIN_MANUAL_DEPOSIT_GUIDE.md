# Admin Manual Deposit Feature Guide

## Overview
The manual deposit feature allows administrators to add deposits directly to user accounts through the admin panel. This is useful for processing offline payments, bonuses, or promotional credits.

## Prerequisites
- Admin account with `isAdmin: true` flag in the database
- Active session with valid authentication
- User account exists in the system

## API Endpoints

### 1. Primary Endpoint: Manual Deposit via Transactions
**Endpoint:** `POST /api/admin/transactions/deposits/manual`

**Authentication:** Requires admin session (via `requireAdmin` middleware)

**Request Body:**
```json
{
  "userId": "string (UUID)",
  "amount": "string or number (positive)",
  "description": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "deposit": {
    "id": 123,
    "userId": "uuid-string",
    "amount": "500.00",
    "type": "manual_add",
    "method": "admin_manual",
    "description": "Manual deposit by admin",
    "reference": "MANUAL-1709581234567",
    "status": "approved",
    "createdAt": "2024-02-04T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid userId/amount
  ```json
  { "error": "User ID is required" }
  { "error": "Amount must be a positive number" }
  ```
- `404 Not Found`: User does not exist
  ```json
  { "error": "User not found" }
  ```
- `500 Server Error`: Database or server error
  ```json
  { "error": "Server error" }
  ```

### 2. Alternative Endpoint: Manual Deposit via Users
**Endpoint:** `POST /api/admin/users/:id/deposit`

**Purpose:** Backward compatibility with existing client hooks

**Parameters:**
- `:id` - User ID (UUID string)

**Request Body:**
```json
{
  "amount": "string or number (positive)",
  "description": "string (optional)"
}
```

**Response:** Same as primary endpoint (201 Created)

## Database Operations

When a manual deposit is successfully created, the following operations occur:

1. **Create Deposit Record** in `deposits` table:
   - `userId`: Target user UUID
   - `amount`: Numeric value formatted to 2 decimals
   - `type`: "manual_add"
   - `method`: "admin_manual"
   - `reference`: "MANUAL-{timestamp}"
   - `status`: "approved" (immediately approved)

2. **Update User Balance** in `users` table:
   - Add deposit amount to user's `balance` field
   - Set `hasDeposit` flag to `true`

3. **Create Transaction Record** in `transactions` table:
   - Track the deposit in transaction history
   - Type: "deposit"
   - Status: "approved"

## Frontend Usage

### From Admin Deposits Page

The manual deposit modal is accessible from:
**Admin Panel → Deposits → Manual Deposit button**

**Features:**
- User search by username or email
- Amount input with validation
- Optional description field
- Real-time validation feedback
- Loading state during submission
- Success/error toast notifications

**Client Code Example:**
```typescript
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const manualDepositMutation = useMutation({
  mutationFn: (data: { userId: string; amount: string; description?: string }) =>
    api.createManualDeposit(data),
  onSuccess: () => {
    toast({ title: "Deposit Added!" });
    queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
  },
  onError: (error: Error) => {
    toast({ 
      title: "Failed to add deposit", 
      description: error.message,
      variant: "destructive" 
    });
  }
});

// Usage
manualDepositMutation.mutate({
  userId: "user-uuid-123",
  amount: "500",
  description: "Bonus reward"
});
```

## cURL Examples

### Example 1: Add 500 LKR bonus to user
```bash
curl -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "userId": "abc-123-def-456",
    "amount": "500",
    "description": "Performance bonus"
  }'
```

### Example 2: Add deposit via user endpoint
```bash
curl -X POST http://localhost:5000/api/admin/users/abc-123-def-456/deposit \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "amount": "1000",
    "description": "Welcome bonus"
  }'
```

## Validation Rules

1. **User ID Validation:**
   - Must be present in request
   - Must be a valid string
   - User must exist in database

2. **Amount Validation:**
   - Must be present in request
   - Must be a valid number (string or numeric)
   - Must be greater than 0
   - Converted to numeric with 2 decimal precision

3. **Description:**
   - Optional field
   - Defaults to "Manual deposit by admin"

## Logging

All manual deposit operations are logged for auditing:

```
[MANUAL_DEPOSIT] Admin {adminId} adding {amount} LKR to user {userId}, ref: {reference}
[MANUAL_DEPOSIT] Success: deposit ID {depositId} created for user {userId}
[MANUAL_DEPOSIT] Error: {error message}
[MANUAL_DEPOSIT] Stack: {stack trace}
```

## Authentication & Security

### Session Requirements
- Valid express-session with `userId` set
- User must have `isAdmin: true` in database
- Session cookie must be included in requests

### Middleware Protection
All manual deposit endpoints are protected by the `requireAdmin` middleware:
1. Checks session exists
2. Coerces `userId` to string for consistent lookups
3. Verifies user exists in PostgreSQL, MongoDB, or in-memory storage
4. Confirms user has admin privileges
5. Logs authentication failures for debugging

### Common Issues

**401 Unauthorized - "Not authenticated"**
- No session cookie present
- Session expired
- Invalid session ID

**403 Forbidden - "Admin access required"**
- User exists but `isAdmin` is false
- User not found in any storage backend

**500 Server Error**
- Database connection issues
- Type conversion errors (now fixed with proper validation)
- Transaction rollback failures

## Database Schema Requirements

### deposits table
```sql
CREATE TABLE deposits (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL,
  method TEXT,
  description TEXT,
  reference TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### users table (relevant fields)
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  balance NUMERIC(10, 2) DEFAULT 0.00,
  has_deposit BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  -- ... other fields
);
```

### transactions table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Locally

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Login as admin:**
   - Navigate to `/admin/auth/login`
   - Use admin credentials

3. **Access manual deposit:**
   - Go to `/admin/deposits`
   - Click "Manual Deposit" button
   - Search for a user
   - Enter amount and description
   - Submit

4. **Verify in database:**
   ```sql
   -- Check deposit record
   SELECT * FROM deposits WHERE reference LIKE 'MANUAL-%' ORDER BY created_at DESC LIMIT 1;
   
   -- Check user balance
   SELECT id, username, balance, has_deposit FROM users WHERE id = 'user-uuid';
   
   -- Check transaction record
   SELECT * FROM transactions WHERE type = 'deposit' ORDER BY created_at DESC LIMIT 1;
   ```

## Session Configuration Notes

For production deployment, ensure proper session configuration:

```typescript
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));
```

## Troubleshooting

### Issue: "User ID is required"
**Cause:** Request body missing `userId` field  
**Solution:** Ensure `userId` is included in POST body

### Issue: "Amount must be a positive number"
**Cause:** Amount is 0, negative, or not a valid number  
**Solution:** Send positive numeric or numeric string value

### Issue: "User not found"
**Cause:** User ID doesn't exist in database  
**Solution:** Verify user exists before creating deposit

### Issue: Session cookies not working
**Cause:** Domain mismatch, sameSite policy, or CORS issues  
**Solution:** 
- Check `credentials: 'include'` in fetch requests
- Verify session middleware is configured
- Check browser DevTools → Application → Cookies

## Best Practices

1. **Always validate user exists** before creating deposit
2. **Use descriptive descriptions** to track deposit sources
3. **Log all operations** for audit trails
4. **Handle errors gracefully** with user-friendly messages
5. **Invalidate caches** after successful deposits
6. **Use numeric types** for amounts to prevent precision issues
7. **Return 201 status** on successful creation (not 200)

## Related Documentation

- [ADMIN_SOURCE_CODE_REFERENCE.md](./ADMIN_SOURCE_CODE_REFERENCE.md) - Full admin panel overview
- [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) - Database schema details
- [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md) - Server configuration
