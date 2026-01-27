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

    // Use MONGO_URI from environment variable (for Render/production)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
    
    console.log("Connecting to MongoDB...");
    console.log("MongoDB URI exists:", !!process.env.MONGO_URI || !!process.env.MONGODB_URI);
    
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    db = mongoClient.db("odeladspro");
    usersCollection = db.collection("users");
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log("MongoDB is not available. Using PostgreSQL instead.");
    mongoClient = null;
    db = null;
    usersCollection = null;
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
