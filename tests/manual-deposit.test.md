# Manual Deposit Tests

## Test: Manual Deposit Endpoint

### Description
Verify that manual deposit functionality works correctly with proper validation and error handling.

### Test Cases

#### 1. Successful Manual Deposit
**Steps:**
1. Login as admin
2. Create a test user or use existing user with ID "123"
3. POST `/api/admin/transactions/deposits/manual`:
   ```json
   {
     "userId": "123",
     "amount": "500",
     "description": "Test bonus"
   }
   ```
4. Verify deposit is created
5. Verify user balance is updated

**Expected Result:**
- Status: 200
- Response includes `{ success: true, deposit: {...} }`
- Deposit record created in database
- Transaction record created
- User balance increased by 500
- User `hasDeposit` flag set to true

#### 2. Missing Required Fields
**Steps:**
1. Login as admin
2. POST `/api/admin/transactions/deposits/manual` with missing userId:
   ```json
   {
     "amount": "500"
   }
   ```

**Expected Result:**
- Status: 400
- Error message: "User ID and amount are required"

#### 3. Invalid Amount - Zero
**Steps:**
1. Login as admin
2. POST `/api/admin/transactions/deposits/manual`:
   ```json
   {
     "userId": "123",
     "amount": "0"
   }
   ```

**Expected Result:**
- Status: 400
- Error message: "Invalid amount. Must be a positive number."

#### 4. Invalid Amount - Negative
**Steps:**
1. Login as admin
2. POST `/api/admin/transactions/deposits/manual`:
   ```json
   {
     "userId": "123",
     "amount": "-100"
   }
   ```

**Expected Result:**
- Status: 400
- Error message: "Invalid amount. Must be a positive number."

#### 5. Invalid Amount - Non-Numeric
**Steps:**
1. Login as admin
2. POST `/api/admin/transactions/deposits/manual`:
   ```json
   {
     "userId": "123",
     "amount": "abc"
   }
   ```

**Expected Result:**
- Status: 400
- Error message: "Invalid amount. Must be a positive number."

#### 6. User Not Found
**Steps:**
1. Login as admin
2. POST `/api/admin/transactions/deposits/manual`:
   ```json
   {
     "userId": "nonexistent-user-id",
     "amount": "500"
   }
   ```

**Expected Result:**
- Status: 404
- Error message: "User not found"

#### 7. Deposit Without Description
**Steps:**
1. Login as admin
2. POST `/api/admin/transactions/deposits/manual`:
   ```json
   {
     "userId": "123",
     "amount": "500"
   }
   ```

**Expected Result:**
- Status: 200
- Deposit created with default description: "Manual deposit by admin"

## Test: Adapter Route Compatibility

### Description
Verify that the adapter route `/api/admin/users/:id/deposit` works correctly for backward compatibility.

### Test Cases

#### 1. Successful Deposit via Adapter Route
**Steps:**
1. Login as admin
2. POST `/api/admin/users/123/deposit`:
   ```json
   {
     "amount": "500",
     "description": "Test bonus"
   }
   ```
3. Verify deposit is created

**Expected Result:**
- Status: 200
- Response includes `{ success: true, deposit: {...} }`
- Same behavior as main endpoint

#### 2. Invalid Amount via Adapter Route
**Steps:**
1. Login as admin
2. POST `/api/admin/users/123/deposit`:
   ```json
   {
     "amount": "invalid"
   }
   ```

**Expected Result:**
- Status: 400
- Error message: "Invalid amount. Must be a positive number."

#### 3. User Not Found via Adapter Route
**Steps:**
1. Login as admin
2. POST `/api/admin/users/nonexistent/deposit`:
   ```json
   {
     "amount": "500"
   }
   ```

**Expected Result:**
- Status: 404
- Error message: "User not found"

## Test: Transaction Atomicity

### Description
Verify that all database operations in manual deposit are atomic (all succeed or all fail).

### Test Cases

#### 1. Transaction Rollback on Failure
**Steps:**
1. Login as admin
2. Simulate a database error during transaction
3. Verify no partial updates

**Expected Result:**
- If any part of the transaction fails:
  - No deposit record created
  - User balance unchanged
  - No transaction record created

#### 2. All-or-Nothing Guarantee
**Steps:**
1. Login as admin
2. POST successful deposit
3. Verify all three operations completed:
   - Deposit record inserted
   - User balance updated
   - Transaction record inserted

**Expected Result:**
- All three operations succeed together
- Data consistency maintained

## Test: Error Logging and Reporting

### Description
Verify that errors are properly logged and detailed messages are returned to client.

### Test Cases

#### 1. Server Error Logging
**Steps:**
1. Trigger a server error (e.g., database connection issue)
2. Check server logs

**Expected Result:**
- Error logged with `[MANUAL_DEPOSIT]` prefix
- Stack trace logged for debugging
- Client receives generic error message (not exposing internal details)

#### 2. Validation Error Messages
**Steps:**
1. Send invalid request (missing fields, invalid amount, etc.)
2. Check response

**Expected Result:**
- Clear, user-friendly error message
- Appropriate HTTP status code (400 for validation)
- No stack traces exposed to client

## Implementation Notes

These tests should be implemented using a testing framework like Jest or Mocha with supertest for API testing.

Example test implementation:

```javascript
describe('Manual Deposit', () => {
  let agent;
  let testUser;
  
  beforeEach(async () => {
    agent = request.agent(app);
    // Login as admin
    await agent
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    
    // Create test user
    testUser = await createTestUser();
  });
  
  afterEach(async () => {
    await cleanupTestUser(testUser.id);
  });
  
  it('should create manual deposit successfully', async () => {
    const res = await agent
      .post('/api/admin/transactions/deposits/manual')
      .send({
        userId: testUser.id,
        amount: '500',
        description: 'Test bonus'
      })
      .expect(200);
    
    expect(res.body.success).toBe(true);
    expect(res.body.deposit).toBeDefined();
    
    // Verify user balance updated
    const updatedUser = await getUserById(testUser.id);
    expect(parseFloat(updatedUser.balance)).toBeGreaterThan(parseFloat(testUser.balance));
  });
  
  it('should reject invalid amount', async () => {
    const res = await agent
      .post('/api/admin/transactions/deposits/manual')
      .send({
        userId: testUser.id,
        amount: 'invalid'
      })
      .expect(400);
    
    expect(res.body.error).toContain('Invalid amount');
  });
  
  it('should reject non-existent user', async () => {
    await agent
      .post('/api/admin/transactions/deposits/manual')
      .send({
        userId: 'nonexistent',
        amount: '500'
      })
      .expect(404);
  });
  
  it('should work via adapter route', async () => {
    const res = await agent
      .post(`/api/admin/users/${testUser.id}/deposit`)
      .send({
        amount: '500',
        description: 'Test bonus'
      })
      .expect(200);
    
    expect(res.body.success).toBe(true);
  });
});
```
