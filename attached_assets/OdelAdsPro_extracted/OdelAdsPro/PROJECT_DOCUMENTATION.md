# OdelAdsPro - Complete Technical Documentation

## How to Recreate This Full Site from Scratch

---

# 1. PROJECT OVERVIEW

## What This Platform Does

**OdelAdsPro** is a community-driven earning platform where users:
- Register with mobile number verification
- Wait for admin approval before using platform
- Click on ads to earn money (101.75 LKR per click)
- Have a 24-hour cooldown between ad clicks
- Track their financial earnings in real-time
- Request withdrawals (requires minimum 28 ads clicked to unlock)
- Admin manages all users, ads, withdrawals, and platform operations

**Domain:** premiumwork.site  
**Platform:** Full-stack with React + Express + MongoDB

---

# 2. COMPLETE TECH STACK

## Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| JavaScript/JSX | ES2020+ | Frontend logic |
| Vite | 5.x | Build tool & dev server |
| React Router | 7.x | Page routing |
| Wouter | 3.x | Lightweight alternative routing |
| Tailwind CSS | 3.4.x | Utility-first styling |
| Radix UI | Latest | Accessible UI primitives |
| Lucide React | 0.308+ | Icon library |
| Class Variance Authority | 0.7.0 | Component variants |

## Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime environment |
| Express.js | 4.21.x | Web framework |
| Mongoose | 8.x-9.x | MongoDB ODM |
| MongoDB | Latest | NoSQL database |
| Bcrypt | 5.1.x | Password hashing (10 rounds) |
| Express-Session | 1.17.x | Session management |
| CORS | 2.8.x | Cross-origin support |
| Dotenv | 16.x | Environment variables |

## Database
| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Cloud NoSQL database |
| Mongoose Schemas | Data modeling & validation |

---

# 3. COLOR DESIGN SYSTEM

## Dark Theme (Primary)

### Background Colors
```
Main Background: #000814 (dark navy)
Card Background: #1a1a2e (dark charcoal)
Sidebar Background: #16213e (darker navy)
```

### Text Colors
```
Primary Text: #ffffff (white)
Secondary Text: #e5e5ff (light purple-white)
Tertiary Text: #dcdcff (muted purple-white)
```

### Accent Colors
```
Primary Button: #F59E0B (amber-500)
Hover State: #D97706 (amber-600)
Active State: #B45309 (amber-700)
Header Accent: #B8936B (brown/gold)
```

### Status Colors
```
Approved/Active: #22C55E (green)
Pending: #EAB308 (yellow)
Frozen/Rejected: #EF4444 (red)
Info/Edit: #3B82F6 (blue)
```

---

# 4. DATABASE SCHEMA (MongoDB Collections)

