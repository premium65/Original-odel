# Rating-Ads Platform - Complete Technical Documentation

## How to Recreate This Full Site from Scratch

---

# 1. PROJECT OVERVIEW

## What This Platform Does

**Rating-Ads** is a community-driven earning platform where users:
- Register and wait for admin approval
- Click on ads to earn money (101.75 LKR per click)
- Have a 24-hour cooldown between ad clicks
- Track their financial earnings
- Request withdrawals (requires 28 ads clicked to unlock)
- Admin manages all users, ads, and withdrawals

**Domain:** premiumwork.site

---

# 2. COMPLETE TECH STACK

## Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type-safe JavaScript |
| Vite | 5.x | Build tool & dev server |
| Wouter | 3.x | Lightweight routing |
| TanStack Query | 5.x | Server state & caching |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | Latest | UI component library |
| Radix UI | Latest | Accessible primitives |
| Lucide React | Latest | Icon library |
| Framer Motion | Latest | Animations |

## Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime environment |
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type-safe JavaScript |
| Drizzle ORM | 0.39.x | Database ORM |
| bcrypt | 6.x | Password hashing |
| express-session | Latest | Session management |
| connect-pg-simple | 10.x | PostgreSQL session store |
| Multer | Latest | File uploads |
| Zod | 3.x | Schema validation |

## Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL (Neon) | Cloud database |
| Drizzle ORM | Type-safe queries |

---

# 3. COLOR DESIGN SYSTEM

## Dark Theme (Primary)

### Background Colors
```css
/* Dark Mode Backgrounds */
--background: 0 0% 7%;        /* #121212 - Main background */
--card: 0 0% 9%;              /* #171717 - Card background */
--sidebar: 0 0% 11%;          /* #1C1C1C - Sidebar background */
--popover: 0 0% 13%;          /* #212121 - Popover background */
```

### Text Colors
```css
/* Dark Mode Text */
--foreground: 0 0% 98%;           /* #FAFAFA - Primary text */
--muted-foreground: 0 0% 65%;     /* #A3A3A3 - Secondary text */
```

### Accent Colors (Amber Theme)
```css
/* Amber Accent (Used for buttons, highlights) */
amber-500: #F59E0B    /* Primary amber */
amber-600: #D97706    /* Hover state */
amber-700: #B45309    /* Active state */

/* Brown/Gold Accent */
#B8936B               /* Headers, premium labels */
```

### Status Colors
```css
/* Status Badges */
green-500: #22C55E    /* Active/Approved */
yellow-500: #EAB308   /* Pending */
red-500: #EF4444      /* Frozen/Rejected */
blue-500: #3B82F6     /* Info/Edit buttons */
```

### Button Colors
```css
/* Primary Buttons */
bg-amber-500 hover:bg-amber-600    /* Main action buttons */

/* Action Buttons */
bg-green-600 hover:bg-green-700    /* Approve/Success */
bg-red-600 hover:bg-red-700        /* Reject/Delete */
bg-blue-600 hover:bg-blue-700      /* Edit/Info */

/* Ghost/Outline */
variant="ghost"                     /* Transparent with hover */
variant="outline"                   /* Border only */
```

---

# 4. DATABASE SCHEMA

## Table: users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, active, frozen
  registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_admin INTEGER NOT NULL DEFAULT 0,            -- 0 = user, 1 = admin
  
  -- Bank Details
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  account_holder_name VARCHAR(100),
  branch_name VARCHAR(100),
  
  -- Financial Tracking
  destination_amount NUMERIC(10,2) NOT NULL DEFAULT 25000.00,  -- Registration bonus
  milestone_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,        -- Withdrawable balance
  milestone_reward NUMERIC(10,2) NOT NULL DEFAULT 0.00,        -- Total ad earnings
  total_ads_completed INTEGER NOT NULL DEFAULT 0,
  
  -- Restriction Fields
  restriction_ads_limit INTEGER,
  restriction_deposit NUMERIC(10,2),
  restriction_commission NUMERIC(10,2),
  ongoing_milestone NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  restricted_ads_completed INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 100
);
```

## Table: ads
```sql
CREATE TABLE ads (
  id SERIAL PRIMARY KEY,
  ad_code VARCHAR(20) NOT NULL UNIQUE,    -- AD-0001, AD-0002, etc
  duration INTEGER NOT NULL DEFAULT 10,    -- seconds
  price NUMERIC(10,2) NOT NULL DEFAULT 101.75,  -- reward per click in LKR
  link TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Table: ad_clicks
```sql
CREATE TABLE ad_clicks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  ad_id INTEGER NOT NULL REFERENCES ads(id),
  clicked_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Table: withdrawals
```sql
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, approved, rejected
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP,
  processed_by INTEGER REFERENCES users(id),
  notes TEXT,
  
  -- Bank Details for Withdrawal
  bank_full_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_name VARCHAR(100),
  bank_branch VARCHAR(100)
);
```

## Table: ratings
```sql
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  target_username VARCHAR(50) NOT NULL,
  rating INTEGER NOT NULL,  -- 1-5 stars
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

