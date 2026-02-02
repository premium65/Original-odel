# CLAUDE.md - AI Assistant Guide for ODEL ADS Platform

## Project Overview

**ODEL ADS** (Rating-Ads Platform) is a full-stack web application where users earn money by clicking/watching ads (101.75 LKR per click). It features a comprehensive admin panel for user management, ad management, financial operations, and CMS capabilities.

### Quick Facts
- **Type**: Full-stack monorepo (React + Express.js + PostgreSQL)
- **Currency**: Sri Lankan Rupee (LKR)
- **Reward Per Ad**: 101.75 LKR
- **Platform**: Designed for Replit deployment, supports Windows/Docker
- **Database Support**: PostgreSQL (primary), MongoDB (fallback), In-memory (development)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18.3 | UI framework |
| TypeScript 5.6 | Type safety |
| Vite 5.4 | Build tool & dev server |
| Wouter 3.3 | Client-side routing |
| TanStack Query 5.60 | Server state management |
| Tailwind CSS 3.4 | Utility-first styling |
| shadcn/ui + Radix | Component library |
| Lucide React | Icons |
| Framer Motion | Animations |
| React Hook Form + Zod | Form validation |
| Recharts | Dashboard charts |

### Backend
| Technology | Purpose |
|------------|---------|
| Express.js 4.21 | Web framework |
| Drizzle ORM 0.39 | Type-safe database queries |
| PostgreSQL (Neon) | Primary database |
| MongoDB (Mongoose 9) | Fallback database |
| bcrypt 6 | Password hashing |
| express-session | Session management |
| Multer 2 | File uploads |
| node-cron | Scheduled tasks |
| connect-pg-simple | PostgreSQL session store |

---

## Directory Structure

```
Original-odel/
├── client/                   # Frontend React application
│   ├── src/
│   │   ├── App.tsx          # Main app with routing (60+ routes)
│   │   ├── main.tsx         # React entry point
│   │   ├── index.css        # Global styles
│   │   ├── lib/             # Utilities
│   │   │   ├── api.ts       # API client with typed methods
│   │   │   ├── auth-utils.ts # Authentication utilities
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── use-auth.ts      # User authentication
│   │   │   ├── use-admin-auth.ts # Admin authentication
│   │   │   ├── use-ads.ts       # Ad operations
│   │   │   ├── use-users.ts     # User management
│   │   │   ├── use-withdrawals.ts
│   │   │   └── use-toast.ts
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/          # 50+ shadcn/ui components
│   │   │   ├── admin-layout.tsx
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── layout-shell.tsx
│   │   │   └── stats-card.tsx
│   │   └── pages/           # Route pages
│   │       ├── dashboard.tsx    # User dashboard
│   │       ├── ads-hub.tsx      # Ad clicking interface
│   │       ├── withdraw.tsx     # Withdrawal requests
│   │       ├── rewards.tsx      # VIP rewards system
│   │       ├── events.tsx       # Promotional events
│   │       ├── settings.tsx     # User settings
│   │       ├── landing.tsx      # Home page
│   │       ├── auth.tsx         # Login/Register
│   │       └── admin/           # 34 admin pages
│   │           ├── dashboard.tsx
│   │           ├── users.tsx
│   │           ├── pending-users.tsx
│   │           ├── admins.tsx
│   │           ├── ads.tsx
│   │           ├── withdrawals.tsx
│   │           ├── deposits.tsx
│   │           ├── premium.tsx
│   │           ├── premium-manage.tsx
│   │           └── ... (30+ more)
│   └── index.html
│
├── server/                   # Backend Express application
│   ├── index-dev.ts         # Development entry (with Vite)
│   ├── index-prod.ts        # Production entry
│   ├── app.ts               # Express app setup
│   ├── routes.ts            # Main API routes
│   ├── db.ts                # PostgreSQL connection
│   ├── storage.ts           # Data access layer
│   ├── memStorage.ts        # In-memory storage (fallback)
│   ├── mongoStorage.ts      # MongoDB storage adapter
│   ├── mongoConnection.ts   # MongoDB connection manager
│   ├── premiumRoutes.ts     # Premium plan routes
│   └── routes/admin/        # Modular admin routes
│       ├── index.ts         # Route registration
│       ├── auth.ts          # Admin authentication
│       ├── users.ts         # User management (CRUD, approve, freeze)
│       ├── ads.ts           # Ad management
│       ├── dashboard.ts     # Dashboard stats
│       ├── transactions.ts  # Transaction history
│       ├── settings.ts      # Site settings
│       └── premium.ts       # Premium plans
│
├── shared/                   # Shared code between client/server
│   ├── schema.ts            # Drizzle ORM schema + Zod schemas (40+ tables)
│   ├── routes.ts            # Shared route definitions
│   └── models/
│       └── auth.ts          # User & session tables
│
├── attached_assets/          # Static assets and uploads
├── migrations/               # Database migrations
│
└── Configuration Files
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── drizzle.config.ts
    ├── tailwind.config.ts
    └── postcss.config.js
```

