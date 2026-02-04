# Test Documentation

This directory contains test documentation and verification scripts for the admin panel fixes.

## Test Files

### `admin-auth.test.md`
Test cases for admin authentication flow including:
- Login and session management
- Protected route access
- Session type handling
- Error cases

### `manual-deposit.test.md`
Test cases for manual deposit functionality including:
- Successful deposits
- Input validation
- Error handling
- Adapter route compatibility
- Transaction atomicity

### `verify-fixes.sh`
Automated bash script to verify the fixes are working correctly.

## Running the Verification Script

```bash
# Make sure the server is running first
npm run dev

# In another terminal, run the verification script
cd tests
./verify-fixes.sh

# Or specify a custom base URL
BASE_URL=http://your-server:5000 ./verify-fixes.sh
```

The script will:
1. Login as admin
2. Verify /me endpoint works
3. Access protected admin routes
4. Test validation (missing fields, invalid amounts)
5. Test user not found scenarios
6. Test adapter route
7. Logout and verify session destroyed

## Manual Testing

To manually test the fixes:

1. **Login as Admin**
   ```bash
   curl -c cookies.txt -X POST http://localhost:5000/api/admin/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

2. **Check /me Endpoint**
   ```bash
   curl -b cookies.txt http://localhost:5000/api/admin/auth/me
   ```
   Should return admin user with `isAdmin: true`

3. **Test Manual Deposit**
   ```bash
   # Replace USER_ID with actual user ID
   curl -b cookies.txt -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
     -H "Content-Type: application/json" \
     -d '{"userId":"USER_ID","amount":"500","description":"Test"}'
   ```

4. **Test Validation**
   ```bash
   # Missing userId
   curl -b cookies.txt -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
     -H "Content-Type: application/json" \
     -d '{"amount":"500"}'
   
   # Invalid amount
   curl -b cookies.txt -X POST http://localhost:5000/api/admin/transactions/deposits/manual \
     -H "Content-Type: application/json" \
     -d '{"userId":"test","amount":"invalid"}'
   ```

## UI Testing

1. Login to admin panel at `/admin/login`
2. Navigate to Deposits section
3. Click "Add Manual Deposit"
4. Select a user from dropdown
5. Enter amount: 500
6. Enter description: "Test bonus"
7. Click "Add Deposit"

**Expected Result:**
- Success toast: "Deposit Added!"
- Deposit appears in list
- User balance increased
- No 500 errors in Network tab
- No 401 errors for /me endpoint

## Checking Server Logs

Look for these log entries:
```
[ADMIN_AUTH] Admin admin logged in successfully
[ADMIN_AUTH_MIDDLEWARE] Admin admin authenticated (PostgreSQL)
[ADMIN_AUTH] /me - User admin found, isAdmin: true
[MANUAL_DEPOSIT] Processing deposit for user testuser: 500 LKR
[MANUAL_DEPOSIT] Deposit successful for user testuser: ID 123
```

## Test Framework Integration

To integrate these tests with a testing framework like Jest:

1. Install dependencies:
   ```bash
   npm install --save-dev jest supertest @types/jest @types/supertest
   ```

2. Create `jest.config.js`:
   ```javascript
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     testMatch: ['**/*.test.ts'],
     collectCoverageFrom: ['server/**/*.ts'],
   };
   ```

3. Convert markdown test cases to actual test files
4. Run: `npm test`

## Troubleshooting

### 401 Errors on /me Endpoint
- Check server logs for `[ADMIN_AUTH_MIDDLEWARE]` entries
- Verify session cookie is being sent
- Check SESSION_SECRET environment variable

### 500 Errors on Manual Deposit
- Check server logs for `[MANUAL_DEPOSIT]` entries and stack traces
- Verify user ID exists in database
- Check DATABASE_URL connection

### Session Issues
- Clear cookies and login again
- Check cookie settings (secure, sameSite)
- Verify SESSION_SECRET is set
- In production, use persistent session store (Redis/PostgreSQL)

## Related Documentation

See `../ADMIN_DEPOSIT_FIX.md` for:
- Detailed problem analysis
- Fix explanations
- API documentation
- Security considerations
