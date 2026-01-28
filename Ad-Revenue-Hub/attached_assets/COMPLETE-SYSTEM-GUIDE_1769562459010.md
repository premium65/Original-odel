# OdelADS - Complete System Guide
## Everything Explained in Detail

---

# 🔢 PART 1: USER BALANCE FIELDS

Every user has these money-related fields:

| Field | Description | Example |
|-------|-------------|---------|
| **milestoneAmount** | Main withdrawable balance | 5000.00 LKR |
| **milestoneReward** | Today's earnings (resets at midnight) | 500.00 LKR |
| **destinationAmount** | Target/goal amount | 10000.00 LKR |
| **ongoingMilestone** | Current milestone progress | 2500.00 LKR |
| **totalAdsCompleted** | Lifetime ads clicked | 150 |
| **points** | Reward points | 75 |
| **pendingAmount** | Pending deposits (from promotions) | 1000.00 LKR |

### Restriction/Promotion Fields:
| Field | Description |
|-------|-------------|
| **restrictionAdsLimit** | Number of ads user must complete in promotion |
| **restrictionDeposit** | Deposit amount shown during promotion |
| **restrictionCommission** | Commission per ad during promotion |
| **restrictedAdsCompleted** | Ads completed in current promotion |

---

# 💰 PART 2: AD CLICK SYSTEM (Earnings Calculation)

## How User Earns Money

### Step 1: User Clicks Ad
```
User on Dashboard → Clicks "Watch Ad" button → 
System records the click → User earns money
```

### Step 2: System Checks If User Has Restriction/Promotion

#### NORMAL MODE (No Restriction):
```
User clicks ad → 
Earns the AD PRICE (e.g., 101.75 LKR) →
Money added to milestoneReward (daily) →
Money added to milestoneAmount (total balance) →
totalAdsCompleted increases by 1
```

**Example:**
- Ad price = 101.75 LKR
- User clicks ad
- milestoneReward: 0 → 101.75
- milestoneAmount: 5000 → 5101.75
- totalAdsCompleted: 149 → 150

#### RESTRICTION/PROMOTION MODE:
```
User clicks ad →
Earns RESTRICTION COMMISSION (not ad price) →
Money added to milestoneReward only →
restrictedAdsCompleted increases by 1 →
When restrictedAdsCompleted >= restrictionAdsLimit → Promotion complete
```

**Example:**
- Restriction set: 50 ads, 50 LKR commission each
- User clicks ad
- milestoneReward: 0 → 50.00
- restrictedAdsCompleted: 24 → 25
- After 50 ads completed → Promotion ends

---

## Ad Click Code Logic (from routes.ts):

```javascript
// When user clicks ad:
app.post("/api/ads/click", async (req, res) => {
  
  // Get the ad that was clicked
  const ad = await storage.getAd(adId);
  
  // Get current user
  const user = await storage.getUser(userId);
  
  // CHECK: Does user have restriction?
  if (user.restrictionAdsLimit !== null) {
    
    // USER IS IN PROMOTION MODE
    
    // Check if promotion completed
    if (user.restrictedAdsCompleted >= user.restrictionAdsLimit) {
      return error("You completed all promotion ads");
    }
    
    // Use RESTRICTION commission (not ad price)
    const commission = user.restrictionCommission;
    
    // Add to daily earnings only
    await storage.addMilestoneReward(userId, commission);
    
    // Increment promotion counter
    await storage.incrementRestrictedAds(userId);
    
    // Increment total ads
    await storage.incrementAdsCompleted(userId);
    
  } else {
    
    // NORMAL MODE - No restriction
    
    // Use AD PRICE as commission
    const commission = ad.price;
    
    // Add to daily earnings
    await storage.addMilestoneReward(userId, commission);
    
    // Add to TOTAL BALANCE (can withdraw)
    await storage.addMilestoneAmount(userId, commission);
    
    // Increment total ads
    await storage.incrementAdsCompleted(userId);
  }
});
```

---

## Earnings Calculation Summary:

| Mode | Commission Source | Added To | Withdrawable? |
|------|------------------|----------|---------------|
| Normal | Ad Price | milestoneReward + milestoneAmount | ✅ Yes |
| Promotion | restrictionCommission | milestoneReward only | ❌ No (until promotion ends) |

---

# 🎁 PART 3: RESTRICTION/PROMOTION SYSTEM