---

## Development Commands

```bash
# Start development server (hot reload)
npm run dev

# Type check
npm run check

# Build for production
npm run build

# Start production server
npm start

# Push database schema changes
npm run db:push
```

---

## Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

```typescript
"@/*"       -> "./client/src/*"
"@shared/*" -> "./shared/*"
"@assets"   -> "./attached_assets"
```

**Usage:**
```typescript
import { Button } from "@/components/ui/button";
import { users } from "@shared/schema";
```

---

## Database Schema

### Core Tables

**users** (shared/models/auth.ts:16)
```typescript
{
  id: varchar (UUID, primary key),
  email: varchar (unique),
  username: text,
  password: text (bcrypt hashed),
  firstName, lastName: varchar,
  profileImageUrl: varchar,
  mobileNumber: text,

  // Role & Status
  isAdmin: boolean (default: false),
  status: text ("pending" | "active" | "frozen"),

  // Balance Fields
  balance: decimal (default: "0.00"),
  milestoneAmount: decimal,      // Withdrawable balance
  milestoneReward: decimal,      // Total earnings ever
  destinationAmount: decimal,    // 25,000 LKR first-day bonus
  ongoingMilestone: decimal,
  pendingAmount: decimal,
  totalAdsCompleted: integer,
  points: integer (0-100),       // VIP tier points

  // Restriction/Promotion Fields (E-Voucher system)
  restrictionAdsLimit: integer,
  restrictionDeposit: decimal,
  restrictionCommission: decimal,
  restrictedAdsCompleted: integer,

  // E-Voucher (Milestone Hold System)
  milestoneAdsCount: integer,    // Trigger point - when to lock ads
  adsLocked: boolean,            // If true, user cannot click ads until deposit
  eVoucherBannerUrl: text,       // Banner image for E-Voucher popup

  // E-Bonus (Instant Reward - NO locking)
  bonusAdsCount: integer,        // Trigger point for instant bonus
  bonusAmount: decimal,          // Amount to add to wallet
  eBonusBannerUrl: text,         // Banner image for E-Bonus popup

  // Deposit tracking
  hasDeposit: boolean,

  // Preferences
  notificationsEnabled: boolean,
  language: text,
  theme: text,

  // Bank Details
  bankName, accountNumber, accountHolderName, branchName: text,

  createdAt, updatedAt: timestamp
}
```

**ads** (shared/schema.ts:19)
```typescript
{
  id: serial,
  title, description: text,
  imageUrl, targetUrl: text,
  price, reward: decimal,
  type: text ("click" default),
  url: text,
  duration: integer (default: 30),
  totalViews: integer,
  isActive: boolean,
  createdAt: timestamp
}
```

**withdrawals** (shared/schema.ts:37)
```typescript
{
  id: serial,
  userId: varchar (FK -> users),
  amount: decimal,
  method: text,
  accountDetails: text,
  bankName, bankAccount: text,
  processedBy: varchar (admin ID),
  processedAt: timestamp,
  status: text ("pending" | "approved" | "rejected"),
  reason: text (rejection reason),
  createdAt: timestamp
}
```

**adClicks** (shared/schema.ts:121)
```typescript
{
  id: serial,
  userId: varchar (FK -> users),
  adId: integer (FK -> ads),
  earnedAmount: decimal,
  createdAt: timestamp
}
```

### VIP & Premium Tables

**premiumPlans** (shared/schema.ts:241)
```typescript
{
  id: serial,
  name, description: text,
  price: decimal,
  currency: text (default: "LKR"),
  totalAds: integer (default: 28),
  rewardPerAd, totalReward: decimal,
  commission: decimal,
  welcomeBonus: decimal (default: "25000.00"),
  features: jsonb,
  isActive: boolean,
  sortOrder: integer,
  createdAt: timestamp
}
```

**premiumPurchases** (shared/schema.ts:258)
```typescript
{
  id: serial,
  userId: varchar (FK -> users),
  planId: integer (FK -> premiumPlans),
  amount: decimal,
  status: text ("pending" | "approved" | "rejected"),
  paymentMethod, paymentReference: text,
  processedBy: varchar,
  processedAt, createdAt: timestamp
}
```

