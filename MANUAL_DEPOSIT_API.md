# Manual Deposit API Documentation

## Overview
The manual deposit feature allows administrators to add funds directly to user accounts. This document describes the API endpoints, authentication requirements, and usage examples.

## Authentication Requirements

### Session-Based Authentication
All admin routes require a valid admin session:

1. **Login**: POST `/api/admin/auth/login`
2. **Session Cookie**: `connect.sid` (automatically managed by Express Session)
3. **Session Properties**:
   - `req.session.userId`: User ID (string or number)
   - `req.session.isAdmin`: Boolean flag (set to `true` for admins)

### Environment Variables
Ensure these are configured in `.env`:
```bash
SESSION_SECRET=your-secret-key-here  # Required for session encryption
DATABASE_URL=postgresql://...         # PostgreSQL connection string
```

### Session Configuration
The application uses `express-session` with:
- **Store**: PostgreSQL (`connect-pg-simple`) for production
- **Cookie Settings**:
  - `httpOnly: true` (prevents XSS attacks)
  - `secure: false` (set to true in HTTPS environments)
  - `sameSite: 'lax'`
  - `maxAge: 24 hours`

## API Endpoints

### 1. Create Manual Deposit (Primary Endpoint)

**Endpoint**: `POST /api/admin/transactions/deposits/manual`

**Description**: Creates a manual deposit for a user, updates their balance, and creates transaction records.

**Authentication**: Requires admin session

**Request Body**:
```json
{
  "userId": "user-uuid-or-id",
  "amount": "500",
  "description": "Bonus deposit" // Optional
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "deposit": {
    "id": 123,
    "userId": "user-uuid",
    "amount": "500",
    "type": "manual_add",
    "method": "admin_manual",
    "reference": "MANUAL-1738700000000",
    "status": "approved",
    "description": "Bonus deposit",
    "createdAt": "2024-02-04T20:00:00.000Z"
  }
}
```

**Error Responses**:

- **400 Bad Request**:
  ```json
  { "error": "User ID is required" }
  { "error": "Amount is required" }
  { "error": "Amount must be a positive number" }
  ```

- **401 Unauthorized**:
  ```json
  { "error": "Not authenticated" }
  ```

- **403 Forbidden**:
  ```json
  { "error": "Admin access required" }
  ```

- **404 Not Found**:
  ```json
  { "error": "User not found" }
  ```

- **500 Internal Server Error**:
  ```json
  { "error": "Database connection error" }
  ```

**Database Operations**:
1. Inserts record into `deposits` table
2. Updates user balance: `balance = balance + amount`
3. Sets `hasDeposit = true` for the user
4. Inserts transaction record into `transactions` table

**Logging**:
```
[MANUAL_DEPOSIT] Admin {adminId} adding {amount} LKR to user {targetUserId}
[MANUAL_DEPOSIT] Success: Deposit {depositId} created for user {targetUserId}
```

---

### 2. Create Manual Deposit (Adapter Endpoint)

**Endpoint**: `POST /api/admin/users/:id/deposit`

**Description**: Backward-compatible adapter that calls the same deposit logic. Used by `useAdminDeposit` hook.

**Authentication**: Requires admin session

**URL Parameters**:
- `id`: User ID (string)

**Request Body**:
```json
{
  "amount": "500"
}
```

**Response (200 OK)**:
```json
{
  "id": "user-uuid",
  "username": "premiumwork",
  "email": "user@example.com",
  "balance": "1500.00",
  "hasDeposit": true,
  // ... other user fields
}
```

**Error Responses**: Same as primary endpoint

**Database Operations**: Same as primary endpoint

**Logging**:
```
[MANUAL_DEPOSIT_ADAPTER] Admin {adminId} adding {amount} LKR to user {targetUserId}
[MANUAL_DEPOSIT_ADAPTER] Success: Deposit {depositId} created for user {targetUserId}
```

---

## Client-Side Usage

### Using React Query (Recommended)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

function ManualDepositForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: { userId: string; amount: string; description?: string }) =>
      api.createManualDeposit(data),
    onSuccess: () => {
      toast({ title: "Success!", description: "Deposit added successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = () => {
    mutation.mutate({
      userId: "user-uuid",
      amount: "500",
      description: "Bonus"
    });
  };

  return (
    <button 
      onClick={handleSubmit}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Processing..." : "Add Deposit"}
    </button>
  );
}
```

### Using Fetch API

```javascript
async function createManualDeposit(userId, amount, description) {
  const response = await fetch('/api/admin/transactions/deposits/manual', {
    method: 'POST',
    credentials: 'include', // Include session cookie
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, amount, description })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create deposit');
  }

  return response.json();
}
```

---

## Troubleshooting

### Issue: 401 Unauthorized

**Symptoms**: 
- `GET /api/admin/auth/me` returns 401
- Manual deposit returns 401

**Causes**:
1. Session expired or not created
2. Session cookie not sent with request
3. SESSION_SECRET mismatch between server restarts

**Solutions**:
1. Re-login through admin login page
2. Check browser DevTools → Application → Cookies for `connect.sid`
3. Ensure `credentials: 'include'` in fetch requests
4. Verify SESSION_SECRET is set in `.env`

### Issue: 500 Internal Server Error

**Symptoms**: Manual deposit returns 500

**Common Causes**:
1. Database connection failure
2. Invalid user ID format (UUID mismatch)
3. Type coercion issues with amount

**Solutions**:
1. Check server logs for detailed error
2. Verify DATABASE_URL is correct
3. Ensure userId is a valid UUID string
4. Ensure amount is a valid number string

### Issue: Session Not Persisting

**Symptoms**: User logged out after page refresh

**Causes**:
1. PostgreSQL session store not configured
2. Cookie settings incompatible with deployment environment

**Solutions**:
1. Verify `connect-pg-simple` is installed
2. Check session store configuration in `server/app.ts`
3. For HTTPS deployments, set `cookie.secure = true`
4. Check browser cookie settings (third-party cookies)

---

## Security Considerations

1. **Input Validation**: All inputs are validated before processing
2. **SQL Injection**: Uses parameterized queries via Drizzle ORM
3. **Amount Validation**: Ensures amount is positive number
4. **User Verification**: Checks user exists before creating deposit
5. **Logging**: Logs admin actions for audit trail (no sensitive data)
6. **Session Security**: Uses HTTP-only cookies, secure secrets

---

## Database Schema

### deposits Table
```sql
CREATE TABLE deposits (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL,
  method TEXT,
  reference TEXT,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### transactions Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### users Table (relevant fields)
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  has_deposit BOOLEAN DEFAULT FALSE,
  -- ... other fields
);
```

---

## Code References

- **Middleware**: `server/routes/admin/index.ts` (requireAdmin)
- **Primary Handler**: `server/routes/admin/transactions.ts` (POST /deposits/manual)
- **Adapter Handler**: `server/routes/admin/users.ts` (POST /:id/deposit)
- **Client API**: `client/src/lib/api.ts` (api.createManualDeposit)
- **UI Component**: `client/src/pages/admin/deposits.tsx`

---

## Changelog

### 2024-02-04 - Fix Manual Deposit Issues
- Fixed type coercion for userId and amount
- Added robust input validation
- Improved error handling and logging
- Return 201 status code on success
- Added adapter route for backward compatibility
- Fixed session userId handling in requireAdmin middleware

---

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify database connection and schema
3. Review session configuration
4. Consult CLAUDE.md for project overview
