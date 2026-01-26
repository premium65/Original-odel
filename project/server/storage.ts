// Referenced from javascript_database integration blueprint for DatabaseStorage pattern
import { users, ratings, ads, adClicks, withdrawals, siteSettings, slideshowImages, type User, type InsertUser, type Rating, type InsertRating, type Ad, type AdClick, type InsertAd, type InsertAdClick, type Withdrawal, type InsertWithdrawal } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  updateUserDetails(id: number, data: { username?: string; mobileNumber?: string; password?: string }): Promise<User | undefined>;
  updateUserBankDetails(id: number, data: { bankName?: string; accountNumber?: string; accountHolderName?: string; branchName?: string }): Promise<User | undefined>;

  // Rating operations
  createRating(rating: InsertRating & { userId: number }): Promise<Rating>;
  getRatingsByUser(userId: number): Promise<Rating[]>;
  getAllRatings(): Promise<Rating[]>;
  deleteRating(id: number): Promise<boolean>;

  // Ad operations
  getAllAds(): Promise<Ad[]>;
  getAd(id: number): Promise<Ad | undefined>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: number, ad: Partial<InsertAd>): Promise<Ad | undefined>;
  deleteAd(id: number): Promise<boolean>;
  
  // Ad Click operations
  recordAdClick(userId: number, adId: number): Promise<AdClick>;
  getUserAdClicks(userId: number): Promise<AdClick[]>;

  // Financial operations
  addMilestoneAmount(userId: number, amount: string): Promise<User | undefined>;
  addMilestoneReward(userId: number, amount: string): Promise<User | undefined>;
  resetUserField(userId: number, field: string): Promise<User | undefined>;
  addUserFieldValue(userId: number, field: string, amount: string): Promise<User | undefined>;
  getUserAdClickCount(userId: number): Promise<number>;
  resetDestinationAmount(userId: number): Promise<User | undefined>;
  incrementAdsCompleted(userId: number): Promise<User | undefined>;
  
  // Restriction operations
  setUserRestriction(userId: number, adsLimit: number, deposit: string, commission: string): Promise<User | undefined>;
  removeUserRestriction(userId: number): Promise<User | undefined>;
  incrementRestrictedAds(userId: number): Promise<User | undefined>;
  
  // Withdrawal operations
  createWithdrawal(userId: number, amount: string, bankDetails: { fullName: string; accountNumber: string; bankName: string; branch: string }): Promise<Withdrawal>;
  getUserWithdrawals(userId: number): Promise<Withdrawal[]>;
  getAllWithdrawals(): Promise<Withdrawal[]>;
  getPendingWithdrawals(): Promise<Withdrawal[]>;
  approveWithdrawal(id: number, adminId: number): Promise<Withdrawal | undefined>;
  rejectWithdrawal(id: number, adminId: number, notes: string): Promise<Withdrawal | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.registeredAt));
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserDetails(id: number, data: { username?: string; mobileNumber?: string; password?: string }): Promise<User | undefined> {
    const updateData: any = {};
    
    if (data.username) {
      updateData.username = data.username;
    }
    if (data.mobileNumber !== undefined) {
      updateData.mobileNumber = data.mobileNumber;
    }
    if (data.password) {
      const bcrypt = await import('bcrypt');
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserBankDetails(id: number, data: { bankName?: string; accountNumber?: string; accountHolderName?: string; branchName?: string }): Promise<User | undefined> {
    const updateData: any = {};
    
    if (data.bankName !== undefined) {
      updateData.bankName = data.bankName;
    }
    if (data.accountNumber !== undefined) {
      updateData.accountNumber = data.accountNumber;
    }
    if (data.accountHolderName !== undefined) {
      updateData.accountHolderName = data.accountHolderName;
    }
    if (data.branchName !== undefined) {
      updateData.branchName = data.branchName;
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Rating operations
  async createRating(ratingData: InsertRating & { userId: number }): Promise<Rating> {
    const [rating] = await db
      .insert(ratings)
      .values(ratingData)
      .returning();
    return rating;
  }

  async getRatingsByUser(userId: number): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.userId, userId))
      .orderBy(desc(ratings.createdAt));
  }

  async getAllRatings(): Promise<Rating[]> {
    return await db.select().from(ratings).orderBy(desc(ratings.createdAt));
  }

  async deleteRating(id: number): Promise<boolean> {
    const result = await db
      .delete(ratings)
      .where(eq(ratings.id, id))
      .returning();
    return result.length > 0;
  }

  // Ad operations
  async getAllAds(): Promise<Ad[]> {
    return await db.select().from(ads).orderBy(desc(ads.createdAt));
  }

  async getAd(id: number): Promise<Ad | undefined> {
    const [ad] = await db.select().from(ads).where(eq(ads.id, id));
    return ad || undefined;
  }

  async createAd(adData: InsertAd): Promise<Ad> {
    const [ad] = await db
      .insert(ads)
      .values(adData)
      .returning();
    return ad;
  }

  async updateAd(id: number, adData: Partial<InsertAd>): Promise<Ad | undefined> {
    const [ad] = await db
      .update(ads)
      .set(adData)
      .where(eq(ads.id, id))
      .returning();
    return ad || undefined;
  }

  async deleteAd(id: number): Promise<boolean> {
    const result = await db.delete(ads).where(eq(ads.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Ad Click operations
  async recordAdClick(userId: number, adId: number): Promise<AdClick> {
    const [click] = await db
      .insert(adClicks)
      .values({ userId, adId })
      .returning();
    return click;
  }

  async getUserAdClicks(userId: number): Promise<AdClick[]> {
    return await db
      .select()
      .from(adClicks)
      .where(eq(adClicks.userId, userId))
      .orderBy(desc(adClicks.clickedAt));
  }

  // Financial operations
  async addMilestoneAmount(userId: number, amount: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        milestoneAmount: sql`${users.milestoneAmount} + ${amount}`,
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async addMilestoneReward(userId: number, amount: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        milestoneReward: sql`${users.milestoneReward} + ${amount}`,
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async resetUserField(userId: number, field: string): Promise<User | undefined> {
    const fieldMap: Record<string, any> = {
      'booking': { totalAdsCompleted: 0, restrictedAdsCompleted: 0 },
      'points': { milestoneAmount: '0.00' },
      'premiumTreasure': { milestoneReward: '0.00' },
      'normalTreasure': { destinationAmount: '0.00' },
      'bookingValue': { milestoneAmount: '0.00' },
      'ongoingMilestone': { ongoingMilestone: '0.00' },
    };

    const updateData = fieldMap[field];
    if (!updateData) {
      throw new Error(`Invalid field: ${field}`);
    }

    if (field === 'booking') {
      await db.delete(adClicks).where(eq(adClicks.userId, userId));
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async resetAllMilestoneRewards(): Promise<void> {
    await db
      .update(users)
      .set({
        milestoneReward: '0.00',
      })
      .where(sql`1=1`);
  }

  async addUserFieldValue(userId: number, field: string, amount: string): Promise<User | undefined> {
    const numValue = parseFloat(amount);
    
    if (field === 'points' && numValue > 100) {
      throw new Error('Points cannot exceed 100');
    }
    
    const fieldMap: Record<string, any> = {
      'points': { points: numValue },
      'premiumTreasure': { milestoneReward: sql`${users.milestoneReward} + ${amount}` },
      'normalTreasure': { destinationAmount: sql`${users.destinationAmount} + ${amount}` },
      'bookingValue': { milestoneAmount: sql`${users.milestoneAmount} + ${amount}` },
    };

    const updateData = fieldMap[field];
    if (!updateData) {
      throw new Error(`Invalid field: ${field}`);
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getUserAdClickCount(userId: number): Promise<number> {
    const clicks = await db
      .select()
      .from(adClicks)
      .where(eq(adClicks.userId, userId));
    return clicks.length;
  }

  async resetDestinationAmount(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        destinationAmount: "0.00",
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async incrementAdsCompleted(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        totalAdsCompleted: sql`${users.totalAdsCompleted} + 1`,
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Restriction operations
  async setUserRestriction(userId: number, adsLimit: number, deposit: string, commission: string, pendingAmount?: string): Promise<User | undefined> {
    const depositNum = parseFloat(deposit);
    const commissionNum = parseFloat(commission);
    const pendingNum = pendingAmount ? parseFloat(pendingAmount) : depositNum;
    
    if (isNaN(depositNum) || depositNum <= 0) {
      throw new Error("Invalid deposit amount");
    }
    if (isNaN(commissionNum) || commissionNum <= 0) {
      throw new Error("Invalid commission amount");
    }
    
    const existingUser = await this.getUser(userId);
    const isEditing = existingUser && existingUser.restrictionAdsLimit !== null && existingUser.restrictionAdsLimit !== undefined;
    
    const updateData: any = {
      restrictionAdsLimit: adsLimit,
      restrictionDeposit: depositNum.toFixed(2),
      restrictionCommission: commissionNum.toFixed(2),
      ongoingMilestone: pendingNum.toFixed(2),
    };
    
    if (!isEditing) {
      updateData.restrictedAdsCompleted = 0;
      updateData.milestoneAmount = sql`${users.milestoneAmount} - ${depositNum}::numeric`;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async removeUserRestriction(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        restrictionAdsLimit: null,
        restrictionDeposit: null,
        restrictionCommission: null,
        restrictedAdsCompleted: 0,
        ongoingMilestone: "0.00",
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async incrementRestrictedAds(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        restrictedAdsCompleted: sql`${users.restrictedAdsCompleted} + 1`,
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Withdrawal operations
  async createWithdrawal(userId: number, amount: string, bankDetails: { fullName: string; accountNumber: string; bankName: string; branch: string }): Promise<Withdrawal> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const milestoneAmount = parseFloat(user.milestoneAmount);
    const withdrawalAmount = parseFloat(amount);
    
    if (withdrawalAmount > milestoneAmount) {
      throw new Error("Insufficient balance");
    }
    
    const [withdrawal] = await db
      .insert(withdrawals)
      .values({ 
        userId, 
        amount,
        bankFullName: bankDetails.fullName,
        bankAccountNumber: bankDetails.accountNumber,
        bankName: bankDetails.bankName,
        bankBranch: bankDetails.branch,
      })
      .returning();
    return withdrawal;
  }

  async getUserWithdrawals(userId: number): Promise<Withdrawal[]> {
    return await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.requestedAt));
  }

  async getAllWithdrawals(): Promise<Withdrawal[]> {
    return await db.select().from(withdrawals).orderBy(desc(withdrawals.requestedAt));
  }

  async getPendingWithdrawals(): Promise<Withdrawal[]> {
    return await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.status, "pending"))
      .orderBy(desc(withdrawals.requestedAt));
  }

  async approveWithdrawal(id: number, adminId: number): Promise<Withdrawal | undefined> {
    const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, id));
    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }
    
    if (withdrawal.status !== "pending") {
      throw new Error("Withdrawal already processed");
    }

    await db
      .update(users)
      .set({
        milestoneAmount: sql`${users.milestoneAmount} - ${withdrawal.amount}`,
      })
      .where(eq(users.id, withdrawal.userId));

    const [updated] = await db
      .update(withdrawals)
      .set({
        status: "approved",
        processedAt: new Date(),
        processedBy: adminId,
      })
      .where(eq(withdrawals.id, id))
      .returning();
    
    return updated || undefined;
  }

  async rejectWithdrawal(id: number, adminId: number, notes: string): Promise<Withdrawal | undefined> {
    const [updated] = await db
      .update(withdrawals)
      .set({
        status: "rejected",
        processedAt: new Date(),
        processedBy: adminId,
        notes,
      })
      .where(eq(withdrawals.id, id))
      .returning();
    
    return updated || undefined;
  }

  // =============================================
  // SITE SETTINGS METHODS (CMS)
  // =============================================

  async getSettingsByCategory(category: string): Promise<any[]> {
    return await db
      .select({
        setting_key: siteSettings.settingKey,
        setting_value: siteSettings.settingValue,
      })
      .from(siteSettings)
      .where(eq(siteSettings.category, category));
  }

  async upsertSetting(category: string, key: string, value: string): Promise<void> {
    // Try to update first
    const existing = await db
      .select()
      .from(siteSettings)
      .where(and(eq(siteSettings.category, category), eq(siteSettings.settingKey, key)));
    
    if (existing.length > 0) {
      await db
        .update(siteSettings)
        .set({ settingValue: value, updatedAt: new Date() })
        .where(and(eq(siteSettings.category, category), eq(siteSettings.settingKey, key)));
    } else {
      await db.insert(siteSettings).values({
        category,
        settingKey: key,
        settingValue: value,
      });
    }
  }

  async getPublicSettings(): Promise<any[]> {
    return await db
      .select({
        category: siteSettings.category,
        setting_key: siteSettings.settingKey,
        setting_value: siteSettings.settingValue,
      })
      .from(siteSettings)
      .where(inArray(siteSettings.category, ['contact', 'branding', 'theme', 'home', 'legal']));
  }

  // =============================================
  // SLIDESHOW METHODS (CMS)
  // =============================================

  async getSlideshowImages(page: string): Promise<any[]> {
    return await db
      .select()
      .from(slideshowImages)
      .where(eq(slideshowImages.page, page))
      .orderBy(slideshowImages.displayOrder);
  }

  async getActiveSlideshowImages(page: string): Promise<any[]> {
    return await db
      .select()
      .from(slideshowImages)
      .where(and(eq(slideshowImages.page, page), eq(slideshowImages.isActive, 1)))
      .orderBy(slideshowImages.displayOrder);
  }

  async addSlideshowImage(title: string, imageUrl: string, linkUrl: string, page: string): Promise<{ id: number }> {
    const [result] = await db
      .insert(slideshowImages)
      .values({ title, imageUrl, linkUrl, page })
      .returning({ id: slideshowImages.id });
    return result;
  }

  async updateSlideshowImage(id: number, title: string, imageUrl: string, linkUrl: string, displayOrder: number, isActive: number): Promise<void> {
    await db
      .update(slideshowImages)
      .set({ title, imageUrl, linkUrl, displayOrder, isActive })
      .where(eq(slideshowImages.id, id));
  }

  async deleteSlideshowImage(id: number): Promise<void> {
    await db.delete(slideshowImages).where(eq(slideshowImages.id, id));
  }
}

export const storage = new DatabaseStorage();