## What Is Restriction?
A "restriction" is actually a **PROMOTION** system where:
- Admin sets special rules for a user
- User must complete X number of ads
- User earns special commission rate (different from normal)
- Used for: new user promos, special offers, limiting earnings

## Setting Restriction (Admin Side):

### Fields Admin Sets:
| Field | What It Means |
|-------|---------------|
| **Ads Limit** | How many ads user must complete (e.g., 50) |
| **Deposit** | Deposit amount to show user (marketing) |
| **Commission** | How much user earns per ad (e.g., 50 LKR) |
| **Pending Amount** | Optional pending amount display |

### Example Promotion Setup:
```
Admin sets for User "john123":
- Ads Limit: 100 ads
- Deposit: 5000 LKR (display only)
- Commission: 75 LKR per ad
- Pending Amount: 2500 LKR

Result:
- John must click 100 ads
- Each click = 75 LKR (not normal ad price)
- After 100 ads: promotion ends
- Total earned: 100 × 75 = 7500 LKR
```

## Restriction Code Logic:

```javascript
// Admin sets restriction:
app.post("/api/admin/users/:userId/restrict", async (req, res) => {
  const { adsLimit, deposit, commission, pendingAmount } = req.body;
  
  await storage.setUserRestriction(userId, {
    restrictionAdsLimit: adsLimit,      // e.g., 100
    restrictionDeposit: deposit,         // e.g., "5000"
    restrictionCommission: commission,   // e.g., "75"
    restrictedAdsCompleted: 0,           // Reset counter
    pendingAmount: pendingAmount         // Optional
  });
});

// Admin removes restriction:
app.post("/api/admin/users/:userId/unrestrict", async (req, res) => {
  await storage.removeUserRestriction(userId);
  // Sets all restriction fields to null
  // User returns to normal mode
});
```

---

# 💸 PART 4: WITHDRAWAL SYSTEM

## User Withdrawal Process:

### Step 1: User Requests Withdrawal
```
User goes to Withdraw page →
Enters amount (e.g., 5000 LKR) →
Enters bank details →
Clicks "Request Withdrawal" →
System creates withdrawal request (status: pending)
```

### Step 2: Admin Reviews
```
Admin sees withdrawal in Admin Panel →
Withdrawal details: User, Amount, Bank Details →
Admin can: Approve or Reject
```

### Step 3A: Admin Approves
```
Admin clicks "Approve" →
User's milestoneAmount DECREASES by withdrawal amount →
Withdrawal status = "approved" →
Admin pays user manually (bank transfer, etc.)
```

### Step 3B: Admin Rejects
```
Admin clicks "Reject" →
Admin enters rejection reason →
Withdrawal status = "rejected" →
Money stays in user's account
```

## Withdrawal Rules:
- User can only withdraw up to their milestoneAmount
- Cannot withdraw more than balance
- Minimum withdrawal amount (configurable)
- Bank details required

## Withdrawal Code Logic:

```javascript
// User requests withdrawal:
app.post("/api/withdrawals", async (req, res) => {
  const { amount, method, accountDetails } = req.body;
  
  // Get user balance
  const user = await storage.getUser(userId);
  const balance = parseFloat(user.milestoneAmount);
  
  // Check if enough balance
  if (amount > balance) {
    return error("Insufficient balance");
  }
  
  // Create withdrawal request
  await storage.createWithdrawal({
    userId: userId,
    amount: amount,
    method: method,
    accountDetails: accountDetails,
    status: "pending"
  });
});

// Admin approves withdrawal:
app.post("/api/admin/withdrawals/:id/approve", async (req, res) => {
  const withdrawal = await storage.getWithdrawal(id);
  
  // Deduct from user balance
  await storage.subtractMilestoneAmount(
    withdrawal.userId, 
    withdrawal.amount
  );
  
  // Update withdrawal status
  await storage.updateWithdrawalStatus(id, "approved");
});

// Admin rejects withdrawal:
app.post("/api/admin/withdrawals/:id/reject", async (req, res) => {
  const { reason } = req.body;
  
  // Just update status, don't touch balance
  await storage.updateWithdrawalStatus(id, "rejected", reason);
});
```

---

# 🏦 PART 5: DEPOSIT SYSTEM

## What Is Deposit?
Admin manually adds money to user's account.