## Collection: users

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed with bcrypt, required),
  fullName: String (required),
  mobileNumber: String,
  
  // Account Status
  isApproved: Boolean (default: false),
  isFrozen: Boolean (default: false),
  isAdmin: Number (0 = user, 1 = admin, default: 0),
  
  // Bank Details
  bankName: String,
  accountNumber: String,
  accountHolderName: String,
  branchName: String,
  
  // Financial Tracking
  destinationAmount: Number (default: 25000),      // First-day bonus
  milestoneAmount: Number (default: 0),            // Withdrawable balance
  milestoneReward: Number (default: 0),            // Total lifetime earnings
  
  // Ad Tracking
  adsClicked: Number (default: 0),
  lastAdClick: Date,
  
  // Timestamps
  createdAt: Date (default: Date.now)
}
```

## Collection: ads

```javascript
{
  _id: ObjectId,
  adCode: String (unique, e.g., "AD-0001"),
  title: String,
  description: String,
  duration: Number (seconds, default: 10),
  price: Number (default: 101.75 LKR),
  link: String (URL to ad),
  imageUrl: String (path to ad image),
  isActive: Boolean (default: true),
  createdAt: Date (default: Date.now)
}
```

## Collection: adClicks

```javascript
{
  _id: ObjectId,
  userId: ObjectId (references users),
  adId: ObjectId (references ads),
  earnings: Number (101.75),
  clickedAt: Date (default: Date.now)
}
```

## Collection: withdrawals

```javascript
{
  _id: ObjectId,
  userId: ObjectId (references users),
  amount: Number (withdrawal amount in LKR),
  status: String ("pending" | "approved" | "rejected"),
  
  // Bank Details for Withdrawal
  bankFullName: String,
  bankAccountNumber: String,
  bankName: String,
  bankBranch: String,
  
  // Processing Info
  notes: String,
  processedBy: ObjectId (admin who processed),
  processedAt: Date,
  
  createdAt: Date (default: Date.now)
}
```

## Collection: ratings

```javascript
{
  _id: ObjectId,
  userId: ObjectId (references users),
  targetUsername: String,
  rating: Number (1-5 stars),
  comment: String,
  createdAt: Date (default: Date.now)
}
```

---

# 5. USER FLOWS

## Flow 1: User Registration → Admin Approval → Login

```
STEP 1: USER REGISTRATION
┌────────────────────────────────────────────────────────────┐
│ User visits /register                                      │
│ Fills form:                                                │
│  • Full Name                                               │
│  • Email                                                   │
│  • Mobile Number (new field!)                              │
│  • User Code / Username                                    │
│  • Password (min 6 characters)                             │
│  • Confirm Password                                        │
│                                                            │
│ Backend:                                                   │
│  1. Validates all fields required                          │
│  2. Checks email/username unique                           │
│  3. Hashes password with bcrypt (10 rounds)                │
│  4. Creates user with isApproved: false                    │
│  5. Sets destinationAmount: 25000 LKR                      │
│  6. Generates userCode (ODA + 6 random digits)             │
│                                                            │
│ Response: Success + userCode displayed                     │
└────────────────────────────────────────────────────────────┘
         │
         ▼
STEP 2: WAIT FOR APPROVAL
┌────────────────────────────────────────────────────────────┐
│ User status: isApproved = false                            │
│ User sees: "Your account is pending admin approval"        │
│ User cannot login until approved                           │
└────────────────────────────────────────────────────────────┘
         │
         ▼
STEP 3: ADMIN APPROVES
┌────────────────────────────────────────────────────────────┐
│ Admin logs in to /admin                                    │
│ Admin clicks "Pending Approvals"                           │
│ Admin reviews pending user                                 │
│ Admin clicks [Approve] button                              │
│ User status changes: isApproved: true                      │
│ Email notification sent (optional)                         │
└────────────────────────────────────────────────────────────┘
         │
         ▼
STEP 4: USER LOGIN
┌────────────────────────────────────────────────────────────┐
│ User visits /login                                         │
│ Enters email + password                                    │
│                                                            │
│ Backend:                                                   │
│  1. Finds user by email                                    │
│  2. Compares password with bcrypt.compare()                │
│  3. Checks: isApproved === true                            │
│  4. Checks: isFrozen === false                             │
│                                                            │
│ If all good → Session created → Redirect /dashboard        │
│ If not approved → Show "Pending approval" error            │
│ If frozen → Show "Account suspended" error                 │
└────────────────────────────────────────────────────────────┘
```

## Flow 2: Ad Clicking & Earning Money

```
EARNING CALCULATION:
┌────────────────────────────────────────────────────────────┐
│ PER AD CLICK:                                              │
│  • Earns: 101.75 LKR                                       │
│  • Duration: 10 seconds view                               │
│  • Cooldown: 24 hours per ad                               │
│  • No daily limit (can click multiple ads)                 │
│                                                            │
│ FINANCIAL UPDATES:                                         │
│  1. milestoneAmount += 101.75 (can withdraw this)         │
│  2. milestoneReward += 101.75 (lifetime total)            │
│  3. adsClicked += 1 (counter)                             │
│  4. If first ad: destinationAmount = 0 (bonus used)       │
│                                                            │
│ EXAMPLE - 7 DAYS:                                          │
│  Day 1-7: Click 4 ads/day = 28 ads total                  │
│  Total earned: 28 × 101.75 = 2,849 LKR                    │
│  destinationAmount: 25,000 → 0 (resets after first ad)    │
│  milestoneAmount: 0 → 2,849 LKR                           │
│  milestoneReward: 0 → 2,849 LKR                           │
└────────────────────────────────────────────────────────────┘
```

## Flow 3: Withdrawal System

```
REQUIREMENTS:
┌────────────────────────────────────────────────────────────┐
│ • Minimum ads clicked: 28                                  │
│ • Minimum withdrawal: 1 LKR                                │
│ • Maximum withdrawal: milestoneAmount (your balance)       │
│ • Processing: Admin approval required                      │
│ • Status tracking: pending → approved/rejected             │
└────────────────────────────────────────────────────────────┘

