# Manual Deposit Fix Verification

## Problem Statement

Users encountered failures when trying to add manual deposits through the admin panel:
- **Error**: "Failed to add deposit: Server error"
- **DevTools**:
  - `GET /api/admin/auth/me` returns 401 Unauthorized
  - `POST /api/admin/transactions/deposits/manual` returns 500 Internal Server Error

## Root Causes Identified

1. **Session userId Type Mismatch**: Session stores (MongoDB, memory) may store userId as a number, but code expected strings
2. **Manual Deposit Validation Issues**: Missing or inadequate validation of userId and amount fields
3. **Error Handling**: Client-side error messages not properly parsed from server responses

## Fixes Implemented

### 1. Backend: Normalize Session UserId Handling

**File**: `server/routes/admin/index.ts` (lines 12-67)

```typescript
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        // Normalize userId to string (may arrive as number from MongoDB or other session stores)
        const rawUserId = req.session.userId;
        if (!rawUserId) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = String(rawUserId);  // ✅ Convert to string
        // ... rest of authentication logic
    }
}
```

**File**: `server/routes/admin/auth.ts` (lines 78-114)

```typescript
router.get("/me", async (req, res) => {
  try {
    const rawUserId = req.session.userId;
    if (!rawUserId) return res.status(401).json({ error: "Not authenticated" });
    
    // Normalize userId to string (may be stored as number from MongoDB)
    const userId = String(rawUserId);  // ✅ Convert to string
    // ... rest of /me endpoint logic
  }
});
```

### 2. Backend: Harden Manual Deposit Endpoint

**File**: `server/routes/admin/transactions.ts` (lines 110-172)

```typescript
router.post("/deposits/manual", async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    // ✅ Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const normalizedUserId = String(userId).trim();
    if (!normalizedUserId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // ✅ Validate and coerce amount
    if (amount === undefined || amount === null || amount === "") {
      return res.status(400).json({ error: "Amount is required" });
    }
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    // ✅ Verify user exists before creating deposit
    const existingUser = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.id, normalizedUserId))
      .limit(1);
    if (!existingUser.length) {
      return res.status(400).json({ error: "User not found" });
    }

    // ✅ Add logging for debugging
    console.log(`[MANUAL_DEPOSIT] Admin creating deposit: userId=${normalizedUserId}, amount=${numAmount}`);

    // Create deposit record
    const deposit = await db.insert(deposits).values({
      userId: normalizedUserId,
      amount: numAmount.toFixed(2),  // ✅ Use numeric amount
      type: "manual_add",
      method: "admin_manual",
      description: description || "Manual deposit by admin",
      reference: `MANUAL-${Date.now()}`,
      status: "approved"
    }).returning();

    // Add amount to user balance
    await db.update(users).set({
      balance: sql`COALESCE(${users.balance}, 0) + ${numAmount}::numeric`,
      hasDeposit: true
    }).where(eq(users.id, normalizedUserId));

    // Create transaction record
    await db.insert(transactions).values({
      userId: normalizedUserId,
      type: "deposit",
      amount: numAmount.toFixed(2),
      status: "approved",
      description: description || "Manual deposit by admin"
    });

    console.log(`[MANUAL_DEPOSIT] Success: depositId=${deposit[0]?.id}`);
    
    // ✅ Return 201 Created with success flag
    res.status(201).json({ success: true, deposit: deposit[0] });
  } catch (error) {
    console.error("[MANUAL_DEPOSIT] Error:", error);
    res.status(500).json({ error: "Failed to create manual deposit" });
  }
});
```

### 3. Backend: Add Adapter Endpoint

**File**: `server/routes/admin/users.ts` (lines 677-733)

Created a backward-compatible adapter endpoint:

```typescript
// Manual deposit via user route (backward-compatible adapter)
router.post("/:id/deposit", async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount, description } = req.body;
    
    // ✅ Same validation logic as transactions endpoint
    // ✅ Reuses the manual deposit logic
    // ... implementation
    
    res.status(201).json({ success: true, deposit: deposit[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to create manual deposit" });
  }
});
```

### 4. Client: Improve Error Handling

**File**: `client/src/lib/api.ts` (lines 3-25)

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
    let message = `Request failed (${res.status})`;
    try {
      // ✅ Parse server error messages from JSON
      const body = await res.json();
      if (body.error) message = body.error;
      else if (body.message) message = body.message;
    } catch {
      // Response was not JSON – use status text
      message = res.statusText || message;
    }
    throw new Error(message);
  }
  return res.json();
}
```

### 5. Client: Disable Button During Mutation

**File**: `client/src/pages/admin/deposits.tsx` (lines 40-56, 297-315)

```typescript
const manualDepositMutation = useMutation({
  mutationFn: (data: { userId: string; amount: string; description?: string }) =>
    api.createManualDeposit(data),
  onSuccess: () => {
    toast({ title: "Deposit Added!", description: "Manual deposit has been added successfully." });
    queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
    // ... reset form state
  },
  onError: (error: any) => {
    // ✅ Display server error message
    toast({ title: "Failed to add deposit", description: error.message, variant: "destructive" });
  }
});

