# E-Voucher Admin Authentication - Debug Guide

## Issue
Error when creating E-Voucher: "Failed to create E-Voucher, Reason: Admin access required"

## Quick Fix (Try This First!)

### Option 1: Re-Login as Admin
The most common cause is an expired or corrupted session. Simply:
1. Logout from admin panel
2. Go to `/admin-login`
3. Login again with admin credentials
4. Try E-Voucher again

### Option 2: Verify You're Logged in as Admin
1. Open browser console (F12)
2. Go to Network tab
3. Try creating E-Voucher
4. Look for the POST request to `/api/admin/users/.../evoucher`
5. Check if it returns 401 or 403 status code
   - **401**: Not authenticated → Need to login
   - **403**: Not authorized → User is not admin

---

## Detailed Debugging

### Step 1: Check Server Logs

After the debug logging was added, you'll see detailed authentication logs.

**Start the server:**
```bash
cd Original-odel
npm run dev
```

**Reproduce the issue:**
1. Login to admin panel
2. Go to Premium Manage
3. Select a user
4. Click "E-VOUCHER"
5. Fill and submit form

**Check terminal for logs like:**
```
[ADMIN_AUTH] Checking authentication for: /admin/users/123/evoucher
[ADMIN_AUTH] Session data: { userId: '123', isAdmin: true }
[ADMIN_AUTH] UserId from session: 123
[ADMIN_AUTH] Checking PostgreSQL for user: 123
[ADMIN_AUTH] User found in PostgreSQL, isAdmin: true
[ADMIN_AUTH] SUCCESS: Admin user (PostgreSQL)
```

### Step 2: Identify the Problem

**Look for these failure messages:**

#### Scenario 1: No Session
```
[ADMIN_AUTH] FAILED: No userId in session
```
**Problem:** User is not logged in or session expired
**Fix:** Re-login to admin panel

#### Scenario 2: User Not Found
```
[ADMIN_AUTH] User not found in PostgreSQL
[ADMIN_AUTH] User not found in MongoDB
[ADMIN_AUTH] FAILED: User not found in any storage
```
**Problem:** User ID in session doesn't exist in database
**Fix:** 
- Clear browser cookies and re-login
- OR check if DATABASE_URL is configured correctly

#### Scenario 3: Not an Admin
```
[ADMIN_AUTH] User found in PostgreSQL, isAdmin: false
[ADMIN_AUTH] FAILED: User is not admin (PostgreSQL)
```
**Problem:** User exists but doesn't have admin privileges
**Fix:** Make the user an admin (see below)

---

## Making a User an Admin

### Method 1: Via Database (PostgreSQL)
```sql
-- If using PostgreSQL
UPDATE users SET "isAdmin" = true WHERE username = 'yourusername';
```

### Method 2: Via MongoDB
```javascript
// If using MongoDB
db.users.updateOne(
  { username: 'yourusername' },
  { $set: { isAdmin: true } }
)
```

### Method 3: Via In-Memory (Development)
Edit `server/memStorage.ts`:
```typescript
export const inMemoryUsers: any[] = [
  {
    id: "admin",
    username: "admin",
    email: "admin@example.com",
    password: "$2b$10$...", // hashed password
    isAdmin: true,  // ← Make sure this is true
    // ... other fields
  }
];
```

---

## Verifying Admin Status

### Check via API
Open browser console and run:
```javascript
fetch('/api/admin/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
```

Should return:
```json
{
  "user": {
    "id": "123",
    "username": "admin",
    "email": "admin@example.com",
    "isAdmin": true  ← Must be true!
  }
}
```

### Check Session Cookie
1. Open browser DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Look for cookie named `connect.sid`
4. Verify it exists and has a value
5. If missing → Session not saved, check server logs for session errors

---

## Common Issues & Solutions

### Issue 1: Session Not Persisting
**Symptoms:**
- Must login every page refresh
- Session cookie not saved
- `[ADMIN_AUTH] No userId in session` in logs

**Solutions:**
- Check browser allows cookies (not in incognito/private mode)
- Check `SESSION_SECRET` environment variable is set
- Check server logs for session errors on startup
- Try different browser

### Issue 2: CORS Error
**Symptoms:**
- Browser console shows CORS error
- Requests blocked
- Credentials not sent

**Solutions:**
- Server should use `credentials: true` in CORS config (already done)
- Frontend should use `credentials: 'include'` in fetch (already done)
- Check if accessing via correct domain (not mixing localhost/127.0.0.1)

### Issue 3: Wrong Admin User
**Symptoms:**
- Can login but get "Admin access required"
- `[ADMIN_AUTH] User is not admin` in logs

**Solutions:**
- Login with correct admin account
- OR make your current user an admin (see above)
- Default admin credentials: username: `admin`, password: `admin123`

---

## Testing E-Voucher After Fix

Once authentication is working:

1. **Login as admin** at `/admin-login`
2. **Go to Premium Manage** at `/admin/premium-manage`
3. **Select a user** (click on username in list)
4. **Click "E-VOUCHER"** button (orange with Gift icon)
5. **Fill the form:**
   - Milestone Ads Count: e.g., 21 (when to lock ads)
   - Milestone Amount: e.g., -5000 (negative means user owes)
   - Milestone Reward: e.g., 2000
   - Ongoing Milestone: e.g., 9000
   - Banner URL: (optional) image URL
6. **Click "Create E-Voucher"**
7. **Should see success toast:** "E-Voucher Created!"

---

## What E-Voucher Does

**E-Voucher = Milestone Hold System**

When you create an E-Voucher:
- User's ads will **lock** when they reach the target count (e.g., 21 ads)
- User must make a **deposit** to unlock ads
- The `milestoneAmount` shows what they owe (negative) or have earned (positive)
- Motivates users to deposit to continue earning

**Example:**
- Set Milestone Ads Count: 21
- User clicks 21 ads
- Ads become locked (`adsLocked = true`)
- User sees banner telling them to deposit
- After deposit, ads unlock and they can continue

---

## Support

If you still have issues after following this guide:

1. **Share server logs:** Copy the `[ADMIN_AUTH]` log lines
2. **Share what you tried:** Which fix methods you attempted
3. **Share error details:** Exact error message and when it occurs
4. **Share browser console:** Any JavaScript errors (F12 → Console)

---

## Summary Checklist

- [ ] Tried re-logging in as admin
- [ ] Verified session cookie exists in browser
- [ ] Checked server logs for `[ADMIN_AUTH]` messages
- [ ] Confirmed user has `isAdmin: true` in database
- [ ] Can access `/api/admin/auth/me` successfully
- [ ] No CORS errors in browser console
- [ ] Using correct admin credentials

If all checked and still failing, there may be a deeper issue. Share the debug logs for further help!
