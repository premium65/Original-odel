# Rating-Ads Platform - Complete Database Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React/TSX)                              │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Login   │  │ Register │  │Dashboard │  │   Ads    │  │ Withdraw │      │
│  │  Page    │  │   Page   │  │   Page   │  │   Page   │  │   Page   │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │             │             │             │             │
│       └─────────────┴─────────────┴─────────────┴─────────────┘             │
│                                   │                                         │
│                          TanStack Query                                     │
│                       (Data Fetching & Caching)                             │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    │ HTTP Requests (JSON)
                                    │ fetch() / apiRequest()
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js + Express)                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        EXPRESS MIDDLEWARE                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │   │
│  │  │   Session   │  │    CORS     │  │  JSON Body  │                  │   │
│  │  │  Middleware │  │  Middleware │  │   Parser    │                  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          API ROUTES                                  │   │
│  │  /api/auth/*     /api/ads/*     /api/withdrawals/*   /api/admin/*   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      STORAGE LAYER (storage.ts)                      │   │
│  │           DatabaseStorage class implementing IStorage                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       DRIZZLE ORM (db.ts)                            │   │
│  │              Type-safe queries with PostgreSQL                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    │ SQL Queries
                                    │ (Drizzle ORM)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE (PostgreSQL - Neon)                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                            TABLES                                    │   │
│  │  ┌─────────┐  ┌─────────┐  ┌───────────┐  ┌─────────────┐  ┌──────┐ │   │
│  │  │  users  │  │   ads   │  │ ad_clicks │  │ withdrawals │  │ratings│ │   │
│  │  └─────────┘  └─────────┘  └───────────┘  └─────────────┘  └──────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 1. DATA FLOW DIAGRAMS

## 1.1 User Registration Flow

```
┌──────────────┐     POST /api/auth/register      ┌─────────────────┐
│   Register   │  ─────────────────────────────►  │  Express Route  │
│    Page      │     { username, email,           │  /api/auth/     │
│   (TSX)      │       password, fullName }       │    register     │
└──────────────┘                                  └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │  Zod Validation │
                                                  │ insertUserSchema│
                                                  └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ bcrypt.hash()   │
                                                  │ Hash Password   │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │storage.createUser│
                                                  │   (Drizzle)     │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                           │
│  INSERT INTO users (username, email, password, full_name, status)    │
│  VALUES ('john', 'john@email.com', '$2b$10$...', 'John Doe', 'pending')│
└──────────────────────────────────────────────────────────────────────┘
```

## 1.2 User Login Flow

```
┌──────────────┐     POST /api/auth/login         ┌─────────────────┐
│    Login     │  ─────────────────────────────►  │  Express Route  │
│    Page      │     { username, password }       │  /api/auth/     │
│   (TSX)      │                                  │     login       │
└──────────────┘                                  └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │storage.getUserBy│
                                                  │   Username()    │
                                                  └────────┬────────┘
                                                           │
              ┌────────────────────────────────────────────┼──────────────┐
              ▼                                            ▼              │
     ┌─────────────────┐                          ┌─────────────────┐    │
     │ SELECT * FROM   │                          │ bcrypt.compare()│    │
     │ users WHERE     │  ────────────────────►   │ Verify Password │    │
     │ username = ?    │      User Data           └────────┬────────┘    │
     └─────────────────┘                                   │              │
                                                           ▼              │
                                                  ┌─────────────────┐    │
                                                  │ Check Status    │    │
                                                  │ === "active"    │    │
                                                  └────────┬────────┘    │
                                                           │              │
                    ┌──────────────────────────────────────┼──────────────┘
                    ▼                                      ▼
           ┌─────────────────┐                    ┌─────────────────┐
           │ Set Session     │                    │ Return Error    │
           │ req.session.    │                    │ "Pending" or    │
           │ userId = user.id│                    │ "Frozen"        │
           └────────┬────────┘                    └─────────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ Return User Data│
           │ (without pass)  │
           └─────────────────┘
```

## 1.3 Ad Click & Earning Flow

```
┌──────────────┐     POST /api/ads/click          ┌─────────────────┐
│    Rating    │  ─────────────────────────────►  │  Express Route  │
│    Page      │     { adId: 5 }                  │  /api/ads/click │
│   (TSX)      │                                  └────────┬────────┘
└──────────────┘                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ Check Session   │
                                                  │ req.session.    │
                                                  │    userId       │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ Get Ad Price    │
                                                  │ (101.75 LKR)    │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                           │
│                                                                      │
│  1. INSERT INTO ad_clicks (user_id, ad_id, clicked_at)               │
│     VALUES (1, 5, NOW())                                             │
│                                                                      │
│  2. UPDATE users SET                                                 │
│     milestone_reward = milestone_reward + 101.75,                    │
│     milestone_amount = milestone_amount + 101.75,                    │
│     total_ads_completed = total_ads_completed + 1                    │
│     WHERE id = 1                                                     │
│                                                                      │
│  3. IF first_ad THEN                                                 │
│     UPDATE users SET destination_amount = 0 WHERE id = 1             │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## 1.4 Withdrawal Flow

```
┌──────────────┐     POST /api/withdrawals        ┌─────────────────┐
│   Withdraw   │  ─────────────────────────────►  │  Express Route  │
│    Page      │     { amount: 5000,              │ /api/withdrawals│
│   (TSX)      │       bankDetails: {...} }       └────────┬────────┘
└──────────────┘                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ Validate Amount │
                                                  │ <= milestone_   │
                                                  │    amount       │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                           │
│                                                                      │
│  INSERT INTO withdrawals (                                           │
│    user_id, amount, status, bank_full_name,                         │
│    bank_account_number, bank_name, bank_branch                       │
│  ) VALUES (1, 5000, 'pending', 'John Doe', '123456', 'BOC', 'Main')  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
                                              ┌───────────────────────┐
                                              │   ADMIN APPROVAL      │
                                              │ POST /api/admin/      │
                                              │ withdrawals/:id/approve│
                                              └───────────┬───────────┘
                                                          │
                                                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│  UPDATE withdrawals SET status = 'approved', processed_at = NOW(),   │
│         processed_by = admin_id WHERE id = withdrawal_id             │
└──────────────────────────────────────────────────────────────────────┘
```

---

# 2. COMPLETE DATABASE SCHEMA (SQL)

## 2.1 Users Table

```sql
-- Users table with all fields
CREATE TABLE users (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Authentication
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,  -- bcrypt hashed
    
    -- Profile
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20),
    
    -- Status & Role
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
        -- Values: 'pending', 'active', 'frozen'
    is_admin INTEGER NOT NULL DEFAULT 0,
        -- Values: 0 = regular user, 1 = admin
    
    -- Timestamps
    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Bank Details (for withdrawals)
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_holder_name VARCHAR(100),
    branch_name VARCHAR(100),
    
    -- Financial Tracking
    destination_amount NUMERIC(10,2) NOT NULL DEFAULT 25000.00,
        -- Registration bonus, becomes 0 after first ad
    milestone_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
        -- Current withdrawable balance
    milestone_reward NUMERIC(10,2) NOT NULL DEFAULT 0.00,
        -- Total earnings from ads
    
    -- Ad Tracking
    total_ads_completed INTEGER NOT NULL DEFAULT 0,
    
    -- Restriction System
    restriction_ads_limit INTEGER,
        -- Max ads allowed under restriction (e.g., 12)
    restriction_deposit NUMERIC(10,2),
        -- Deposit amount during restriction
    restriction_commission NUMERIC(10,2),
        -- Commission per ad during restriction
    ongoing_milestone NUMERIC(10,2) NOT NULL DEFAULT 0.00,
        -- Pending amount during restriction
    restricted_ads_completed INTEGER NOT NULL DEFAULT 0,
        -- Ads completed under current restriction
    
    -- Points System
    points INTEGER NOT NULL DEFAULT 100
);

-- Indexes for faster queries
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

## 2.2 Ads Table

```sql
-- Ads table
CREATE TABLE ads (
    id SERIAL PRIMARY KEY,
    ad_code VARCHAR(20) NOT NULL UNIQUE,
        -- Format: AD-0001, AD-0002, etc.
    duration INTEGER NOT NULL DEFAULT 10,
        -- View duration in seconds
    price NUMERIC(10,2) NOT NULL DEFAULT 101.75,
        -- Reward per click in LKR
    link TEXT NOT NULL,
        -- External link URL
    image_url TEXT,
        -- Path to ad image
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for ad code lookups
CREATE INDEX idx_ads_ad_code ON ads(ad_code);
```

## 2.3 Ad Clicks Table

```sql
-- Ad clicks tracking
CREATE TABLE ad_clicks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    ad_id INTEGER NOT NULL,
    clicked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Foreign Keys
    CONSTRAINT fk_ad_clicks_user 
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_ad_clicks_ad 
        FOREIGN KEY (ad_id) REFERENCES ads(id)
);

-- Indexes for efficient queries
CREATE INDEX idx_ad_clicks_user_id ON ad_clicks(user_id);
CREATE INDEX idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX idx_ad_clicks_clicked_at ON ad_clicks(clicked_at);

-- Composite index for cooldown checks
CREATE INDEX idx_ad_clicks_user_ad ON ad_clicks(user_id, ad_id, clicked_at);
```

## 2.4 Withdrawals Table

```sql
-- Withdrawals table
CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
        -- Values: 'pending', 'approved', 'rejected'
    requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP,
    processed_by INTEGER,
        -- Admin who processed
    notes TEXT,
        -- Admin notes (for rejection reasons)
    
    -- Bank details snapshot at time of withdrawal
    bank_full_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    bank_branch VARCHAR(100),
    
    -- Foreign Keys
    CONSTRAINT fk_withdrawals_user 
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_withdrawals_processed_by 
        FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
```

## 2.5 Ratings Table

```sql
-- Ratings table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    target_username VARCHAR(50) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Foreign Key
    CONSTRAINT fk_ratings_user 
        FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_target ON ratings(target_username);
```

---

# 3. ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ENTITY RELATIONSHIP DIAGRAM                      │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │             │
                    ┌─────────│   USERS     │─────────┐
                    │         │             │         │
                    │         │  id (PK)    │         │
                    │         │  username   │         │
                    │         │  email      │         │
                    │         │  password   │         │
                    │         │  status     │         │
                    │         │  is_admin   │         │
                    │         │  ...        │         │
                    │         └──────┬──────┘         │
                    │                │                │
         ┌──────────┴────┐     ┌─────┴─────┐    ┌────┴──────────┐
         │               │     │           │    │               │
         ▼               ▼     ▼           ▼    ▼               ▼
  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐
  │   RATINGS   │  │  AD_CLICKS   │  │ WITHDRAWALS  │  │    ADS      │
  │             │  │              │  │              │  │             │
  │  id (PK)    │  │  id (PK)     │  │  id (PK)     │  │  id (PK)    │
  │  user_id(FK)│  │  user_id(FK) │  │  user_id(FK) │  │  ad_code    │
  │  target_user│  │  ad_id (FK)  │  │  amount      │  │  price      │
  │  rating     │  │  clicked_at  │  │  status      │  │  link       │
  │  comment    │  │              │  │  processed_by│  │  image_url  │
  │  created_at │  │              │  │  (FK→users)  │  │             │
  └─────────────┘  └──────────────┘  └──────────────┘  └─────────────┘
         │                 │                 │                │
         │                 │                 │                │
         └────────────────┼─────────────────┼────────────────┘
                          │                 │
                          │                 │
              ┌───────────┴─────────────────┴───────────┐
              │                                         │
              │            RELATIONSHIPS                │
              │                                         │
              │  users ──1:N──► ratings                 │
              │  users ──1:N──► ad_clicks               │
              │  users ──1:N──► withdrawals             │
              │  ads   ──1:N──► ad_clicks               │
              │  users ──1:N──► withdrawals.processed_by│
              │                                         │
              └─────────────────────────────────────────┘
```

---

# 4. API ENDPOINTS REFERENCE

## 4.1 Authentication APIs

| Method | Endpoint | Request Body | Response | Database Action |
|--------|----------|--------------|----------|-----------------|
| POST | `/api/auth/register` | `{ username, email, password, fullName }` | `{ success, userId }` | INSERT INTO users |
| POST | `/api/auth/login` | `{ username, password }` | `User object` | SELECT FROM users |
| POST | `/api/auth/logout` | - | `{ success }` | Destroy session |
| GET | `/api/auth/me` | - | `User object` | SELECT FROM users |

## 4.2 Ads APIs

| Method | Endpoint | Request Body | Response | Database Action |
|--------|----------|--------------|----------|-----------------|
| GET | `/api/ads` | - | `Ad[]` | SELECT FROM ads |
| GET | `/api/ads/click-count` | - | `{ count }` | COUNT FROM ad_clicks |
| POST | `/api/ads/click` | `{ adId }` | `{ success, earnings }` | INSERT ad_clicks, UPDATE users |

## 4.3 Withdrawal APIs

| Method | Endpoint | Request Body | Response | Database Action |
|--------|----------|--------------|----------|-----------------|
| POST | `/api/withdrawals` | `{ amount, bankDetails }` | `Withdrawal object` | INSERT INTO withdrawals |
| GET | `/api/withdrawals/my` | - | `Withdrawal[]` | SELECT FROM withdrawals |

## 4.4 Admin APIs

| Method | Endpoint | Request Body | Response | Database Action |
|--------|----------|--------------|----------|-----------------|
| GET | `/api/admin/users` | - | `User[]` | SELECT FROM users |
| POST | `/api/admin/users/:id/status` | `{ status }` | `User object` | UPDATE users |
| POST | `/api/admin/users/:id/deposit` | `{ amount }` | `User object` | UPDATE users |
| GET | `/api/admin/withdrawals` | - | `Withdrawal[]` | SELECT FROM withdrawals |
| POST | `/api/admin/withdrawals/:id/approve` | - | `Withdrawal object` | UPDATE withdrawals |
| POST | `/api/admin/withdrawals/:id/reject` | `{ notes }` | `Withdrawal object` | UPDATE withdrawals |

---

# 5. DRIZZLE ORM SCHEMA (TypeScript)

```typescript
// shared/schema.ts

import { pgTable, text, varchar, timestamp, integer, serial, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// USERS TABLE
// ═══════════════════════════════════════════════════════════════
export const users = pgTable("users", {
  // Primary Key
  id: serial("id").primaryKey(),
  
  // Authentication
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  
  // Profile
  fullName: varchar("full_name", { length: 100 }).notNull(),
  mobileNumber: varchar("mobile_number", { length: 20 }),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  isAdmin: integer("is_admin").notNull().default(0),
  
  // Bank Details
  bankName: varchar("bank_name", { length: 100 }),
  accountNumber: varchar("account_number", { length: 50 }),
  accountHolderName: varchar("account_holder_name", { length: 100 }),
  branchName: varchar("branch_name", { length: 100 }),
  
  // Financial
  destinationAmount: numeric("destination_amount", { precision: 10, scale: 2 })
    .notNull().default("25000.00"),
  milestoneAmount: numeric("milestone_amount", { precision: 10, scale: 2 })
    .notNull().default("0.00"),
  milestoneReward: numeric("milestone_reward", { precision: 10, scale: 2 })
    .notNull().default("0.00"),
  totalAdsCompleted: integer("total_ads_completed").notNull().default(0),
  
  // Restriction
  restrictionAdsLimit: integer("restriction_ads_limit"),
  restrictionDeposit: numeric("restriction_deposit", { precision: 10, scale: 2 }),
  restrictionCommission: numeric("restriction_commission", { precision: 10, scale: 2 }),
  ongoingMilestone: numeric("ongoing_milestone", { precision: 10, scale: 2 })
    .notNull().default("0.00"),
  restrictedAdsCompleted: integer("restricted_ads_completed").notNull().default(0),
  points: integer("points").notNull().default(100),
});

// ═══════════════════════════════════════════════════════════════
// ADS TABLE
// ═══════════════════════════════════════════════════════════════
export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  adCode: varchar("ad_code", { length: 20 }).notNull().unique(),
  duration: integer("duration").notNull().default(10),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("101.75"),
  link: text("link").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════
// AD CLICKS TABLE
// ═══════════════════════════════════════════════════════════════
export const adClicks = pgTable("ad_clicks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  adId: integer("ad_id").notNull().references(() => ads.id),
  clickedAt: timestamp("clicked_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════
// WITHDRAWALS TABLE
// ═══════════════════════════════════════════════════════════════
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: integer("processed_by").references(() => users.id),
  notes: text("notes"),
  bankFullName: varchar("bank_full_name", { length: 100 }),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  bankName: varchar("bank_name", { length: 100 }),
  bankBranch: varchar("bank_branch", { length: 100 }),
});

// ═══════════════════════════════════════════════════════════════
// RATINGS TABLE
// ═══════════════════════════════════════════════════════════════
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  targetUsername: varchar("target_username", { length: 50 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════════
export const usersRelations = relations(users, ({ many }) => ({
  ratings: many(ratings),
  adClicks: many(adClicks),
  withdrawals: many(withdrawals),
}));

export const adClicksRelations = relations(adClicks, ({ one }) => ({
  user: one(users, { fields: [adClicks.userId], references: [users.id] }),
  ad: one(ads, { fields: [adClicks.adId], references: [ads.id] }),
}));

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Ad = typeof ads.$inferSelect;
export type AdClick = typeof adClicks.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
```

---

# 6. DATABASE CONNECTION

```typescript
// server/db.ts

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// Enable WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Get database URL
function getDatabaseUrl(): string {
  // Check for production database file first
  const fs = require("fs");
  if (fs.existsSync("/tmp/replitdb")) {
    return fs.readFileSync("/tmp/replitdb", "utf-8").trim();
  }
  
  // Fallback to environment variable
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return process.env.DATABASE_URL;
}

// Create pool and Drizzle instance
export const pool = new Pool({ connectionString: getDatabaseUrl() });
export const db = drizzle(pool, { schema });
```

---

# 7. STORAGE LAYER (Data Access)

```typescript
// server/storage.ts - Key Methods

export interface IStorage {
  // User Methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  
  // Financial Methods
  addMilestoneAmount(userId: number, amount: string): Promise<User | undefined>;
  addMilestoneReward(userId: number, amount: string): Promise<User | undefined>;
  resetDestinationAmount(userId: number): Promise<User | undefined>;
  
  // Ad Methods
  createAd(ad: InsertAd): Promise<Ad>;
  getAllAds(): Promise<Ad[]>;
  getAd(id: number): Promise<Ad | undefined>;
  recordAdClick(userId: number, adId: number): Promise<AdClick>;
  getUserAdClicks(userId: number): Promise<AdClick[]>;
  getUserAdClickCount(userId: number): Promise<number>;
  
  // Withdrawal Methods
  createWithdrawal(userId: number, amount: string, bankDetails: any): Promise<Withdrawal>;
  getUserWithdrawals(userId: number): Promise<Withdrawal[]>;
  getAllWithdrawals(): Promise<Withdrawal[]>;
  getPendingWithdrawals(): Promise<Withdrawal[]>;
  approveWithdrawal(id: number, adminId: number): Promise<Withdrawal>;
  rejectWithdrawal(id: number, adminId: number, notes: string): Promise<Withdrawal>;
  
  // Rating Methods
  createRating(rating: InsertRating & { userId: number }): Promise<Rating>;
  getRatingsByUser(userId: number): Promise<Rating[]>;
  getAllRatings(): Promise<Rating[]>;
}
```

---

# 8. SAMPLE DATA

## Admin User
```sql
INSERT INTO users (
  username, email, password, full_name, status, is_admin
) VALUES (
  'admin',
  'admin@premiumwork.site',
  '$2b$10$hashedpassword',  -- 123456
  'System Administrator',
  'active',
  1
);
```

## Sample Ads
```sql
INSERT INTO ads (ad_code, price, link, image_url) VALUES
  ('AD-0001', 101.75, 'https://example.com/ad1', '/attached_assets/ad_images/ad1.jpg'),
  ('AD-0002', 101.75, 'https://example.com/ad2', '/attached_assets/ad_images/ad2.jpg'),
  ('AD-0003', 101.75, 'https://example.com/ad3', '/attached_assets/ad_images/ad3.jpg');
```

---

# END OF DATABASE ARCHITECTURE DOCUMENTATION

This document provides everything needed to understand and recreate the database structure and data flow for the Rating-Ads platform.
