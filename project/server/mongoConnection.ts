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