### CMS Tables
| Table | Purpose |
|-------|---------|
| `slides` / `slideshow` | Home page carousel |
| `siteSettings` / `settings` | Key-value config |
| `contactInfo` / `contacts` | Contact details |
| `infoPages` | About, Terms, Privacy pages |
| `events` | Promotional events |
| `branding` | Site name, logo, favicon |
| `themeSettings` | Color customization |
| `textLabels` | Customizable text labels |
| `footerLinks` | Footer navigation |
| `socialLinks` | Social media links |
| `dashboardVideo` | Dashboard video settings |
| `homePageContent` | Home page sections |
| `marqueeText` | Scrolling announcements |
| `navbarItems` | Navigation items |
| `featuresCards` | Feature display cards |
| `statusCards` | Status display cards |
| `clickableAds` | Clickable ad definitions |
| `paymentMethods` | Payment method options |

---

## API Routes

### Authentication
```
POST /api/auth/login     - User login
POST /api/auth/register  - User registration
POST /api/auth/logout    - Logout
GET  /api/auth/me        - Current user
```

### Admin Routes (require isAdmin: true)
```
# Dashboard
GET  /api/admin/dashboard/stats    - Statistics
GET  /api/admin/dashboard/recent   - Recent activity

# Users
GET    /api/admin/users            - List all users
GET    /api/admin/users/pending    - Pending approvals
GET    /api/admin/users/admins     - List admin users
GET    /api/admin/users/:id        - Get user details
POST   /api/admin/users            - Create user/admin
PUT    /api/admin/users/:id        - Update user
DELETE /api/admin/users/:id        - Delete user
POST   /api/admin/users/:id/approve    - Approve user
POST   /api/admin/users/:id/reject     - Reject user
POST   /api/admin/users/:id/freeze     - Freeze user
POST   /api/admin/users/:id/balance    - Update balance
POST   /api/admin/users/:id/restriction - Set user restriction
DELETE /api/admin/users/:id/restriction - Remove restriction
POST   /api/admin/users/:id/reset      - Reset user field
POST   /api/admin/users/:id/add-value  - Add value to field
POST   /api/admin/users/:id/milestone  - Create milestone

# Ads
GET    /api/admin/ads            - List ads
POST   /api/admin/ads            - Create ad
PUT    /api/admin/ads/:id        - Update ad
DELETE /api/admin/ads/:id        - Delete ad

# Transactions
GET    /api/admin/withdrawals    - List withdrawals
PUT    /api/admin/withdrawals/:id - Process withdrawal
GET    /api/admin/deposits       - List deposits
GET    /api/admin/transactions   - All transactions

# Premium
GET    /api/admin/premium/plans       - List plans
POST   /api/admin/premium/plans       - Create plan
PUT    /api/admin/premium/plans/:id   - Update plan
DELETE /api/admin/premium/plans/:id   - Delete plan
GET    /api/admin/premium/purchases   - List purchases
PUT    /api/admin/premium/purchases/:id - Process purchase

# Settings & CMS
GET/PUT  /api/admin/settings/...  - Site settings
POST     /api/admin/settings/upload - File upload
```

### User Routes
```
GET  /api/ads                - Available ads
POST /api/ads/:id/click      - Record ad click
GET  /api/withdrawals        - User's withdrawals
POST /api/withdrawals        - Request withdrawal
GET  /api/user/stats         - User statistics
GET  /api/events             - Active events
GET  /api/premium/plans      - Available plans
POST /api/premium/purchase   - Purchase premium
```

---

## Authentication Flow

1. **Registration**: User registers -> status: "pending"
2. **Admin Approval**: Admin approves -> status: "active"
3. **Login**: Express-session + HTTP-only cookies
4. **Password**: bcrypt with 10 salt rounds

```typescript
// Check auth in hooks
import { useAuth } from "@/hooks/use-auth";
const { user, isLoading } = useAuth();

// Admin check
if (user?.isAdmin) { /* admin access */ }
```

---

## VIP Rewards System

Users earn points (0-100) that unlock VIP tiers with commission bonuses:

| Tier | Points | Commission Bonus |
|------|--------|------------------|
| Bronze | 0-19 | 1% |
| Silver | 20-39 | 2% |
| Gold | 40-59 | 5% |
| Platinum | 60-79 | 8% |
| Diamond | 80-100 | 10% |

Points are managed by admins via `/api/admin/users/:id/add-value` with `field: 'points'`.

