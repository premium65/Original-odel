import { users, ratings, ads, type User, type InsertUser, type Rating, type InsertRating, type Ad, type InsertAd } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  
  // Financial methods
  addMilestoneAmount(userId: number, amount: string): Promise<User | undefined>;
  addMilestoneReward(userId: number, amount: number): Promise<User | undefined>;
  resetAllMilestoneRewards(): Promise<void>;
  
  // Ad click tracking
  getUserAdClickCount(userId: number): Promise<number>;
  incrementAdsCompleted(userId: number): Promise<User | undefined>;
  
  // Premium manage methods
  resetUserField(userId: number, field: string): Promise<User | undefined>;
  addUserFieldValue(userId: number, field: string, amount: string): Promise<User | undefined>;
  updateUserDetails(userId: number, data: { username?: string; mobileNumber?: string; password?: string }): Promise<User | undefined>;
  updateUserBankDetails(userId: number, data: { bankName?: string; accountNumber?: string; accountHolderName?: string; branchName?: string }): Promise<User | undefined>;
  setUserRestriction(userId: number, adsLimit: number, deposit: string, commission: string, pendingAmount?: string): Promise<User | undefined>;
  removeUserRestriction(userId: number): Promise<User | undefined>;
  incrementRestrictedAds(userId: number): Promise<User | undefined>;
  
  // Rating methods
  createRating(rating: InsertRating): Promise<Rating>;
  getUserRatings(userId: number): Promise<Rating[]>;
  getAllRatings(): Promise<Rating[]>;
  deleteRating(id: number): Promise<void>;
  
  // Ad methods
  createAd(ad: InsertAd): Promise<Ad>;
  getAd(id: number): Promise<Ad | undefined>;
  getAllAds(): Promise<Ad[]>;
  updateAd(id: number, data: Partial<Ad>): Promise<Ad | undefined>;
  deleteAd(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ========================================
  // USER METHODS
  // ========================================
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.id));
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ status }).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // ========================================
  // FINANCIAL METHODS
  // ========================================
  
  async addMilestoneAmount(userId: number, amount: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const currentAmount = parseFloat(user.milestoneAmount || "0");
    const newAmount = currentAmount + parseFloat(amount);
    
    const [updated] = await db
      .update(users)
      .set({ milestoneAmount: newAmount.toFixed(2) })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async addMilestoneReward(userId: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const currentReward = parseFloat(user.milestoneReward || "0");
    const newReward = currentReward + amount;
    
    const [updated] = await db
      .update(users)
      .set({ milestoneReward: newReward.toFixed(2) })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async resetAllMilestoneRewards(): Promise<void> {
    await db.update(users).set({ milestoneReward: "0" });
  }

  // ========================================
  // AD CLICK TRACKING
  // ========================================
  
  async getUserAdClickCount(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    return user?.totalAdsCompleted || 0;
  }

  async incrementAdsCompleted(userId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const [updated] = await db
      .update(users)
      .set({ totalAdsCompleted: (user.totalAdsCompleted || 0) + 1 })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // ========================================
  // PREMIUM MANAGE METHODS
  // ========================================
  
  async resetUserField(userId: number, field: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updateData: any = {};
    
    switch (field) {
      case 'milestoneAmount':
        updateData.milestoneAmount = "0";
        break;
      case 'milestoneReward':
        updateData.milestoneReward = "0";
        break;
      case 'destinationAmount':
        updateData.destinationAmount = "0";
        break;
      case 'ongoingMilestone':
        updateData.ongoingMilestone = "0";
        break;
      case 'totalAdsCompleted':
        updateData.totalAdsCompleted = 0;
        break;
      case 'points':
        updateData.points = 0;
        break;
      case 'restrictedAdsCompleted':
        updateData.restrictedAdsCompleted = 0;
        break;
      default:
        return user;
    }
    
    const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return updated;
  }

  async addUserFieldValue(userId: number, field: string, amount: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updateData: any = {};
    const amountNum = parseFloat(amount);
    
    switch (field) {
      case 'milestoneAmount':
        updateData.milestoneAmount = (parseFloat(user.milestoneAmount || "0") + amountNum).toFixed(2);
        break;
      case 'milestoneReward':
        updateData.milestoneReward = (parseFloat(user.milestoneReward || "0") + amountNum).toFixed(2);
        break;
      case 'destinationAmount':
        updateData.destinationAmount = (parseFloat(user.destinationAmount || "0") + amountNum).toFixed(2);
        break;
      case 'ongoingMilestone':
        updateData.ongoingMilestone = (parseFloat(user.ongoingMilestone || "0") + amountNum).toFixed(2);
        break;
      case 'totalAdsCompleted':
        updateData.totalAdsCompleted = (user.totalAdsCompleted || 0) + Math.floor(amountNum);
        break;
      case 'points':
        updateData.points = (user.points || 0) + Math.floor(amountNum);
        break;
      default:
        return user;
    }
    
    const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return updated;
  }

  async updateUserDetails(userId: number, data: { username?: string; mobileNumber?: string; password?: string }): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updateData: any = {};
    if (data.username) updateData.username = data.username;
    if (data.mobileNumber) updateData.mobileNumber = data.mobileNumber;
    if (data.password) updateData.password = await hashPassword(data.password);
    
    if (Object.keys(updateData).length === 0) return user;
    
    const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return updated;
  }

  async updateUserBankDetails(userId: number, data: { bankName?: string; accountNumber?: string; accountHolderName?: string; branchName?: string }): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updateData: any = {};
    if (data.bankName !== undefined) updateData.bankName = data.bankName;
    if (data.accountNumber !== undefined) updateData.accountNumber = data.accountNumber;
    if (data.accountHolderName !== undefined) updateData.accountHolderName = data.accountHolderName;
    if (data.branchName !== undefined) updateData.branchName = data.branchName;
    
    if (Object.keys(updateData).length === 0) return user;
    
    const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return updated;
  }

  async setUserRestriction(userId: number, adsLimit: number, deposit: string, commission: string, pendingAmount?: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updateData: any = {
      restrictionAdsLimit: adsLimit,
      restrictionDeposit: deposit,
      restrictionCommission: commission,
      restrictedAdsCompleted: 0,
    };
    
    if (pendingAmount) {
      updateData.pendingAmount = pendingAmount;
    }
    
    const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return updated;
  }

  async removeUserRestriction(userId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const [updated] = await db
      .update(users)
      .set({
        restrictionAdsLimit: null,
        restrictionDeposit: null,
        restrictionCommission: null,
        restrictedAdsCompleted: 0,
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async incrementRestrictedAds(userId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const [updated] = await db
      .update(users)
      .set({ restrictedAdsCompleted: (user.restrictedAdsCompleted || 0) + 1 })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // ========================================
  // RATING METHODS
  // ========================================
  
  async createRating(insertRating: InsertRating): Promise<Rating> {
    const [rating] = await db.insert(ratings).values(insertRating).returning();
    return rating;
  }

  async getUserRatings(userId: number): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.oderId, userId)).orderBy(desc(ratings.id));
  }

  async getAllRatings(): Promise<Rating[]> {
    return await db.select().from(ratings).orderBy(desc(ratings.id));
  }

  async deleteRating(id: number): Promise<void> {
    await db.delete(ratings).where(eq(ratings.id, id));
  }

  // ========================================
  // AD METHODS
  // ========================================
  
  async createAd(insertAd: InsertAd): Promise<Ad> {
    const [ad] = await db.insert(ads).values(insertAd).returning();
    return ad;
  }

  async getAd(id: number): Promise<Ad | undefined> {
    const [ad] = await db.select().from(ads).where(eq(ads.id, id));
    return ad;
  }

  async getAllAds(): Promise<Ad[]> {
    return await db.select().from(ads).orderBy(desc(ads.id));
  }

  async updateAd(id: number, data: Partial<Ad>): Promise<Ad | undefined> {
    const [ad] = await db.update(ads).set(data).where(eq(ads.id, id)).returning();
    return ad;
  }

  async deleteAd(id: number): Promise<void> {
    await db.delete(ads).where(eq(ads.id, id));
  }
}

export const storage = new DatabaseStorage();