// In JSX:
<button
  onClick={handleDeposit}
  disabled={manualDepositMutation.isPending || !selectedUser || !depositAmount}  // ✅ Disabled during mutation
  className="..."
>
  {manualDepositMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}  {/* ✅ Loading spinner */}
  Add Deposit
</button>
```

## Verification Steps

### 1. Test Admin Authentication

```bash
# Login as admin
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# Check session
curl -X GET http://localhost:5000/api/admin/auth/me \
  -b cookies.txt
```

**Expected**: Returns admin user data with 200 status

### 2. Test Manual Deposit Creation

```bash
# Create manual deposit
curl -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "userId": "user-id-here",
    "amount": "500",
    "description": "Test bonus"
  }'
```

**Expected**: Returns 201 with deposit object and `success: true`

### 3. Test Validation Errors

```bash
# Test missing userId
curl -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"amount": "500"}'
```

**Expected**: Returns 400 with `{ "error": "User ID is required" }`

```bash
# Test invalid amount
curl -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"userId": "user-id", "amount": "-100"}'
```

**Expected**: Returns 400 with `{ "error": "Amount must be a positive number" }`

### 4. Test User Adapter Endpoint

```bash
# Create deposit via user endpoint
curl -X POST http://localhost:5000/api/admin/users/user-id-here/deposit \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"amount": "500", "description": "Bonus via adapter"}'
```

**Expected**: Returns 201 with deposit object

## PowerShell Testing (Windows)

For PowerShell users, use `Invoke-RestMethod` instead of `curl`:

```powershell
# Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}' `
  -SessionVariable session

# Check session
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/auth/me" `
  -WebSession $session

# Create manual deposit
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/transactions/deposits/manual" `
  -Method POST `
  -ContentType "application/json" `
  -WebSession $session `
  -Body '{"userId":"user-id","amount":"500","description":"Test"}'
```

## Database Verification

After successful deposit creation, verify in database:

```sql
-- Check deposit record
SELECT * FROM deposits WHERE reference LIKE 'MANUAL-%' ORDER BY created_at DESC LIMIT 1;

-- Check user balance updated
SELECT id, username, balance, has_deposit FROM users WHERE id = 'user-id-here';

-- Check transaction record
SELECT * FROM transactions WHERE user_id = 'user-id-here' AND type = 'deposit' ORDER BY created_at DESC LIMIT 1;
```

## Known Issues & Notes

### TypeScript Errors
The codebase has pre-existing TypeScript errors unrelated to these changes:
```
error TS2688: Cannot find type definition file for 'node'.
error TS2688: Cannot find type definition file for 'vite/client'.
```
These do not prevent the build or dev server from running.

### Session Configuration
- Requires `SESSION_SECRET` environment variable
- Without `DATABASE_URL`, uses in-memory session store (sessions lost on restart)
- Check cookie flags in production (secure, httpOnly, sameSite)

### Port Configuration
- Dev server runs on port 5000 (not 3000)
- Ensure curl/fetch commands use correct port

### Database Type Considerations
- Amount fields should be stored as `numeric` or `decimal` in PostgreSQL
- Balance updates use `::numeric` type casting for safety
- Always use `COALESCE` for nullable numeric fields

### Browser Testing
When testing via UI:
1. Open DevTools Network tab
2. Login as admin
3. Navigate to Admin → Deposits
4. Click "Manual Deposit"
5. Search and select a user
6. Enter amount (e.g., 500)
7. Add description (optional)
8. Click "Add Deposit"
9. Check Network tab for request/response
10. Verify toast notification shows success or error message

## Troubleshooting

### 401 Unauthorized on /api/admin/auth/me
- **Cause**: Session not properly set or cookies not included
- **Fix**: Ensure cookies are sent with request (`credentials: "include"` or `-b cookies.txt`)

### 500 on Manual Deposit
- **Possible Causes**:
  - User doesn't exist in database
  - Database connection issue
  - Invalid data types
- **Fix**: Check server logs for `[MANUAL_DEPOSIT]` messages

### Button Stays Disabled
- **Cause**: Mutation might be stuck in pending state
- **Fix**: Check browser console for errors, ensure error handler is called

### Deposits Not Appearing
- **Cause**: Query cache not invalidated
- **Fix**: The mutation should invalidate `["admin-deposits"]` query key automatically

## Success Criteria

✅ Admin can log in successfully
✅ `/api/admin/auth/me` returns 200 with user data
✅ Manual deposit creation returns 201 with deposit object
✅ User balance is updated correctly
✅ Deposit and transaction records are created
✅ Validation errors return 400 with clear messages
✅ Button is disabled during mutation
✅ Error messages are properly displayed in toast notifications
✅ Both `/admin/transactions/deposits/manual` and `/admin/users/:id/deposit` work

## Related Files

- `server/routes/admin/index.ts` - Admin authentication middleware
- `server/routes/admin/auth.ts` - Admin auth endpoints
- `server/routes/admin/transactions.ts` - Transaction and deposit management
- `server/routes/admin/users.ts` - User management and deposit adapter
- `client/src/lib/api.ts` - API client utilities
- `client/src/pages/admin/deposits.tsx` - Deposits UI page
- `shared/schema.ts` - Database schema definitions
