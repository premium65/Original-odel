# CLAUDE.md - AI Assistant Guide for ODEL ADS Platform

## Project Overview

**ODEL ADS** (Rating-Ads Platform) is a full-stack web application where users earn money by clicking/watching ads (101.75 LKR per click). It features a comprehensive admin panel for user management, ad management, and financial operations.

### Quick Facts
- **Type**: Full-stack monorepo (React + Express.js + PostgreSQL)
- **Currency**: Sri Lankan Rupee (LKR)
- **Reward Per Ad**: 101.75 LKR
- **Platform**: Designed for Replit deployment, supports Windows/Docker

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

### Backend
| Technology | Purpose |
|------------|---------|
| Express.js 4.21 | Web framework |
| Drizzle ORM 0.39 | Type-safe database queries |
| PostgreSQL (Neon) | Primary database |
| bcrypt | Password hashing |
| express-session | Session management |
| Multer | File uploads |
| node-cron | Scheduled tasks |

---

## Directory Structure

```
Original-odel/
├── client/                   # Frontend React application
│   ├── src/
│   │   ├── App.tsx          # Main app with routing
│   │   ├── main.tsx         # React entry point
│   │   ├── index.css        # Global styles
│   │   ├── lib/             # Utilities
│   │   │   ├── api.ts       # API client
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-admin-auth.ts
│   │   │   ├── use-ads.ts
│   │   │   └── use-*.ts
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/          # 50+ shadcn/ui components
│   │   │   ├── admin-layout.tsx
│   │   │   └── admin-sidebar.tsx
│   │   └── pages/           # Route pages
│   │       ├── dashboard.tsx
│   │       ├── ads-hub.tsx
│   │       ├── withdraw.tsx
│   │       └── admin/       # 34 admin pages
│   └── index.html
│
├── server/                   # Backend Express application
│   ├── index-dev.ts         # Development entry (with Vite)
│   ├── index-prod.ts        # Production entry
│   ├── app.ts               # Express app setup
│   ├── routes.ts            # Main API routes (84KB)
│   ├── db.ts                # Database connection
│   ├── storage.ts           # Data access layer (18KB)
│   └── routes/admin/        # Modular admin routes
│       ├── index.ts
│       ├── auth.ts
│       ├── users.ts
│       ├── ads.ts
│       └── *.ts
│
├── shared/                   # Shared code between client/server
│   ├── schema.ts            # Drizzle ORM schema + Zod schemas
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
  isAdmin: boolean (default: false),
  status: text ("pending" | "active" | "frozen"),
  balance: decimal (default: "0.00"),

  // Milestone tracking
  milestoneAmount, milestoneReward: decimal,
  destinationAmount, ongoingMilestone: decimal,
  totalAdsCompleted: integer,

  // Bank details
  bankName, accountNumber, accountHolderName: text
}
```

**ads** (shared/schema.ts:19)
```typescript
{
  id: serial,
  title, description: text,
  imageUrl, targetUrl: text,
  price, reward: decimal,
  duration: integer (default: 30),
  isActive: boolean,
  totalViews: integer
}
```

**withdrawals** (shared/schema.ts:37)
```typescript
{
  id: serial,
  userId: varchar (FK -> users),
  amount: decimal,
  method: text,
  bankName, bankAccount: text,
  status: text ("pending" | "approved" | "rejected"),
  reason: text (rejection reason)
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

### CMS Tables
- `slides` / `slideshow` - Home page carousel
- `siteSettings` / `settings` - Key-value config
- `contactInfo` / `contacts` - Contact details
- `infoPages` - About, Terms, Privacy pages
- `premiumPlans`, `premiumPurchases` - Premium tiers
- `events` - Promotional events
- `branding`, `themeSettings` - UI customization

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
# Users
GET    /api/admin/users          - List all users
GET    /api/admin/users/pending  - Pending approvals
GET    /api/admin/users/:id      - Get user details
PUT    /api/admin/users/:id      - Update user
POST   /api/admin/users/:id/approve - Approve user
POST   /api/admin/users/:id/balance - Update balance

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

# Dashboard
GET    /api/admin/dashboard/stats  - Statistics
GET    /api/admin/dashboard/recent - Recent activity
```

### User Routes
```
GET  /api/ads                - Available ads
POST /api/ads/:id/click      - Record ad click
GET  /api/withdrawals        - User's withdrawals
POST /api/withdrawals        - Request withdrawal
GET  /api/user/stats         - User statistics
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
<AdminProtectedRoute component={() =>
  <AdminLayout>
    <AdminPageComponent />
  </AdminLayout>
} />
```

---

## Styling Conventions

### Tailwind Classes
- **Dark theme**: Always enabled (`document.documentElement.classList.add("dark")`)
- **Background**: `bg-[#0f1419]`, `bg-[#1a1f2e]`
- **Text**: `text-white`, `text-[#9ca3af]`
- **Accent**: `text-[#f59e0b]` (orange/amber)
- **Borders**: `border-[#374151]`

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
```

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

Optional PostgreSQL variables:
```
PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
```

---

## Common Tasks

### Adding a New Page

1. Create page in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. For admin pages, wrap in `AdminProtectedRoute` + `AdminLayout`

### Adding a New API Endpoint

1. Add route in `server/routes.ts` or create modular route in `server/routes/admin/`
2. Implement handler using `storage.ts` methods
3. Add types if needed in `shared/schema.ts`

### Adding a Database Table

1. Define table in `shared/schema.ts`
2. Create insert schema with `createInsertSchema()`
3. Export types with `$inferSelect` / `$inferInsert`
4. Run `npm run db:push` to sync

### Modifying User Balance

```typescript
// In storage.ts pattern
await db.update(users)
  .set({ balance: newBalance })
  .where(eq(users.id, userId));
```

---

## File Locations Reference

| What | Where |
|------|-------|
| Database schema | `shared/schema.ts`, `shared/models/auth.ts` |
| API routes | `server/routes.ts`, `server/routes/admin/` |
| Data access | `server/storage.ts` |
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

### Common Issues

1. **"DATABASE_URL not set"**: Ensure `.env` has valid PostgreSQL URL
2. **Session issues**: Check `SESSION_SECRET` is set
3. **CORS errors**: Backend serves frontend in production; check `server/app.ts`
4. **Build errors**: Run `npm run check` to identify type issues

---

## Code Quality Guidelines

1. **TypeScript**: Use strict types, avoid `any` when possible
2. **Components**: Keep components focused, use composition
3. **API calls**: Always handle loading and error states
4. **Forms**: Use React Hook Form + Zod for validation
5. **Styling**: Use Tailwind utilities, avoid inline styles
6. **State**: Server state via TanStack Query, local state via useState

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
