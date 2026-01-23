# RateHub - Community Rating Platform

## Overview

RateHub is a community-driven rating and review platform that allows users to register, submit ratings for other community members, and share reviews. The application features an admin approval workflow where new user registrations must be approved before they can fully participate in the platform. The system is built with a React frontend using shadcn/ui components and a Node.js/Express backend with PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## Windows MongoDB Setup (LOCAL DEVELOPMENT)

### Admin User Setup - DO THIS FIRST

**MongoDB Admin Document:**
```json
{
  "username": "admin",
  "email": "admin@odeladspro.com",
  "password": "$2b$10$i0$NAP5K7sd8mGxHVjwDm9U5uNBaSb.e2ryNIyRqnPMbyU6uxrA9h9LW",
  "fullName": "Administrator",
  "mobileNumber": "0000000000",
  "status": "active",
  "isAdmin": 1,
  "isApproved": true,
  "isFrozen": false,
  "destinationAmount": 25000,
  "milestoneAmount": 0,
  "milestoneReward": 0,
  "totalAdsCompleted": 0,
  "adsClicked": 0,
  "points": 100
}
```

**Login Credentials:**
- Username: `admin`
- Password: `123456`

### Complete MongoDB Backend Files

#### 1. `server/mongoConnection.ts` (NEW FILE)

```typescript
import { MongoClient, Db, Collection } from 'mongodb';

let mongoClient: MongoClient;
let db: Db;
let usersCollection: Collection;

export async function connectMongo(): Promise<void> {
  try {
    mongoClient = new MongoClient('mongodb://127.0.0.1:27017');
    await mongoClient.connect();
    db = mongoClient.db('odeladspro');
    usersCollection = db.collection('users');
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export function getDb(): Db {
  return db;
}

export function getUsersCollection(): Collection {
  return usersCollection;
}

export async function closeMongo(): Promise<void> {
  await mongoClient.close();
}
```

#### 2. `server/mongoStorage.ts` (NEW FILE)

```typescript
import { getUsersCollection } from './mongoConnection';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
  status: string;
  isAdmin: number;
  destinationAmount: number;
  milestoneAmount: number;
  milestoneReward: number;
  totalAdsCompleted: number;
  points: number;
  createdAt: Date;
}

export class MongoStorage {
  async getUserByUsername(username: string): Promise<User | null> {
    const collection = getUsersCollection();
    return await collection.findOne({ username });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const collection = getUsersCollection();
    return await collection.findOne({ email });
  }

  async getUser(userId: string): Promise<User | null> {
    const collection = getUsersCollection();
    return await collection.findOne({ _id: new ObjectId(userId) });
  }

  async createUser(userData: Omit<User, '_id'>): Promise<User> {
    const collection = getUsersCollection();
    const result = await collection.insertOne({
      ...userData,
      createdAt: new Date(),
    });
    return {
      ...userData,
      _id: result.insertedId,
      createdAt: new Date(),
    };
  }

  async getAllUsers(): Promise<User[]> {
    const collection = getUsersCollection();
    return await collection.find({}).sort({ createdAt: -1 }).toArray();
  }

  async updateUserStatus(userId: string, status: string): Promise<User | null> {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<User | null> {
    const collection = getUsersCollection();
    const hashedPassword = await hashPassword(newPassword);
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async addMilestoneAmount(userId: string, amount: number): Promise<void> {
    const collection = getUsersCollection();
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { milestoneAmount: amount } }
    );
  }

  async incrementAdsCompleted(userId: string): Promise<void> {
    const collection = getUsersCollection();
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { totalAdsCompleted: 1 } }
    );
  }

  async resetDestinationAmount(userId: string): Promise<void> {
    const collection = getUsersCollection();
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { destinationAmount: 0 } }
    );
  }

  async getUserAdClickCount(userId: string): Promise<number> {
    const collection = getUsersCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    return user?.adsClicked || 0;
  }
}

export const mongoStorage = new MongoStorage();
```

#### 3. Update `server/index-dev.ts` - LOGIN ENDPOINT REPLACEMENT

Replace the login endpoint (lines 83-117) with:

```typescript
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).send("Username and password are required");
      }

      const user = await mongoStorage.getUserByUsername(username);
      if (!user) {
        return res.status(401).send("Invalid username or password");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send("Invalid username or password");
      }

      // Check status
      if (user.status !== "active") {
        return res.status(403).send("Account is not active");
      }

      // Check admin
      if (Number(user.isAdmin) !== 1) {
        return res.status(403).send("Access denied. Admin privileges required.");
      }

      // Set session
      req.session.userId = user._id.toString();

      // Return user (without password)
      const { password: _, ...userWithoutPassword } = user;
      console.log("Admin login successful:", userWithoutPassword);
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send("Login failed");
    }
  });
```

#### 4. Add to top of `server/index-dev.ts`:

```typescript
import { connectMongo } from "./mongoConnection";
import { mongoStorage } from "./mongoStorage";
import bcrypt from "bcrypt";

// Call this before starting the server
await connectMongo();
```

### Windows Setup Instructions

1. **Install MongoDB Community**: https://www.mongodb.com/try/download/community
2. **Start MongoDB**: `mongod` (keep running in terminal)
3. **Insert Admin User** in MongoDB Compass:
   - Copy the admin JSON document above
   - Insert into `odeladspro.users` collection
