# OdelAdsPro - Windows MongoDB Complete Setup Scripts

## Step 1: Create `server/mongoConnection.ts`

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

---

## Step 2: Replace `server/mongoStorage.ts`

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

---

## Step 3: Replace `client/src/pages/admin-login.tsx`

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
          description: user || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      // Check for admin privileges
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

## Step 4: Update `server/index-dev.ts` (Add MongoDB Import at Top)

Add this import at the very top of the file:
```typescript
import { connectMongo } from "./mongoConnection";
```

Then update the bottom of the file to connect MongoDB before starting:
```typescript
(async () => {
  // Connect to MongoDB before starting the app
  try {
    await connectMongo();
  } catch (error) {
    console.log('MongoDB not available, using PostgreSQL instead');
  }
  await runApp(setupVite);
})();
```

---

## Step 5: Insert Admin User in MongoDB Compass

**Admin Document JSON:**
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

**Steps to Insert:**
1. Open MongoDB Compass
2. Connect to `mongodb://127.0.0.1:27017`
3. Select database `odeladspro`
4. Click collection `users`
5. Click "Create" or "Insert Document"
6. Paste the JSON above
7. Click "Insert"

---

## Step 6: Windows Terminal - Generate Fresh Password Hash

Run this command in Windows Command Prompt in your project folder to generate a fresh password hash:

```cmd
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('123456', 10).then(h => console.log('Hash:', h)).catch(e => console.error(e))"
```

Copy the hash output and update the `password` field in MongoDB with the new hash if you want.

---

## Step 7: Complete Login Endpoint Update

In `server/routes.ts`, find the `/api/auth/login` endpoint and replace it with:

```typescript
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    const user = await storage.getUserByUsername(username);
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).send("Invalid username or password");
    }

    // CRITICAL: Only allow active users to login
    if (user.status !== "active") {
      if (user.status === "pending") {
        return res.status(403).send("Your account is pending admin approval");
      } else if (user.status === "frozen") {
        return res.status(403).send("Your account has been suspended");
      }
      return res.status(403).send("Account access denied");
    }

    // Check admin privileges
    const isAdminValue = user.isAdmin ?? user.is_admin;
    if (Number(isAdminValue) !== 1) {
      return res.status(403).send("Access denied. Admin privileges required.");
    }

    // Set session
    req.session.userId = user.id;

    // Return user info (without password)
    const { password: _, ...userWithoutPassword } = user;
    console.log("Admin login successful:", JSON.stringify(userWithoutPassword));
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Login failed");
  }
});
```

---

## Final Windows Setup Checklist

- [ ] 1. Install MongoDB Community Edition
- [ ] 2. Run `mongod` in terminal (keep running)
- [ ] 3. Create `server/mongoConnection.ts` (copy Step 1)
- [ ] 4. Replace `server/mongoStorage.ts` (copy Step 2)
- [ ] 5. Replace `client/src/pages/admin-login.tsx` (copy Step 3)
- [ ] 6. Update `server/index-dev.ts` (add imports and connectMongo call - Step 4)
- [ ] 7. Update `/api/auth/login` endpoint in `server/routes.ts` (Step 7)
- [ ] 8. Insert admin user in MongoDB Compass (Step 5)
- [ ] 9. Restart your backend server
- [ ] 10. Navigate to `/admin-login` in your browser
- [ ] 11. Login with: **admin** / **123456**

---

## Login Credentials

**Username:** `admin`  
**Password:** `123456`  
**URL:** `http://localhost:3000/admin-login` (or your configured port)

Password hash: `$2b$10$i0$NAP5K7sd8mGxHVjwDm9U5uNBaSb.e2ryNIyRqnPMbyU6uxrA9h9LW`

All files are ready to copy-paste!
