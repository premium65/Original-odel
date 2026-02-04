# Admin Authentication Tests

## Test: Admin Login and Session Flow

### Description
Verify that admin login properly sets session and subsequent API calls work correctly.

### Test Cases

#### 1. Admin Login Success
**Steps:**
1. POST `/api/admin/auth/login` with credentials:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
2. Verify response contains admin user data
3. Verify response has `isAdmin: true`
4. Verify session cookie is set

**Expected Result:**
- Status: 200
- Response includes user object with `isAdmin: true`
- Session cookie `connect.sid` is set

#### 2. Admin /me Endpoint
**Steps:**
1. After successful login, GET `/api/admin/auth/me`
2. Verify authenticated session

**Expected Result:**
- Status: 200
- Response includes admin user data
- `isAdmin: true` in response

#### 3. Admin Protected Route Access
**Steps:**
1. After successful login, GET `/api/admin/dashboard/stats`
2. Verify admin has access

**Expected Result:**
- Status: 200
- Response includes dashboard statistics
- No 401 or 403 errors

#### 4. Non-Admin User Access
**Steps:**
1. Login as regular user (non-admin)
2. Try to access `/api/admin/dashboard/stats`

**Expected Result:**
- Status: 403
- Error message: "Admin access required"

#### 5. Unauthenticated Access
**Steps:**
1. Without login, GET `/api/admin/auth/me`

**Expected Result:**
- Status: 401
- Error message: "Not authenticated"

#### 6. Admin Logout
**Steps:**
1. After login, POST `/api/admin/auth/logout`
2. Verify session is destroyed
3. Try to access `/api/admin/auth/me`

**Expected Result:**
- Logout returns success
- Subsequent /me call returns 401

## Test: Session Type Handling

### Description
Verify that the session userId is properly normalized to string type for database lookups.

### Test Cases

#### 1. Numeric userId in Session
**Steps:**
1. Simulate session with numeric userId (if stored as number)
2. Access admin protected route
3. Verify middleware properly coerces to string

**Expected Result:**
- No type errors
- Successful authentication
- Database lookup works correctly

#### 2. String userId in Session
**Steps:**
1. Simulate session with string userId
2. Access admin protected route
3. Verify middleware handles string correctly

**Expected Result:**
- Successful authentication
- Database lookup works correctly

## Implementation Notes

These tests should be implemented using a testing framework like Jest or Mocha with supertest for API testing.

Example test implementation:

```javascript
describe('Admin Authentication', () => {
  let agent;
  
  beforeEach(() => {
    agent = request.agent(app);
  });
  
  it('should login admin successfully', async () => {
    const res = await agent
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);
    
    expect(res.body.isAdmin).toBe(true);
  });
  
  it('should access /me after login', async () => {
    await agent
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    
    const res = await agent
      .get('/api/admin/auth/me')
      .expect(200);
    
    expect(res.body.isAdmin).toBe(true);
  });
  
  it('should access admin protected routes', async () => {
    await agent
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    
    await agent
      .get('/api/admin/dashboard/stats')
      .expect(200);
  });
});
```
