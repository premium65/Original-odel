# Server Tests

This directory contains integration tests for the ODEL ADS server API.

## Test Files

1. **admin-auth.test.ts** - Admin authentication flow tests
2. **manual-deposit.test.ts** - Manual deposit functionality tests

## Running Tests

Since this project doesn't have an automated test runner configured, these tests are designed to be run manually using curl or API testing tools like Postman.

### Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The server should be running at `http://localhost:5000`

### Test Execution

#### Admin Authentication Tests

```bash
# Test 1: Login as admin
curl -c cookies.txt -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test 2: Get current user
curl -b cookies.txt http://localhost:5000/api/admin/auth/me

# Test 3: Access protected admin route
curl -b cookies.txt http://localhost:5000/api/admin/users

# Test 4: Unauthorized access (should fail with 401)
curl http://localhost:5000/api/admin/users
```

#### Manual Deposit Tests

**Note:** Replace `USER_ID` with an actual user ID from your database.

```bash
# First, login as admin
curl -c cookies.txt -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test 1: Successful manual deposit
curl -b cookies.txt -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","amount":"500","description":"Test bonus"}'

# Test 2: Missing userId (should fail with 400)
curl -b cookies.txt -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
  -H "Content-Type: application/json" \
  -d '{"amount":"500"}'

# Test 3: Missing amount (should fail with 400)
curl -b cookies.txt -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID"}'

# Test 4: Invalid amount - negative (should fail with 400)
curl -b cookies.txt -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","amount":"-100"}'

# Test 5: Invalid amount - non-numeric (should fail with 400)
curl -b cookies.txt -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","amount":"invalid"}'

# Test 6: User not found (should fail with 404)
curl -b cookies.txt -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
  -H "Content-Type: application/json" \
  -d '{"userId":"nonexistent-user-id","amount":"500"}'

# Test 7: Backward compatibility endpoint
curl -b cookies.txt -X POST http://localhost:5000/api/admin/users/USER_ID/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount":"250","description":"Via backward compat endpoint"}'
```

## Expected Results

### Admin Authentication

- **Login**: Status 200, returns user object with `isAdmin: true`
- **Get Me**: Status 200, returns current admin user data
- **Protected Route**: Status 200, returns data (when authenticated)
- **Unauthorized**: Status 401, returns error message

### Manual Deposit

- **Success**: Status 201, returns deposit object
- **Missing UserId**: Status 400, error: "User ID is required"
- **Missing Amount**: Status 400, error: "Amount is required"
- **Invalid Amount**: Status 400, error: "Amount must be a positive number"
- **User Not Found**: Status 404, error: "User not found"
- **Backward Compat**: Status 201, same as success case

## Troubleshooting

### Session Issues

If you're getting 401 errors after login, check:

1. **SESSION_SECRET** is set in `.env`
2. Cookies are being properly stored and sent
3. Session store is working (PostgreSQL or in-memory)

Check server logs for authentication warnings:
```
[ADMIN_AUTH_MIDDLEWARE] No userId in session
[ADMIN_AUTH_MIDDLEWARE] User X is not an admin
[ADMIN_AUTH] /me called without userId in session
```

### Deposit Failures

If manual deposits are failing, check server logs:
```
[MANUAL_DEPOSIT] Missing userId, admin: X
[MANUAL_DEPOSIT] Invalid amount: X
[MANUAL_DEPOSIT] User not found: X
[MANUAL_DEPOSIT] Success: admin X added Y LKR to user Z
```

## Database Verification

After creating a deposit, verify in the database:

```sql
-- Check deposit record
SELECT * FROM deposits WHERE user_id='USER_ID' ORDER BY created_at DESC LIMIT 1;

-- Check user balance
SELECT id, username, balance, has_deposit FROM users WHERE id='USER_ID';

-- Check transaction record
SELECT * FROM transactions WHERE user_id='USER_ID' AND type='deposit' ORDER BY created_at DESC LIMIT 1;
```

## Notes

- These tests require a running PostgreSQL database
- The tests use the hardcoded admin credentials (admin/admin123)
- For production testing, use actual admin accounts
- Transaction atomicity is ensured by Drizzle ORM transactions