STEP 1: ENTER BANK DETAILS
┌────────────────────────────────────────────────────────────┐
│ User clicks "Request Withdrawal"                           │
│ Fills form:                                                │
│  • Account Holder Name                                     │
│  • Bank Name (e.g., Bank of Ceylon)                        │
│  • Account Number                                          │
│  • Branch Name                                             │
│                                                            │
│ Validation: All fields required                            │
│ Saves bank details for withdrawal                          │
└────────────────────────────────────────────────────────────┘
         │
         ▼
STEP 2: ENTER AMOUNT
┌────────────────────────────────────────────────────────────┐
│ System checks:                                             │
│  • adsClicked >= 28? → If no, show "Locked"               │
│  • If yes, show withdrawal form                            │
│                                                            │
│ User enters amount                                         │
│ System validates:                                          │
│  • amount > 0?                                             │
│  • amount <= milestoneAmount?                              │
│                                                            │
│ If valid → Creates withdrawal with status: "pending"      │
│ If invalid → Shows error message                          │
└────────────────────────────────────────────────────────────┘
         │
         ▼
STEP 3: ADMIN APPROVES
┌────────────────────────────────────────────────────────────┐
│ Admin sees pending withdrawal in /admin/withdrawals        │
│ Reviews: User info, Amount, Bank details                   │
│                                                            │
│ If [Approve]:                                              │
│  1. Status: "pending" → "approved"                         │
│  2. Deduct from milestoneAmount:                           │
│     milestoneAmount -= withdrawal amount                   │
│  3. processedBy: Admin ID                                  │
│  4. processedAt: Current timestamp                         │
│                                                            │
│ If [Reject]:                                               │
│  1. Status: "pending" → "rejected"                         │
│  2. Add rejection notes (optional)                         │
│  3. milestoneAmount stays the same                         │
│                                                            │
│ User sees withdrawal status update                         │
└────────────────────────────────────────────────────────────┘
```

---

# 6. COMPLETE API ENDPOINTS

## Authentication Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

## Admin Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| GET | `/api/admin/users` | List all users | Admin |
| GET | `/api/admin/users/:id` | Get user details | Admin |
| GET | `/api/admin/pending` | List pending approvals | Admin |
| PUT | `/api/admin/approve/:id` | Approve user | Admin |
| PUT | `/api/admin/freeze/:id` | Freeze user | Admin |
| PUT | `/api/admin/unfreeze/:id` | Unfreeze user | Admin |
| PUT | `/api/admin/users/:id` | Update user | Admin |

## Ads Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/ads` | Get ads with user clicks | Yes |
| POST | `/api/ads/click/:id` | Click ad (earn money) | Yes |
| GET | `/api/admin/ads` | List all ads (admin) | Admin |
| POST | `/api/admin/ads` | Create new ad | Admin |
| PUT | `/api/admin/ads/:id` | Update ad | Admin |
| DELETE | `/api/admin/ads/:id` | Delete ad | Admin |