# 5. USER FLOWS

## Flow 1: Registration → Approval → Login

```
USER REGISTRATION:
┌──────────────────────────────────────────────────────────────┐
│ 1. User visits /register                                     │
│ 2. Fills form: Full Name, Username, Email, Password          │
│ 3. Clicks "Create Account"                                   │
│ 4. Backend creates user with status = "pending"              │
│ 5. User sees "Pending Approval" message                      │
│ 6. User cannot login until approved                          │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
ADMIN APPROVAL:
┌──────────────────────────────────────────────────────────────┐
│ 1. Admin logs into /admin                                    │
│ 2. Goes to Users section                                     │
│ 3. Sees pending user in list                                 │
│ 4. Clicks [Approve] button                                   │
│ 5. User status changes to "active"                           │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
USER LOGIN:
┌──────────────────────────────────────────────────────────────┐
│ 1. User visits /login                                        │
│ 2. Enters username + password                                │
│ 3. Backend checks: status === "active"                       │
│ 4. If active → Redirect to /dashboard                        │
│ 5. If pending → Show "Pending approval" error                │
│ 6. If frozen → Show "Account suspended" error                │
└──────────────────────────────────────────────────────────────┘
```

## Flow 2: Ad Clicking → Earning

```
AD CLICK FLOW:
┌──────────────────────────────────────────────────────────────┐
│ 1. User visits /rating (Ads page)                            │
│ 2. Sees list of available ads with images                    │
│ 3. Clicks on an ad                                           │
│ 4. Ad opens (view for 10 seconds)                            │
│ 5. After viewing, shows heart icon                           │
│ 6. User clicks heart to earn                                 │
│ 7. Backend adds 101.75 LKR to milestone_amount               │
│ 8. Backend adds 101.75 LKR to milestone_reward               │
│ 9. 24-hour cooldown starts for that ad                       │
│ 10. First ad click: destination_amount resets to 0           │
└──────────────────────────────────────────────────────────────┘
```

## Flow 3: Withdrawal Process

```
WITHDRAWAL FLOW:
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: Enter Bank Details                                   │
│ - Full Name (account holder)                                 │
│ - Account Number                                             │
│ - Bank Name                                                  │
│ - Branch Name                                                │
│ - Click "Save & Continue"                                    │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: Enter Amount                                         │
│ - Check: User must have clicked 28+ ads                      │
│ - If < 28 ads: "Withdrawal locked"                           │
│ - If >= 28 ads: Show withdrawal form                         │
│ - Enter amount (max = milestone_amount)                      │
│ - Click "Request Withdrawal"                                 │
│ - Creates withdrawal with status = "pending"                 │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│ ADMIN PROCESSES:                                             │
│ - Admin sees pending withdrawal in /admin/withdrawals        │
│ - Clicks [Approve] or [Reject]                               │
│ - If approved: status = "approved"                           │
│ - If rejected: status = "rejected" + notes                   │
└──────────────────────────────────────────────────────────────┘
```

---

# 6. FRONTEND ARCHITECTURE

## Page Structure

```
client/src/pages/
├── home.tsx              # Landing page (/)
├── register.tsx          # Registration form (/register)
├── login.tsx             # Login form (/login)
├── dashboard.tsx         # User dashboard (/dashboard)
├── rating.tsx            # Ads clicking page (/rating)
├── features.tsx          # Financial tracking (/features)
├── withdraw.tsx          # Withdrawal request (/withdraw)
├── wallet.tsx            # Wallet view (/wallet)
├── points.tsx            # Points page (/points)
├── not-found.tsx         # 404 page
└── admin/
    ├── layout.tsx        # Admin sidebar layout
    ├── dashboard.tsx     # Admin home (/admin)
    ├── users.tsx         # All users (/admin/users)
    ├── pending.tsx       # Pending approvals (/admin/pending)
    ├── user-detail.tsx   # Single user (/admin/users/:id)
    ├── withdrawals.tsx   # Manage withdrawals (/admin/withdrawals)
    ├── premium.tsx       # Premium management (/admin/premium)
    ├── ads.tsx           # Manage ads (/admin/ads)
    ├── deposits.tsx      # Manage deposits (/admin/deposits)
    ├── transactions.tsx  # View transactions (/admin/transactions)
    ├── ratings.tsx       # Manage ratings (/admin/ratings)
    ├── commission.tsx    # Commission settings (/admin/commission)
    ├── social-media.tsx  # Social media (/admin/social-media)
    └── admins.tsx        # Manage admins (/admin/admins)
```

