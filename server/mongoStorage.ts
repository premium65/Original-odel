import { getDb, getUsersCollection } from "./mongoConnection";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { User, InsertUser, Rating, InsertRating, Ad, InsertAd, AdClick, Withdrawal } from "@shared/schema";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Stub implementation for MongoStorage to satisfy IStorage interface
export class MongoStorage {
  private getCollection<T = any>(name: string) {
    return getDb().collection<T>(name);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const collection = getUsersCollection();
    const user = await collection.findOne({ username });
    return user as unknown as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const collection = getUsersCollection();
    const user = await collection.findOne({ email });
    return user as unknown as User | undefined;
  }

  async getUser(userId: string): Promise<User | undefined> {
    const collection = getUsersCollection();
    try {
      if (ObjectId.isValid(userId)) {
        const user = await collection.findOne({ _id: new ObjectId(userId) });
        return user as unknown as User | undefined;
      }
      const user = await collection.findOne({ id: userId });
      return user as unknown as User | undefined;
    } catch {
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    const collection = getUsersCollection();
    const result = await collection.insertOne({
      ...userData,
      createdAt: new Date(),
    });
    return {
      ...userData,
      id: result.insertedId.toString(),
      createdAt: new Date(),
    } as unknown as User;
  }

  async getAllUsers(): Promise<User[]> {
    const collection = getUsersCollection();
    const users = await collection.find({}).toArray();
    return users as unknown as User[];
  }

  async updateUserStatus(userId: string, status: string): Promise<User | undefined> {
    return undefined;
  }

  async updateUserDetails(id: string, data: any): Promise<User | undefined> { return undefined; }
  async updateUserBankDetails(id: string, data: any): Promise<User | undefined> { return undefined; }

  async createRating(rating: any): Promise<Rating> { throw new Error("Not implemented"); }
  async getRatingsByUser(userId: string): Promise<Rating[]> { return []; }
  async getAllRatings(): Promise<Rating[]> { return []; }
  async deleteRating(id: number): Promise<boolean> { return false; }

  async getAllAds(): Promise<Ad[]> {
    const adsCollection = this.getCollection("ads");
    const ads = await adsCollection.find({}).sort({ createdAt: -1 }).toArray();
    return ads.map((ad: any) => ({
      ...ad,
      id: ad.id ?? ad._id?.toString(),
    })) as unknown as Ad[];
  }
  async getAd(id: number): Promise<Ad | undefined> {
    const adsCollection = this.getCollection("ads");
    const ad = await adsCollection.findOne({ id });
    if (!ad) return undefined;
    return {
      ...ad,
      id: (ad as any).id ?? (ad as any)._id?.toString(),
    } as unknown as Ad;
  }

  async createAd(ad: any): Promise<Ad> {
    const adsCollection = this.getCollection("ads");
    const adId = ad.id ?? Date.now();
    const result = await adsCollection.insertOne({
      ...ad,
      id: adId,
      createdAt: new Date(),
    });
    return {
      ...ad,
      id: adId,
      createdAt: new Date(),
    } as unknown as Ad;
  }

  async updateAd(id: number, ad: any): Promise<Ad | undefined> {
    const adsCollection = this.getCollection("ads");
    const query = { id };
    const updated = await adsCollection.findOneAndUpdate(
      query,
      { $set: ad },
      { returnDocument: "after" }
    );
    if (!updated.value) return undefined;
    return {
      ...updated.value,
      id: (updated.value as any).id ?? (updated.value as any)._id?.toString(),
    } as unknown as Ad;
  }

  async deleteAd(id: number): Promise<boolean> {
    const adsCollection = this.getCollection("ads");
    const result = await adsCollection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async recordAdClick(userId: string, adId: number, earnedAmount: string): Promise<AdClick> {
    const adClicksCollection = this.getCollection("ad_clicks");
    const createdAt = new Date();
    const result = await adClicksCollection.insertOne({
      userId,
      adId,
      earnedAmount,
      createdAt,
    });
    return {
      id: result.insertedId.toString(),
      userId,
      adId,
      earnedAmount,
      createdAt,
    } as unknown as AdClick;
  }

  async getUserAdClicks(userId: string): Promise<AdClick[]> {
    const adClicksCollection = this.getCollection("ad_clicks");
    const clicks = await adClicksCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return clicks.map((click: any) => ({
      ...click,
      id: click._id?.toString(),
      adId: typeof click.adId === "number" ? click.adId : Number(click.adId) || 0,
    })) as unknown as AdClick[];
  }

  async getAllAdClicks(): Promise<AdClick[]> {
    const adClicksCollection = this.getCollection("ad_clicks");
    const clicks = await adClicksCollection.find({}).sort({ createdAt: -1 }).toArray();
    return clicks.map((click: any) => ({
      ...click,
      id: click._id?.toString(),
      adId: typeof click.adId === "number" ? click.adId : Number(click.adId) || 0,
    })) as unknown as AdClick[];
  }

  async addMilestoneAmount(userId: string, amount: string): Promise<User | undefined> {
    return this.addUserFieldValue(userId, "milestoneAmount", amount);
  }

  async addMilestoneReward(userId: string, amount: string): Promise<User | undefined> {
    return this.addUserFieldValue(userId, "milestoneReward", amount);
  }

  async resetUserField(userId: string, field: string): Promise<User | undefined> {
    return this.updateUser(userId, { [field]: "0" });
  }

  async addUserFieldValue(userId: string, field: string, amount: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    const currentValue = parseFloat((user as any)[field] ?? "0");
    const nextValue = currentValue + parseFloat(amount);
    return this.updateUser(userId, { [field]: nextValue.toFixed(2) });
  }

  async getUserAdClickCount(userId: string): Promise<number> {
    const adClicksCollection = this.getCollection("ad_clicks");
    return adClicksCollection.countDocuments({ userId });
  }

  async resetDestinationAmount(userId: string): Promise<User | undefined> {
    return this.updateUser(userId, { destinationAmount: "0" });
  }

  async incrementAdsCompleted(userId: string): Promise<User | undefined> {
    const usersCollection = getUsersCollection();
    const query = ObjectId.isValid(userId) ? { _id: new ObjectId(userId) } : { id: userId };
    const updated = await usersCollection.findOneAndUpdate(
      query,
      { $inc: { totalAdsCompleted: 1 } },
      { returnDocument: "after" }
    );
    return updated.value as unknown as User | undefined;
  }

  async setUserRestriction(userId: string, adsLimit: number, deposit: string, commission: string): Promise<User | undefined> {
    return this.updateUser(userId, {
      restrictionAdsLimit: adsLimit,
      restrictionDeposit: deposit,
      restrictionCommission: commission,
      restrictedAdsCompleted: 0,
    });
  }

  async removeUserRestriction(userId: string): Promise<User | undefined> {
    return this.updateUser(userId, {
      restrictionAdsLimit: null,
      restrictionDeposit: null,
      restrictionCommission: null,
      restrictedAdsCompleted: 0,
    });
  }

  async incrementRestrictedAds(userId: string): Promise<User | undefined> {
    const usersCollection = getUsersCollection();
    const query = ObjectId.isValid(userId) ? { _id: new ObjectId(userId) } : { id: userId };
    const updated = await usersCollection.findOneAndUpdate(
      query,
      { $inc: { restrictedAdsCompleted: 1 } },
      { returnDocument: "after" }
    );
    return updated.value as unknown as User | undefined;
  }

  async getAllWithdrawals(): Promise<Withdrawal[]> { return []; }
  async getPendingWithdrawals(): Promise<Withdrawal[]> { return []; }
  async getUserWithdrawals(userId: string): Promise<Withdrawal[]> { return []; }
  async createWithdrawal(withdrawal: any): Promise<Withdrawal> { throw new Error("Not implemented"); }
  async approveWithdrawal(id: number, adminId: string): Promise<Withdrawal | undefined> { return undefined; }
  async rejectWithdrawal(id: number, adminId: string, notes: string): Promise<Withdrawal | undefined> { return undefined; }

  async updateUser(id: string | number, data: any): Promise<User | undefined> {
    const usersCollection = getUsersCollection();
    const idValue = String(id);
    const query = ObjectId.isValid(idValue) ? { _id: new ObjectId(idValue) } : { id: idValue };
    const updated = await usersCollection.findOneAndUpdate(
      query,
      { $set: data },
      { returnDocument: "after" }
    );
    return updated.value as unknown as User | undefined;
  }
  async resetUserAds(userId: string | number): Promise<User | undefined> { return undefined; }
  async getAllDeposits(): Promise<User[]> { return []; }
  async getAllCommissions(): Promise<User[]> { return []; }
  async getAllPremiumPurchases(): Promise<any[]> { return []; }
}

export const mongoStorage = new MongoStorage();