## Withdrawal Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/withdrawals` | Request withdrawal | Yes |
| GET | `/api/withdrawals/my` | My withdrawals | Yes |
| GET | `/api/withdrawals` | All withdrawals (admin) | Admin |
| PUT | `/api/withdrawals/approve/:id` | Approve withdrawal | Admin |
| PUT | `/api/withdrawals/reject/:id` | Reject withdrawal | Admin |

## Ratings Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/ratings` | Get all ratings | No |
| GET | `/api/ratings/my` | My ratings | Yes |
| POST | `/api/ratings` | Create rating | Yes |
| DELETE | `/api/ratings/:id` | Delete rating (admin) | Admin |

## User Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Get my profile | Yes |
| PUT | `/api/users/profile` | Update my profile | Yes |

---

# 7. FRONTEND STRUCTURE

## Page Organization

```
client/src/
├── pages/
│   ├── Home.jsx              # Landing page (/)
│   ├── Register.jsx          # User registration (/register)
│   ├── Login.jsx             # User login (/login)
│   ├── Dashboard.jsx         # User dashboard (/dashboard)
│   ├── Features.jsx          # Feature overview (/features)
│   ├── Rating.jsx            # Ad clicking page (/rating)
│   ├── Wallet.jsx            # Wallet & balance view (/wallet)
│   ├── Points.jsx            # Points/reputation (/points)
│   └── admin/
│       ├── dashboard.jsx     # Admin home (/admin)
│       ├── users.jsx         # User management (/admin/users)
│       ├── pending.jsx       # Pending approvals (/admin/pending)
│       ├── withdrawals.jsx   # Withdrawal approvals (/admin/withdrawals)
│       ├── ads.jsx           # Ad management (/admin/ads)
│       ├── ratings.jsx       # Rating management (/admin/ratings)
│       ├── premium.jsx       # Advanced user controls (/admin/premium)
│       └── user-detail.jsx   # Individual user detail (/admin/users/:id)
│
├── components/
│   ├── Navbar.jsx            # Navigation component
│   └── ...                   # Other reusable components
│
├── assets/
│   ├── bg_home.jpg           # Home page background
│   ├── ads/
│   │   ├── photo_1.jpg
│   │   ├── photo_2.jpg
│   │   └── ... (ad images)
│   └── ...
│
├── App.jsx                   # Main router
├── index.css                 # Global styles
└── main.jsx                  # Entry point
```

## Key Components & Their Functions

| Component | File | Purpose |
|-----------|------|---------|
| Home Page | `Home.jsx` | Landing with parallax background |
| Registration | `Register.jsx` | User signup (mobile field required!) |
| Login | `Login.jsx` | Authentication |
| Dashboard | `Dashboard.jsx` | User stats & quick actions |
| Features | `Features.jsx` | Platform features explanation |
| Rating Page | `Rating.jsx` | Ad browsing & clicking |
| Wallet | `Wallet.jsx` | Balance display |
| Points | `Points.jsx` | Reputation display |
| Admin Dashboard | `admin/dashboard.jsx` | Stats & overview |
| User Management | `admin/users.jsx` | List all users |
| Pending Approvals | `admin/pending.jsx` | New user approvals |
| Withdrawal Mgmt | `admin/withdrawals.jsx` | Approve/reject withdrawals |
| Ad Management | `admin/ads.jsx` | Create/edit/delete ads |
| Rating Management | `admin/ratings.jsx` | View/delete ratings |
| Premium Controls | `admin/premium.jsx` | Advanced user restrictions |

---

# 8. BACKEND STRUCTURE

## Server Entry Point

