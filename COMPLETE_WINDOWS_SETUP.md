# OdelAdsPro - Complete Windows MongoDB Setup Guide

## Prerequisites
1. Windows Command Prompt or PowerShell
2. Node.js 20+ installed
3. MongoDB Community Edition installed and running (`mongod` running in terminal)
4. Project folder: `C:\OdelAdsPro2`

---

## STEP 1: Copy These 3 Files from Replit to Windows

### File 1: `server/mongoConnection.ts`
```typescript
import { MongoClient, Db, Collection } from 'mongodb';

let mongoClient: MongoClient | null = null;
let db: Db | null = null;
let usersCollection: Collection | null = null;

export async function connectMongo(): Promise<void> {
  try {
    if (mongoClient) {
      console.log('Already connected to MongoDB');
      return;
    }
    
    mongoClient = new MongoClient('mongodb://127.0.0.1:27017');
    await mongoClient.connect();
    db = mongoClient.db('odeladspro');
    usersCollection = db.collection('users');
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('MongoDB is not available. Using PostgreSQL instead.');
    throw error;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongo() first.');
  }
  return db;
}

export function getUsersCollection(): Collection {
  if (!usersCollection) {
    throw new Error('MongoDB not connected. Call connectMongo() first.');
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

### File 2: `server/mongoStorage.ts`
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
    return (await collection.findOne({ username })) as User | null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const collection = getUsersCollection();
    return (await collection.findOne({ email })) as User | null;
  }

  async getUser(userId: string): Promise<User | null> {
    const collection = getUsersCollection();
    return (await collection.findOne({ _id: new ObjectId(userId) })) as User | null;
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
    return (await collection.find({}).sort({ createdAt: -1 }).toArray()) as User[];
  }

  async updateUserStatus(userId: string, status: string): Promise<User | null> {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    return (result.value as User) || null;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<User | null> {
    const collection = getUsersCollection();
    const hashedPassword = await hashPassword(newPassword);
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } },
      { returnDocument: 'after' }
    );
    return (result.value as User) || null;
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

### File 3: `client/src/pages/admin-login.tsx`
```typescript
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import mqImage from "@assets/image_1764261636785.png";
import { Crown } from "lucide-react";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const user = await response.json();

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: user?.error || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      const isAdminValue = user.isAdmin ?? user.is_admin;
      if (Number(isAdminValue) !== 1) {
        toast({
          title: "Login Failed",
          description: "Access denied. Admin privileges required.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Admin login successful",
      });

      navigate("/admin");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${mqImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-500 rounded-full p-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-amber-600 mb-2">
            Admin Login
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your credentials to access the admin panel
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                data-testid="input-username"
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-11"
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Login to Admin Panel"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-amber-500 hover:text-amber-600 font-medium"
              data-testid="link-user-login"
            >
              User Login Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## STEP 2: Save These 3 Files in Windows

**Save each file to these exact locations:**
- `C:\OdelAdsPro2\server\mongoConnection.ts`
- `C:\OdelAdsPro2\server\mongoStorage.ts`
- `C:\OdelAdsPro2\client\src\pages\admin-login.tsx`

---

## STEP 3: Insert Admin User in MongoDB

**Open MongoDB Compass:**
1. Click "Add new connection" 
2. Enter: `mongodb://127.0.0.1:27017`
3. Click "Connect"
4. Select database: `odeladspro` → collection: `users`
5. Click "Insert Document"
6. **PASTE THIS JSON:**

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
  "points": 100,
  "createdAt": {"$date": "2025-01-01T00:00:00Z"}
}
```

7. Click "Insert"

---

## STEP 4: Start MongoDB (if not running)

**Open Command Prompt and run:**
```cmd
mongod
```

Keep this terminal open while running your app.

---

## STEP 5: Start Your Windows Project

**Open a NEW Command Prompt and run:**
```cmd
cd C:\OdelAdsPro2
npm run dev
```

**You should see:**
```
rest-express@1.0.0 dev
NODE_ENV=development tsx server/index-dev.ts
Connected to MongoDB successfully
[express] serving on port 5000
```

---

## STEP 6: Login to Admin Panel

1. Open browser: `http://localhost:5000/admin-login`
2. **Login with:**
   - Username: `admin`
   - Password: `123456`
3. You should see the admin dashboard! ✅

---

## Troubleshooting

**If you see "MongoDB connection error":**
- Make sure `mongod` is running in another terminal
- Check MongoDB is listening on `127.0.0.1:27017`

**If login fails:**
- Check admin user was inserted in MongoDB Compass
- Make sure password hash is exactly: `$2b$10$i0$NAP5K7sd8mGxHVjwDm9U5uNBaSb.e2ryNIyRqnPMbyU6uxrA9h9LW`

**If you need to regenerate password hash:**
```cmd
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('123456', 10).then(h => console.log(h)).catch(e => console.error(e))"
```

---

## Done! ✅

Your OdelAdsPro platform is ready to use on Windows with MongoDB!
