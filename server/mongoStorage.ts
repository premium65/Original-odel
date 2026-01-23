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