```
server/
├── index.js              # Main server file
├── models/
│   ├── User.js          # Mongoose User schema
│   ├── Ad.js            # Mongoose Ad schema
│   ├── AdClick.js       # Mongoose AdClick schema
│   ├── Withdrawal.js    # Mongoose Withdrawal schema
│   └── Rating.js        # Mongoose Rating schema
│
├── routes/
│   ├── auth.js          # Auth endpoints
│   ├── admin-fixed.js   # Admin endpoints
│   ├── ads-fixed.js     # Ad endpoints
│   ├── withdrawals-fixed.js # Withdrawal endpoints
│   ├── users-fixed.js   # User endpoints
│   └── ratings-fixed.js # Rating endpoints
│
├── middleware/
│   └── auth.js          # Authentication middleware
│
├── controllers/
│   └── ...              # Controller functions
│
├── .env                 # Environment variables
└── package.json         # Dependencies
```

---

# 9. INSTALLATION & SETUP

## Prerequisites
- Node.js 20.x or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

## Frontend Setup

```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Backend Setup

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your MongoDB URL
# MONGO_URL=mongodb://127.0.0.1:27017/odeladspro
# OR
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/odeladspro

# Start server
npm run dev

# Server runs on http://0.0.0.0:5000
```

---

# 10. DEPLOYMENT CHECKLIST

## Before Publishing

- [ ] All user registration fields validated
- [ ] Admin approval system tested
- [ ] Ad clicking & earning verified
- [ ] 24-hour cooldown working
- [ ] Withdrawal system tested with admin approval
- [ ] All 28 ads created in database
- [ ] Background images configured
- [ ] Mobile number field in registration
- [ ] 101.75 LKR per click verified
- [ ] Destination amount resets after first ad
- [ ] Admin dashboard fully functional
- [ ] All 8+ admin pages operational

## Environment Variables

```
MONGO_URL=mongodb://...
PORT=5000
SESSION_SECRET=your-secret-key
NODE_ENV=production
```

---

# 11. TESTING WORKFLOWS

## User Registration → Approval → Login
```
1. Go to /register
2. Fill all fields including mobile number
3. User Code auto-generated (ODA + 6 digits)
4. Login as admin
5. Approve pending user
6. Original user can now login
7. See dashboard with stats
```

## Ad Clicking & Earning
```
1. Login as approved user
2. Go to /rating (Ads page)
3. Click on first ad
4. Earning displays: +101.75 LKR
5. Check dashboard → milestoneAmount increased
6. Try clicking same ad within 24h → shows cooldown timer
7. Wait 24h or check next ad
```

## Withdrawal Process
```
1. User must have clicked 28+ ads first
2. Go to /wallet
3. Click "Request Withdrawal"
4. Enter bank details
5. Enter amount (≤ milestoneAmount)
6. Submit
7. Login as admin
8. Go to /admin/withdrawals
9. Review withdrawal
10. Click [Approve] or [Reject]
11. Amount deducted from milestoneAmount if approved
```

---

# 12. TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Login fails after registration | Admin hasn't approved yet (isApproved = false) |
| Can't withdraw | Must click 28+ ads first |
| Ad click not earning | Check 24-hour cooldown |
| Balance not updating | Refresh page / Check network tab |
| Admin routes not working | Check isAdmin = 1 in database |
| Destination amount shows in wallet | Resets to 0 after first ad click |

---

# 13. KEY DIFFERENCES FROM OTHER PLATFORMS

✅ **Registration with Mobile Number** - Required field for contact verification  
✅ **Admin Approval System** - Users must be approved before accessing platform  
✅ **Fixed 101.75 LKR per click** - No variable rates  
✅ **Destination Bonus (25,000 LKR)** - Resets to 0 after first ad  
✅ **28-Ad Withdrawal Unlock** - Clear milestone for users  
✅ **24-Hour Cooldown** - Per individual ad (not per platform)  
✅ **Separate Financial Tracking** - milestone Amount (withdrawable) vs Reward (total earned)  
✅ **Full Admin Dashboard** - 8+ management pages  

---

# 14. CONTACT & SUPPORT

**Platform:** premiumwork.site  
**Database:** MongoDB (Mongoose)  
**Frontend:** React 18 + Vite  
**Backend:** Express + Node.js  

For issues or support, contact admin through platform.

---

**Last Updated:** November 27, 2025  
**Status:** Production Ready ✅