---

## Component Conventions

### UI Components
Located in `client/src/components/ui/` - shadcn/ui based:

```typescript
// Common imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

### Page Structure Pattern
```typescript
export default function PageName() {
  const { data, isLoading } = useQuery({...});

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Page Title</h1>
      {/* Content */}
    </div>
  );
}
```

### Admin Page Pattern
Admin pages are wrapped in `AdminLayout`:
```typescript
// In App.tsx routing
<Route path="/admin/users">
  {() => <AdminProtectedRoute component={() =>
    <AdminLayout>
      <AdminUsers />
    </AdminLayout>
  } />}
</Route>
```

---

## Styling Conventions

### Tailwind Classes
- **Dark theme**: Always enabled (`document.documentElement.classList.add("dark")`)
- **Background**: `bg-[#0f1419]`, `bg-[#1a1f2e]`, `bg-[#1a2332]`
- **Text**: `text-white`, `text-[#9ca3af]`, `text-[#6b7280]`
- **Accent**: `text-[#f59e0b]` (orange/amber)
- **Borders**: `border-[#374151]`, `border-[#2a3a4d]`
- **Success**: `text-[#10b981]`, `bg-[#10b981]`
- **Error**: `text-[#ef4444]`, `bg-[#ef4444]`

### Common Patterns
```typescript
// Card styling
<Card className="bg-[#1a1f2e] border-[#374151]">

// Button primary
<Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black">

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="destructive">Rejected</Badge>
<Badge variant="warning">Pending</Badge>

// Gradient backgrounds
<div className="bg-gradient-to-br from-[#f59e0b] to-[#d97706]">
```

---

## API Client Usage

```typescript
// client/src/lib/api.ts
import { api } from "@/lib/api";

// GET requests
const users = await api.get("/api/admin/users");

// POST requests
await api.post("/api/auth/login", { username, password });

// PUT requests
await api.put(`/api/admin/users/${id}`, userData);

// DELETE requests
await api.delete(`/api/admin/ads/${id}`);

// Auth helper
const me = await api.getMe();
```

### React Query Patterns
```typescript
// Fetching data
const { data, isLoading, refetch } = useQuery({
  queryKey: ["users"],
  queryFn: () => api.get("/api/admin/users"),
});

// Mutations
const mutation = useMutation({
  mutationFn: (data) => api.post("/api/endpoint", data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    toast({ title: "Success!" });
  },
});
```

---

## Business Logic

### Ad Click Rules
- **Reward**: 101.75 LKR per click
- **Cooldown**: 24 hours between clicks on same ad
- **Withdrawal unlock**: After 28+ ads clicked
- **First-day bonus**: 25,000 LKR (resets after first ad click)

### User Status Flow
```
pending -> active (admin approval)
active -> frozen (admin action)
frozen -> active (admin reactivation)
pending -> (rejected/deleted)
```

### Balance Fields Explained
| Field | Purpose |
|-------|---------|
| `balance` | Main balance field |
| `milestoneAmount` | Withdrawable balance |
| `milestoneReward` | Total earnings (premium treasure) |
| `destinationAmount` | First-day bonus (normal treasure) |
| `ongoingMilestone` | Current milestone progress |
| `pendingAmount` | Pending deposits/earnings |

### E-Voucher System (Milestone Hold)
- Admin sets `milestoneAdsCount` on user
- When user reaches that ad count, `adsLocked` becomes true
- User must deposit to unlock ads
- `eVoucherBannerUrl` shows custom popup image

### E-Bonus System (Instant Reward)
- Admin sets `bonusAdsCount` and `bonusAmount` on user
- When user reaches that ad count, bonus is instantly credited
- `eBonusBannerUrl` shows custom celebration popup

### Withdrawal Process
1. User requests withdrawal (minimum balance required)
2. Admin reviews in `/admin/withdrawals`
3. Admin approves/rejects with optional reason
4. Balance deducted on approval

---

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...     # Neon database URL
SESSION_SECRET=your-secret-key    # Session encryption
NODE_ENV=development|production
PORT=5000
```

Optional:
```
PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
MONGODB_URI=mongodb://...         # For MongoDB fallback
```

---

## Common Tasks

### Adding a New Page

1. Create page in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. For admin pages, wrap in `AdminProtectedRoute` + `AdminLayout`

### Adding a New API Endpoint

1. Add route in `server/routes.ts` or create modular route in `server/routes/admin/`
2. Implement handler using `db` queries or `storage.ts` methods
3. Add types if needed in `shared/schema.ts`

### Adding a Database Table

1. Define table in `shared/schema.ts`
2. Create insert schema with `createInsertSchema()`
3. Export types with `$inferSelect` / `$inferInsert`
4. Run `npm run db:push` to sync

### Modifying User Balance

```typescript
// Via admin API
POST /api/admin/users/:id/balance
{ amount: "1000", type: "add" | "subtract" | "set" }

// Direct in storage.ts
await db.update(users)
  .set({ balance: newBalance })
  .where(eq(users.id, userId));
```

### Adding Points to User (VIP)
```typescript
POST /api/admin/users/:id/add-value
{ field: "points", amount: 50 }  // Max 100
```

---

## File Locations Reference

| What | Where |
|------|-------|
| Database schema | `shared/schema.ts`, `shared/models/auth.ts` |
| API routes | `server/routes.ts`, `server/routes/admin/` |
| Data access | `server/storage.ts`, `server/memStorage.ts` |
| React hooks | `client/src/hooks/` |
| UI components | `client/src/components/ui/` |
| Page components | `client/src/pages/` |
| Admin pages | `client/src/pages/admin/` |
| App routing | `client/src/App.tsx` |
| API client | `client/src/lib/api.ts` |
| Global styles | `client/src/index.css` |

---

## Testing & Debugging

### Development Server
```bash
npm run dev  # Runs at http://localhost:5000
```

### Type Checking
```bash
npm run check  # Runs tsc without emit
```

### Database Debugging
Check `server/db.ts` for connection setup. PostgreSQL connection uses Neon's serverless driver with WebSocket support.

### Multi-Storage Support
The application supports multiple storage backends:
1. **PostgreSQL** (primary) - via Drizzle ORM
2. **MongoDB** (fallback) - via `mongoStorage.ts`
3. **In-Memory** (development) - via `memStorage.ts`

User routes automatically check all storage backends for data.

### Common Issues

1. **"DATABASE_URL not set"**: Ensure `.env` has valid PostgreSQL URL
2. **Session issues**: Check `SESSION_SECRET` is set
3. **CORS errors**: Backend serves frontend in production; check `server/app.ts`
4. **Build errors**: Run `npm run check` to identify type issues
5. **MongoDB fallback**: Check `MONGODB_URI` if PostgreSQL fails

---

## Code Quality Guidelines

1. **TypeScript**: Use strict types, avoid `any` when possible
2. **Components**: Keep components focused, use composition
3. **API calls**: Always handle loading and error states
4. **Forms**: Use React Hook Form + Zod for validation
5. **Styling**: Use Tailwind utilities, avoid inline styles
6. **State**: Server state via TanStack Query, local state via useState
7. **Passwords**: Never log or expose passwords, always hash with bcrypt

---

## Admin Features Summary

### User Management
- View all users with pagination
- Approve/reject pending users
- Freeze/unfreeze accounts
- Create new users and admins
- Manual balance adjustments
- Set user restrictions (E-Voucher)
- Configure E-Bonus rewards
- Reset user fields
- Add VIP points

### Transaction Management
- View all withdrawals
- Approve/reject with reasons
- View deposit history
- Transaction logs
- Commission tracking

### Content Management
- Home page slideshow
- Dashboard video settings
- Events management
- Info pages (About, Terms, Privacy)
- Contact information
- Branding (logo, site name)
- Theme colors
- Text labels
- Footer/social links

### Ad Management
- Create/edit/delete ads
- Set rewards and duration
- Toggle active status
- View statistics

---

## Deployment

### Replit (Primary)
- Automatic deployment via `.replit` configuration
- Database URL stored in secrets or `/tmp/replitdb`

### Manual Build
```bash
npm run build    # Creates dist/public + dist/index.js
npm start        # Runs production server
```

### Docker/Windows
See `WINDOWS_SETUP_COMPLETE.md` and `COMPLETE_WINDOWS_SETUP.md` for alternative deployment guides.

---

## Recent Features (as of commit history)

1. **VIP Rewards System**: Points-based tier system (Bronze to Diamond) with commission bonuses
2. **Dashboard Video Upload**: Admin can configure video display on user dashboard
3. **Manual Deposit**: Admin can manually add deposits to user accounts
4. **Create User/Admin**: Admin can create new users and admin accounts directly
5. **Premium Manage All Users**: Enhanced premium plan management for all users
6. **E-Voucher System**: Lock ads at milestone, require deposit to unlock
7. **E-Bonus System**: Instant rewards at ad count milestones
8. **Multi-Storage Support**: PostgreSQL + MongoDB + In-Memory fallback
