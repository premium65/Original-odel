# WINDOWS COMPLETE FILES - Copy These to C:\OdelAdsPro2

---

## FILE 1: server/db.ts

**Location:** `C:\OdelAdsPro2\server\db.ts`

**REPLACE the entire file with this:**

```typescript
// Referenced from javascript_database integration blueprint
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import fs from "fs";

neonConfig.webSocketConstructor = ws;

// For production deployments, Replit stores DATABASE_URL in /tmp/replitdb
// For development, it's in process.env.DATABASE_URL
let databaseUrl = process.env.DATABASE_URL;

// Check if running in production deployment
if (fs.existsSync('/tmp/replitdb')) {
  try {
    const replitDbContent = fs.readFileSync('/tmp/replitdb', 'utf8');
    databaseUrl = replitDbContent.trim();
  } catch (error) {
    console.warn('Failed to read /tmp/replitdb, falling back to DATABASE_URL env var');
  }
}

// DATABASE_URL is optional - on Windows/MongoDB-only setup, this can be undefined
let pool: any;
let db: any;

if (databaseUrl) {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
} else {
  console.warn('DATABASE_URL not set - PostgreSQL storage unavailable. Using MongoDB only.');
}

export { pool, db };
```

---

## FILE 2: server/mongoConnection.ts

**Location:** `C:\OdelAdsPro2\server\mongoConnection.ts`

**REPLACE the entire file with this:**

```typescript
import { MongoClient, Db, Collection } from "mongodb";

let mongoClient: MongoClient | null = null;
let db: Db | null = null;
let usersCollection: Collection | null = null;

export async function connectMongo(): Promise<void> {
  try {
    if (mongoClient) {
      console.log("Already connected to MongoDB");
      return;
    }

    mongoClient = new MongoClient("mongodb://127.0.0.1:27017");
    await mongoClient.connect();
    db = mongoClient.db("odeladspro");
    usersCollection = db.collection("users");
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log("MongoDB is not available. Using PostgreSQL instead.");
    throw error;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error("MongoDB not connected. Call connectMongo() first.");
  }
  return db;
}

export function getUsersCollection(): Collection {
  if (!usersCollection) {
    throw new Error("MongoDB not connected. Call connectMongo() first.");
  }
  return usersCollection;
}

export async function closeMongo(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    db = null;
    usersCollection = null;
  }
}

export function isMongoConnected(): boolean {
  return mongoClient !== null && db !== null && usersCollection !== null;
}
```

---

## FILE 3: server/mongoStorage.ts

**Location:** `C:\OdelAdsPro2\server\mongoStorage.ts`

**REPLACE the entire file with this:**

```typescript
import { getUsersCollection } from "./mongoConnection";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

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
    return (await collection.findOne({ username })) as User | null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const collection = getUsersCollection();
    return (await collection.findOne({ email })) as User | null;
  }

  async getUser(userId: string): Promise<User | null> {
    const collection = getUsersCollection();
    return (await collection.findOne({
      _id: new ObjectId(userId),
    })) as User | null;
  }

  async createUser(userData: Omit<User, "_id">): Promise<User> {
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
    return (await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as User[];
  }

  async updateUserStatus(userId: string, status: string): Promise<User | null> {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { status } },
      { returnDocument: "after" },
    );
    return (result.value as User) || null;
  }

  async updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<User | null> {
    const collection = getUsersCollection();
    const hashedPassword = await hashPassword(newPassword);
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } },
      { returnDocument: "after" },
    );
    return (result.value as User) || null;
  }

  async addMilestoneAmount(userId: string, amount: number): Promise<void> {
    const collection = getUsersCollection();
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { milestoneAmount: amount } },
    );
  }

  async incrementAdsCompleted(userId: string): Promise<void> {
    const collection = getUsersCollection();
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { totalAdsCompleted: 1 } },
    );
  }

  async resetDestinationAmount(userId: string): Promise<void> {
    const collection = getUsersCollection();
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { destinationAmount: 0 } },
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

---

## FILE 4: WINDOWS_RUN.bat

**Location:** `C:\OdelAdsPro2\WINDOWS_RUN.bat`

**Create this new file:**

```batch
@echo off
REM Windows batch file to run OdelAdsPro with MongoDB

echo Starting OdelAdsPro...
echo Make sure mongod is running!
echo.

REM Run with cross-env using npx
npx cross-env NODE_ENV=development npx tsx server/index-dev.ts

pause
```

---

## HOW TO USE:

1. Copy FILE 1 to `C:\OdelAdsPro2\server\db.ts` (replace old file)
2. Copy FILE 2 to `C:\OdelAdsPro2\server\mongoConnection.ts`
3. Copy FILE 3 to `C:\OdelAdsPro2\server\mongoStorage.ts`
4. Copy FILE 4 to `C:\OdelAdsPro2\WINDOWS_RUN.bat`
5. Make sure `mongod` is running
6. Double-click `WINDOWS_RUN.bat`
7. Open `http://localhost:5000/admin-login`
8. Login: admin / 123456

---

## DONE! ✅