## When To Use:
- User made external payment
- Bonus/reward for user
- Correction/adjustment
- Promotion credit

## Deposit Process:

### From User Detail Page:
```
Admin goes to /admin/users/:id →
Clicks "Add Deposit" →
Enters amount →
Clicks Confirm →
User's milestoneAmount INCREASES
```

### From Deposits Page:
```
Admin goes to /admin/deposits →
Selects user from dropdown →
Enters amount →
Clicks "Add Deposit" →
User's milestoneAmount INCREASES
```

## Deposit Code Logic:

```javascript
// Add deposit to user:
app.post("/api/admin/users/:userId/deposit", async (req, res) => {
  const { amount } = req.body;
  
  // Get current balance
  const user = await storage.getUser(userId);
  const currentBalance = parseFloat(user.milestoneAmount || "0");
  
  // Add deposit amount
  const newBalance = currentBalance + parseFloat(amount);
  
  // Update user
  await storage.updateUser(userId, {
    milestoneAmount: newBalance.toFixed(2)
  });
});
```

---

# 🔄 PART 6: DAILY RESET SYSTEM

## Midnight Reset (Automatic)

Every day at midnight (00:00), the system automatically:
- Resets ALL users' **milestoneReward** to 0
- This is "daily earnings" - resets every day

## Code Logic:

```javascript
// In app.ts - runs at midnight every day
cron.schedule('0 0 * * *', async () => {
  // Reset milestoneReward for ALL users to "0"
  await storage.resetAllMilestoneRewards();
});
```

## What Gets Reset vs What Stays:

| Field | Resets Daily? | Description |
|-------|--------------|-------------|
| milestoneReward | ✅ YES | Today's earnings → 0 |
| milestoneAmount | ❌ NO | Total balance stays |
| totalAdsCompleted | ❌ NO | Lifetime count stays |
| points | ❌ NO | Points stay |
| restrictedAdsCompleted | ❌ NO | Promotion progress stays |

---

# 🛠️ PART 7: PREMIUM MANAGE SYSTEM

Admin's most powerful tool for user management.

## 7 Operations:

### 1. RESET FIELD
Set any user field to 0.

| Resettable Fields |
|------------------|
| milestoneAmount |
| milestoneReward |
| destinationAmount |
| ongoingMilestone |
| totalAdsCompleted |
| points |
| restrictedAdsCompleted |

**Use Case:** User made mistake, need to start fresh

```javascript
// Reset a field
await storage.resetUserField(userId, "milestoneAmount");
// milestoneAmount is now "0"
```

### 2. ADD VALUE
Add amount to any field.

**Example:** Add 500 to milestoneAmount
```javascript
await storage.addUserFieldValue(userId, "milestoneAmount", "500");
// If was 1000, now is 1500
```

### 3. MANUAL DEPOSIT
Quick way to add to balance (milestoneAmount).

### 4. EDIT DETAILS
Change user's:
- Username
- Mobile Number
- Password (will be hashed)

### 5. EDIT BANK DETAILS
Change user's:
- Bank Name
- Account Number
- Account Holder Name
- Branch Name

### 6. SET RESTRICTION (Promotion)
As explained in Part 3.

### 7. REMOVE RESTRICTION
End user's promotion, return to normal mode.

---

# 👤 PART 8: USER STATUS SYSTEM

## 3 Possible Statuses:

| Status | Can Login? | Description |
|--------|-----------|-------------|
| **pending** | ❌ No | New user, waiting for approval |
| **active** | ✅ Yes | Approved, full access |
| **frozen** | ❌ No | Suspended by admin |

## Status Flow:

```
New Registration → status: "pending"
        ↓
Admin Approves → status: "active"
        ↓
Admin Freezes → status: "frozen"
        ↓
Admin Unfreezes → status: "active"
```

## Login Check Code:

```javascript
app.post("/api/auth/login", async (req, res) => {
  const user = await storage.getUserByUsername(username);
  
  // Check password
  if (!verifyPassword(password, user.password)) {
    return error("Invalid password");
  }
  
  // Check status
  if (user.status === "pending") {
    return error("Account pending approval");
  }
  
  if (user.status === "frozen") {
    return error("Account suspended");
  }
  
  // Only "active" users reach here
  // Create session, login successful
});
```

---

# 📊 PART 9: ADS MANAGEMENT