## Component Structure

```
client/src/components/
├── ui/                   # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── form.tsx
│   ├── dialog.tsx
│   ├── badge.tsx
│   ├── table.tsx
│   ├── sidebar.tsx
│   └── ... (50+ components)
├── restrict-user-dialog.tsx
├── reset-confirm-dialog.tsx
├── add-value-dialog.tsx
├── edit-user-dialog.tsx
├── edit-bank-dialog.tsx
└── theme-provider.tsx
```

---

# 7. BACKEND ARCHITECTURE

## API Routes

### Authentication Routes
```
POST /api/auth/register     # Create new user (status: pending)
POST /api/auth/login        # Login (only active users)
POST /api/auth/logout       # Destroy session
GET  /api/auth/me           # Get current user
```

### User Routes
```
POST /api/ratings           # Submit a rating
GET  /api/ratings/my        # Get user's ratings
GET  /api/ads               # Get all ads (with click history)
GET  /api/ads/click-count   # Get user's total ad clicks
POST /api/ads/click         # Record ad click + earn money
POST /api/withdrawals       # Create withdrawal request
GET  /api/withdrawals/my    # Get user's withdrawals
```

### Admin Routes
```
GET  /api/admin/users                    # Get all users
GET  /api/admin/users/:userId            # Get single user
POST /api/admin/users/:userId/status     # Update user status
POST /api/admin/users/:userId/deposit    # Add deposit to user
POST /api/admin/users/:userId/restrict   # Set restriction
POST /api/admin/users/:userId/reset      # Reset field
POST /api/admin/users/:userId/add-value  # Add value to field
PATCH /api/admin/users/:userId/details   # Edit user details
PATCH /api/admin/users/:userId/bank      # Edit bank details

GET  /api/admin/withdrawals              # Get all withdrawals
GET  /api/admin/withdrawals/pending      # Get pending withdrawals
POST /api/admin/withdrawals/:id/approve  # Approve withdrawal
POST /api/admin/withdrawals/:id/reject   # Reject withdrawal

POST /api/admin/ads                      # Create new ad
PUT  /api/admin/ads/:id                  # Update ad
DELETE /api/admin/ads/:id                # Delete ad

GET  /api/admin/ratings                  # Get all ratings
DELETE /api/admin/ratings/:ratingId      # Delete rating
```

## Session Management

```typescript
// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,  // 1 week
  },
}));
```

## Password Hashing

```typescript
const SALT_ROUNDS = 10;

// Hash password
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

---

# 8. KEY FEATURES EXPLAINED

## Feature 1: 25,000 LKR First-Day Bonus

```typescript
// In schema.ts
destinationAmount: numeric("destination_amount")
  .notNull()
  .default("25000.00")  // Registration bonus

// After first ad click, reset to 0
if (totalClicks === 1) {
  await storage.resetDestinationAmount(userId);
}
```

## Feature 2: 101.75 LKR Per Ad Click

```typescript
// In schema.ts
price: numeric("price")
  .notNull()
  .default("101.75")  // Reward per click

// On ad click
await storage.addMilestoneReward(userId, ad.price);  // Track earnings
await storage.addMilestoneAmount(userId, ad.price);  // Add to balance
```

## Feature 3: 24-Hour Cooldown

```typescript
// Check if user can click ad
const lastClick = clickMap.get(adId);
const now = new Date();
const cooldownHours = 24;
const cooldownMs = cooldownHours * 60 * 60 * 1000;

if (lastClick && (now - lastClick) < cooldownMs) {
  // Still in cooldown
  return { canClick: false, timeRemaining: cooldownMs - (now - lastClick) };
}
```

## Feature 4: 28-Ad Unlock for Withdrawals

```typescript
// In withdraw.tsx
const { data: clickCount } = useQuery({
  queryKey: ["/api/ads/click-count"],
});

const isUnlocked = (clickCount?.count || 0) >= 28;