4. **Copy the backend files** above to your Windows project
5. **Restart your backend server**
6. **Login with**: admin / 123456

---

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast HMR and optimized production builds
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query (React Query)** for server state management, data fetching, and caching

**UI Component Library**
- **shadcn/ui** components built on Radix UI primitives (configured with "new-york" style)
- **Tailwind CSS** for styling with custom design tokens defined in CSS variables
- Component variants managed with `class-variance-authority`
- Design system follows Material Design principles prioritizing clarity and efficient workflows

**State Management**
- Server state: TanStack Query with query key-based caching
- Form state: React Hook Form with Zod schema validation
- Session state: Managed server-side with cookies, queried via `/api/auth/me` endpoint

**Key Frontend Patterns**
- Form validation using `@hookform/resolvers` with Zod schemas shared between client and server
- Toast notifications via custom hook (`useToast`) with Radix Toast primitives
- Responsive design with mobile-first approach using Tailwind breakpoints

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- Separate entry points for development (`index-dev.ts`) and production (`index-prod.ts`)
- Development mode integrates Vite middleware for SSR-like rendering of `index.html`
- Production mode serves pre-built static assets from `dist/public`

**Session Management**
- **express-session** middleware with configurable session store
- Sessions stored with `connect-pg-simple` (PostgreSQL session store)
- Cookie-based authentication with HTTP-only cookies
- Session data includes `userId` for authenticated requests

**Authentication & Authorization**
- **bcrypt** for password hashing with 10 salt rounds
- Password verification on login
- Admin role determined by `isAdmin` flag (0 = regular user, 1 = admin)
- Route-level authorization checks (admin routes verify `isAdmin === 1`)

**API Design**
- RESTful API structure under `/api` prefix
- Authentication endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Admin endpoints: `/api/admin/users`, `/api/admin/pending`, `/api/admin/approve/:id`, `/api/admin/freeze/:id`
- Rating endpoints: `/api/ratings`, `/api/ratings/my`

### Data Storage

**Database**
- **PostgreSQL** via Neon serverless driver (`@neondatabase/serverless`)
- WebSocket support for Neon using `ws` package
- Connection pooling with `Pool` from `@neondatabase/serverless`
- **Production/Development Sync**: `db.ts` checks `/tmp/replitdb` first (production deployment) and falls back to `process.env.DATABASE_URL` (development) ensuring both environments use the same Neon PostgreSQL database

**ORM & Schema**
- **Drizzle ORM** for type-safe database operations
- Schema defined in `shared/schema.ts` for code sharing between frontend and backend
- Schema validation using `drizzle-zod` for automatic Zod schema generation from Drizzle tables

**Database Tables**
1. **users** - User accounts with approval workflow
   - Fields: id, username, email, password (hashed), fullName, status (pending/active/frozen), registeredAt, isAdmin
   - Unique constraints on username and email
   
2. **ratings** - User-submitted ratings and reviews
   - Fields: id, userId (FK to users), targetUsername, rating (1-5), comment, createdAt
   - Relation: Many ratings belong to one user

**Data Access Layer**
- **Storage Pattern**: `DatabaseStorage` class implements `IStorage` interface
- Abstraction allows for potential storage backend swapping
- Methods include user CRUD operations and rating management
- Uses Drizzle query builder with type-safe operations

### External Dependencies

**Core Runtime Dependencies**
- **@neondatabase/serverless** (v0.10.4) - PostgreSQL client for Neon database
- **drizzle-orm** (v0.39.1) - TypeScript ORM
- **express** - Web server framework
- **bcrypt** (v6.0.0) - Password hashing
- **express-session** - Session middleware
- **connect-pg-simple** (v10.0.0) - PostgreSQL session store
- **mongodb** - MongoDB driver for Windows local development

**Frontend UI Dependencies**
- **@radix-ui/react-*** - Comprehensive set of accessible UI primitives (accordion, dialog, dropdown, select, etc.)
- **@tanstack/react-query** (v5.60.5) - Data fetching and caching
- **react-hook-form** - Form state management
- **@hookform/resolvers** (v3.10.0) - Form validation integration
- **zod** - Schema validation library
- **wouter** - Lightweight routing
- **lucide-react** - Icon library
- **tailwindcss** - Utility-first CSS framework
- **class-variance-authority** (v0.7.1) - Component variant management
- **cmdk** (v1.1.1) - Command menu component
- **date-fns** (v3.6.0) - Date manipulation
- **vaul** - Drawer component

**Build & Development Tools**
- **vite** - Build tool and dev server
- **@vitejs/plugin-react** - React plugin for Vite
- **typescript** - Type checking
- **tailwindcss** - CSS processing
- **postcss** - CSS transformation
- **autoprefixer** - CSS vendor prefixing
- **drizzle-kit** - Database migration tool
- **esbuild** - JavaScript bundler for server code
- **tsx** - TypeScript execution for development

**Replit-Specific Integrations**
- **@replit/vite-plugin-runtime-error-modal** - Development error overlay
- **@replit/vite-plugin-cartographer** - Code navigation (dev only)
- **@replit/vite-plugin-dev-banner** - Development banner (dev only)