## Ad Structure:

| Field | Description | Example |
|-------|-------------|---------|
| id | Unique identifier | 1 |
| title | Ad name | "Watch Video Ad" |
| description | Ad description | "Watch this video to earn" |
| imageUrl | Ad image | "/images/ad1.jpg" |
| targetUrl | URL when clicked | "https://example.com" |
| price | Commission per click | 101.75 |
| isActive | Is ad shown? | true |

## Admin Operations:

### Create Ad:
```
Admin → /admin/ads → "Add New Ad" →
Fill: Title, Description, Price, Image, URL →
Save → Ad appears in user dashboard
```

### Edit Ad:
```
Admin → /admin/ads → Click ad → Edit →
Change any field → Save
```

### Delete Ad:
```
Admin → /admin/ads → Click delete → Confirm →
Ad removed (existing click history stays)
```

### Enable/Disable Ad:
```
isActive = true → Users can see and click
isActive = false → Ad hidden from users
```

---

# 📈 PART 10: COMPLETE MONEY FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   User registers → status: "pending" → Admin approves → status: "active"

2. EARNING (Normal Mode)
   ┌──────────┐     ┌──────────────┐     ┌──────────────────────┐
   │ User     │────▶│ Click Ad     │────▶│ Earn Ad Price        │
   │ Dashboard│     │ (101.75 LKR) │     │ (e.g., 101.75 LKR)   │
   └──────────┘     └──────────────┘     └──────────────────────┘
                                                   │
                           ┌───────────────────────┴───────────────────┐
                           ▼                                           ▼
                  ┌─────────────────┐                       ┌─────────────────┐
                  │ milestoneReward │                       │ milestoneAmount │
                  │ (Daily Earnings)│                       │ (Total Balance) │
                  │ +101.75         │                       │ +101.75         │
                  └─────────────────┘                       └─────────────────┘
                           │                                           │
                           ▼ (at midnight)                             │
                  ┌─────────────────┐                                  │
                  │ RESET TO 0      │                                  │
                  └─────────────────┘                                  │
                                                                       ▼
3. WITHDRAWAL                                              ┌─────────────────┐
                                                           │ User Requests   │
   ┌─────────────────┐     ┌─────────────────┐            │ Withdrawal      │
   │ Admin Approves  │────▶│ milestoneAmount │◀───────────│ (5000 LKR)      │
   │                 │     │ - 5000 LKR      │            └─────────────────┘
   └─────────────────┘     └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ Admin pays user │
   │ (bank transfer) │
   └─────────────────┘

4. EARNING (Promotion Mode)
   ┌──────────┐     ┌──────────────┐     ┌──────────────────────┐
   │ User     │────▶│ Click Ad     │────▶│ Earn Restriction     │
   │ Dashboard│     │              │     │ Commission (50 LKR)  │
   └──────────┘     └──────────────┘     └──────────────────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────┐
                                         │ milestoneReward │
                                         │ +50 (ONLY)      │
                                         │                 │
                                         │ milestoneAmount │
                                         │ NOT increased   │
                                         └─────────────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────┐
                                         │ restrictedAds   │
                                         │ Completed + 1   │
                                         │                 │
                                         │ When = limit    │
                                         │ → Promotion ends│
                                         └─────────────────┘

5. ADMIN DEPOSIT
   ┌─────────────────┐     ┌─────────────────┐
   │ Admin adds      │────▶│ milestoneAmount │
   │ deposit (1000)  │     │ + 1000          │
   └─────────────────┘     └─────────────────┘
```

---

# 🔐 PART 11: AUTHENTICATION FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN PROCESS                                │
└─────────────────────────────────────────────────────────────────┘

1. User enters username + password
              │
              ▼
2. Server checks username exists?
              │
      ┌───────┴───────┐
      │               │
     NO              YES
      │               │
      ▼               ▼
   ERROR        3. Verify password
   "Invalid"          │
              ┌───────┴───────┐
              │               │
            WRONG          CORRECT
              │               │
              ▼               ▼
           ERROR        4. Check status
           "Invalid"          │
                    ┌─────────┼─────────┐
                    │         │         │
                 pending   active    frozen
                    │         │         │
                    ▼         ▼         ▼
                 ERROR     SUCCESS   ERROR
              "Waiting"   Login OK  "Suspended"
                           │
                           ▼
                    5. Create session
                           │
                           ▼
                    6. Redirect to /dashboard
```