if (!isUnlocked) {
  // Show "Withdrawal locked" message
  // Show progress: X/28 ads completed
}
```

## Feature 5: Financial Tracking Fields

| Field | Purpose | Initial Value |
|-------|---------|---------------|
| `destination_amount` | Shows 25K bonus (resets after first ad) | 25000.00 |
| `milestone_amount` | Withdrawable balance | 0.00 |
| `milestone_reward` | Total earnings from ads | 0.00 |
| `ongoing_milestone` | Pending amount during restriction | 0.00 |
| `points` | User points (modifiable by admin) | 100 |

---

# 9. ADMIN PANEL FEATURES

## 9.1 User Management
- View all registered users
- Approve pending registrations
- Freeze/Unfreeze accounts
- View user details
- Add deposits to user balance

## 9.2 Premium Management
- Set user restrictions (ads limit, deposit, commission)
- Reset user ad count
- Add/set points
- Add premium/normal treasures
- Edit user details (username, mobile)
- Edit bank details

## 9.3 Withdrawal Management
- View all withdrawals
- Filter by status (pending/approved/rejected)
- Approve withdrawals
- Reject withdrawals (with notes)
- View bank details

## 9.4 Ad Management
- Create new ads (upload image, set price, link)
- Edit existing ads
- Delete ads
- View all ads with click statistics

---

# 10. FILE STRUCTURE

```
project-root/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── hooks/
│   │   │   └── use-toast.ts
│   │   ├── lib/
│   │   │   └── queryClient.ts
│   │   ├── pages/
│   │   │   ├── admin/        # Admin pages
│   │   │   └── *.tsx         # User pages
│   │   ├── App.tsx           # Main app with routes
│   │   ├── index.css         # Global styles + CSS variables
│   │   └── main.tsx          # Entry point
│   └── index.html
├── server/
│   ├── db.ts                 # Database connection
│   ├── storage.ts            # Data access layer
│   ├── routes.ts             # API routes
│   ├── index-dev.ts          # Dev entry point
│   └── index-prod.ts         # Production entry point
├── shared/
│   └── schema.ts             # Database schema + types
├── attached_assets/
│   ├── ad_images/            # Uploaded ad images
│   └── *.png                 # Other assets
├── tailwind.config.ts        # Tailwind configuration
├── vite.config.ts            # Vite configuration
├── drizzle.config.ts         # Drizzle configuration
├── package.json
└── tsconfig.json
```

---

# 11. ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Session
SESSION_SECRET=your-secret-key

# PostgreSQL (auto-populated by Replit)
PGHOST=
PGPORT=
PGUSER=
PGPASSWORD=
PGDATABASE=
```

---

# 12. HOW TO SET UP FROM SCRATCH

## Step 1: Create Project
```bash
npm create vite@latest rating-ads -- --template react-ts
cd rating-ads
```

## Step 2: Install Dependencies
```bash
# Frontend
npm install wouter @tanstack/react-query tailwindcss postcss autoprefixer
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-select
npm install react-hook-form @hookform/resolvers zod

# Backend
npm install express express-session bcrypt multer
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit tsx typescript @types/express @types/bcrypt
```

## Step 3: Set Up Database
```bash
# Create PostgreSQL database (use Neon or local)
# Add DATABASE_URL to environment

# Push schema to database
npm run db:push
```

## Step 4: Create Admin User
```sql
-- Insert admin user with hashed password
INSERT INTO users (username, email, password, full_name, status, is_admin)
VALUES ('admin', 'admin@site.com', '$2b$10$...hashed...', 'Administrator', 'active', 1);
```

## Step 5: Start Development
```bash
npm run dev
```

---

# 13. DEFAULT CREDENTIALS

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | 123456 |
| Test User | testaccount | Test@12345 |

---

# 14. MOBILE RESPONSIVE DESIGN

All pages are responsive with:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile
- Touch-friendly buttons
- Stacked layouts on small screens

---

# 15. SECURITY FEATURES

1. **Password Hashing** - bcrypt with 10 salt rounds
2. **Session Cookies** - HTTP-only, secure in production
3. **Admin Authorization** - isAdmin check on all admin routes
4. **Input Validation** - Zod schemas on all inputs
5. **Status Checks** - Only active users can login
6. **CSRF Protection** - Session-based authentication

---

# END OF DOCUMENTATION

This documentation contains everything needed to recreate the Rating-Ads platform from scratch. Follow each section in order to build a complete working copy of the site.

**Total Lines of Code:** ~15,000+
**Total Pages:** 25+
**Total API Endpoints:** 30+
**Database Tables:** 5