---

# 📋 PART 12: ADMIN CAPABILITIES SUMMARY

| Category | Action | What It Does |
|----------|--------|--------------|
| **Users** | View | See all registered users |
| | Approve | Change pending → active |
| | Freeze | Change active → frozen |
| | Unfreeze | Change frozen → active |
| | Delete | Remove user completely |
| **Money** | Deposit | Add money to user balance |
| | Reset | Set any field to 0 |
| | Add Value | Increase any field |
| **Withdrawals** | View | See all withdrawal requests |
| | Approve | Deduct from balance, mark paid |
| | Reject | Decline request |
| **Promotions** | Set Restriction | Create promotion for user |
| | Remove | End promotion |
| **Ads** | Create | Add new ad |
| | Edit | Modify ad details/price |
| | Delete | Remove ad |
| | Toggle | Enable/disable ad |
| **Content** | All CMS | Edit all site content |

---

# 💡 PART 13: COMMON SCENARIOS

## Scenario 1: New User Journey
```
1. John visits odelads.online
2. Clicks "Register"
3. Fills form, submits
4. Sees "Waiting for approval"
5. Admin sees John in Pending page
6. Admin clicks "Approve"
7. John can now login
8. John goes to dashboard
9. John clicks ads, earns money
10. John requests withdrawal
11. Admin approves withdrawal
12. Admin pays John via bank
```

## Scenario 2: Setting Up Promotion
```
1. Admin wants to give Mary special promo
2. Goes to Premium Manage
3. Selects Mary
4. Clicks "Set Restriction"
5. Sets: 100 ads, 2000 deposit, 75 commission
6. Mary now in promotion mode
7. Mary clicks 100 ads
8. Each click = 75 LKR (not normal price)
9. After 100 ads, promotion ends
10. Mary returns to normal mode
```

## Scenario 3: Handling Complaint
```
1. User claims balance is wrong
2. Admin goes to user detail page
3. Checks transaction history
4. Finds error
5. Uses Premium Manage → Add Value
6. Adds correct amount
7. User sees updated balance
```

## Scenario 4: Suspending User
```
1. Admin suspects fraud
2. Goes to user page
3. Clicks "Freeze Account"
4. User status = frozen
5. User cannot login
6. After investigation:
   - If innocent: Unfreeze
   - If guilty: Delete account
```

---

# ⚠️ IMPORTANT NOTES

## 1. In-Memory Storage
Current CMS settings (branding, slideshow, images, theme) are stored in **MEMORY**:
- Lost when server restarts
- Lost after each deploy
- Solution: Add MongoDB

## 2. Session Storage
Sessions stored in memory:
- Users must re-login after restart
- Solution: Use Redis or database sessions

## 3. No Transaction Log (Currently)
- Deposits/withdrawals not fully logged
- Consider adding transaction history table

## 4. No Email Notifications (Currently)
- Admin must manually check pending users
- Consider adding email alerts

---

# 🔧 ENVIRONMENT VARIABLES

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | ✅ Yes | PostgreSQL connection |
| SESSION_SECRET | ✅ Yes | Session encryption key |
| NODE_ENV | ✅ Yes | "production" |
| MONGO_URI | ❌ Optional | MongoDB for persistent settings |
| PORT | ❌ Optional | Server port (default: 5000) |

---

# 📞 QUICK REFERENCE

## User Earnings Formula:
```
Normal Mode:
  Daily Earnings = Sum of (Ad Prices clicked today)
  Total Balance = Previous Balance + Today's Earnings

Promotion Mode:
  Daily Earnings = restrictionCommission × Ads Clicked Today
  Total Balance = No change (until promotion ends)
```

## Admin Quick Actions:
```
Approve User:    POST /api/admin/users/:id/status {status: "active"}
Freeze User:     POST /api/admin/users/:id/status {status: "frozen"}
Add Deposit:     POST /api/admin/users/:id/deposit {amount: "1000"}
Reset Field:     POST /api/admin/users/:id/reset {field: "milestoneAmount"}
Set Promotion:   POST /api/admin/users/:id/restrict {adsLimit, deposit, commission}
Remove Promo:    POST /api/admin/users/:id/unrestrict
```

---

*Complete System Guide v1.0 - January 2025*
