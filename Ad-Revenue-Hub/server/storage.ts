import { db } from "./db";
import { 
  users, ads, withdrawals, deposits, siteSettings, slides, contactInfo, infoPages, commissions, adClicks, adminCredentials,
  type User, type UpsertUser, type Ad, type InsertAd, 
  type Withdrawal, type InsertWithdrawal, type Deposit, type InsertDeposit,
  type SiteSetting, type InsertSiteSetting, type Slide, type InsertSlide,
  type ContactInfo, type InsertContactInfo, type InfoPage, type InsertInfoPage,
  type Commission, type InsertCommission, type AdClick, type InsertAdClick,
  type AdminCredentials
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // User Ops (Extended)
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Balance Ops
  addMilestoneReward(userId: string, amount: number): Promise<void>;
  addMilestoneAmount(userId: string, amount: number): Promise<void>;
  setMilestoneAmount(userId: string, amount: number): Promise<void>;
  subtractMilestoneAmount(userId: string, amount: number): Promise<void>;
  incrementAdsCompleted(userId: string): Promise<void>;
  incrementRestrictedAds(userId: string): Promise<void>;
  resetAllMilestoneRewards(): Promise<void>;
  
  // Ads
  getAds(): Promise<Ad[]>;
  getAd(id: number): Promise<Ad | undefined>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: number, updates: Partial<InsertAd>): Promise<Ad>;
  deleteAd(id: number): Promise<void>;
  
  // Withdrawals
  getWithdrawals(userId?: string): Promise<Withdrawal[]>;
  getWithdrawal(id: number): Promise<Withdrawal | undefined>;
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  updateWithdrawalStatus(id: number, status: string, reason?: string): Promise<Withdrawal>;
  
  // Admin Ops
  setUserRestriction(userId: string, restriction: Partial<User>): Promise<User>;
  removeUserRestriction(userId: string): Promise<User>;
  
  // Site Settings (CMS)
  getSiteSettings(): Promise<SiteSetting[]>;
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  upsertSiteSetting(key: string, value: string): Promise<SiteSetting>;
  
  // Slides
  getSlides(): Promise<Slide[]>;
  getSlide(id: number): Promise<Slide | undefined>;
  createSlide(slide: InsertSlide): Promise<Slide>;
  updateSlide(id: number, updates: Partial<InsertSlide>): Promise<Slide>;
  deleteSlide(id: number): Promise<void>;
  
  // Contact Info
  getContactInfos(): Promise<ContactInfo[]>;
  upsertContactInfo(type: string, value: string, isActive?: boolean): Promise<ContactInfo>;
  
  // Info Pages
  getInfoPages(): Promise<InfoPage[]>;
  getInfoPage(slug: string): Promise<InfoPage | undefined>;
  upsertInfoPage(slug: string, title: string, content: string, isActive?: boolean): Promise<InfoPage>;
  
  // Commissions
  getCommissions(userId?: string): Promise<Commission[]>;
  createCommission(commission: InsertCommission): Promise<Commission>;
  
  // Ad Clicks (Transactions)
  getAdClicks(userId?: string): Promise<AdClick[]>;
  createAdClick(click: InsertAdClick): Promise<AdClick>;
  
  // Deposits
  getDeposits(userId?: string): Promise<Deposit[]>;
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  
  // Stats
  getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    totalWithdrawals: string;
    pendingWithdrawals: string;
    totalDeposits: string;
    totalAdClicks: number;
    totalEarnings: string;
  }>;
  
  // Admin Credentials
  getAdminByCredentials(username: string, password: string): Promise<AdminCredentials | undefined>;
  createAdminCredentials(username: string, password: string): Promise<AdminCredentials>;
}

export class DatabaseStorage implements IStorage {
  // Auth Storage implementation
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // App Storage
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    // Delete related records first
    await db.delete(withdrawals).where(eq(withdrawals.userId, id));
    await db.delete(deposits).where(eq(deposits.userId, id));
    await db.delete(adClicks).where(eq(adClicks.userId, id));
    // Delete user
    await db.delete(users).where(eq(users.id, id));
  }

  async addMilestoneReward(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    const current = parseFloat(user.milestoneReward || "0");
    await this.updateUser(userId, { milestoneReward: (current + amount).toFixed(2) });
  }

  async addMilestoneAmount(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    const current = parseFloat(user.milestoneAmount || "0");
    await this.updateUser(userId, { milestoneAmount: (current + amount).toFixed(2) });
  }

  async setMilestoneAmount(userId: string, amount: number): Promise<void> {
    await this.updateUser(userId, { milestoneAmount: amount.toFixed(2) });
  }

  async subtractMilestoneAmount(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    const current = parseFloat(user.milestoneAmount || "0");
    await this.updateUser(userId, { milestoneAmount: (current - amount).toFixed(2) });
  }

  async incrementAdsCompleted(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    await this.updateUser(userId, { totalAdsCompleted: (user.totalAdsCompleted || 0) + 1 });
  }

  async incrementRestrictedAds(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    await this.updateUser(userId, { restrictedAdsCompleted: (user.restrictedAdsCompleted || 0) + 1 });
  }

  async resetAllMilestoneRewards(): Promise<void> {
    await db.update(users).set({ milestoneReward: "0" });
  }

  // Ads
  async getAds(): Promise<Ad[]> {
    return await db.select().from(ads).orderBy(desc(ads.createdAt));
  }

  async getAd(id: number): Promise<Ad | undefined> {
    const [ad] = await db.select().from(ads).where(eq(ads.id, id));
    return ad;
  }

  async createAd(ad: InsertAd): Promise<Ad> {
    const [newAd] = await db.insert(ads).values(ad).returning();
    return newAd;
  }

  async updateAd(id: number, updates: Partial<InsertAd>): Promise<Ad> {
    const [updated] = await db.update(ads).set(updates).where(eq(ads.id, id)).returning();
    return updated;
  }

  async deleteAd(id: number): Promise<void> {
    await db.delete(ads).where(eq(ads.id, id));
  }

  // Withdrawals
  async getWithdrawals(userId?: string): Promise<Withdrawal[]> {
    if (userId) {
      return await db.select().from(withdrawals).where(eq(withdrawals.userId, userId)).orderBy(desc(withdrawals.createdAt));
    }
    return await db.select().from(withdrawals).orderBy(desc(withdrawals.createdAt));
  }

  async getWithdrawal(id: number): Promise<Withdrawal | undefined> {
    const [w] = await db.select().from(withdrawals).where(eq(withdrawals.id, id));
    return w;
  }

  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [w] = await db.insert(withdrawals).values(withdrawal).returning();
    return w;
  }

  async updateWithdrawalStatus(id: number, status: string, reason?: string): Promise<Withdrawal> {
    const [w] = await db
      .update(withdrawals)
      .set({ status, reason })
      .where(eq(withdrawals.id, id))
      .returning();
    return w;
  }

  // Admin
  async setUserRestriction(userId: string, restriction: Partial<User>): Promise<User> {
    return await this.updateUser(userId, restriction);
  }

  async removeUserRestriction(userId: string): Promise<User> {
    return await this.updateUser(userId, {
      restrictionAdsLimit: null,
      restrictionDeposit: null,
      restrictionCommission: null,
      restrictedAdsCompleted: 0,
      pendingAmount: "0"
    });
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async upsertSiteSetting(key: string, value: string): Promise<SiteSetting> {
    const [setting] = await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedAt: new Date() }
      })
      .returning();
    return setting;
  }

  // Slides
  async getSlides(): Promise<Slide[]> {
    return await db.select().from(slides).orderBy(slides.displayOrder);
  }

  async getSlide(id: number): Promise<Slide | undefined> {
    const [slide] = await db.select().from(slides).where(eq(slides.id, id));
    return slide;
  }

  async createSlide(slide: InsertSlide): Promise<Slide> {
    const [newSlide] = await db.insert(slides).values(slide).returning();
    return newSlide;
  }

  async updateSlide(id: number, updates: Partial<InsertSlide>): Promise<Slide> {
    const [updated] = await db.update(slides).set(updates).where(eq(slides.id, id)).returning();
    return updated;
  }

  async deleteSlide(id: number): Promise<void> {
    await db.delete(slides).where(eq(slides.id, id));
  }

  // Contact Info
  async getContactInfos(): Promise<ContactInfo[]> {
    return await db.select().from(contactInfo);
  }

  async upsertContactInfo(type: string, value: string, isActive: boolean = true): Promise<ContactInfo> {
    const [info] = await db
      .insert(contactInfo)
      .values({ type, value, isActive })
      .onConflictDoUpdate({
        target: contactInfo.type,
        set: { value, isActive, updatedAt: new Date() }
      })
      .returning();
    return info;
  }

  // Info Pages
  async getInfoPages(): Promise<InfoPage[]> {
    return await db.select().from(infoPages);
  }

  async getInfoPage(slug: string): Promise<InfoPage | undefined> {
    const [page] = await db.select().from(infoPages).where(eq(infoPages.slug, slug));
    return page;
  }

  async upsertInfoPage(slug: string, title: string, content: string, isActive: boolean = true): Promise<InfoPage> {
    const [page] = await db
      .insert(infoPages)
      .values({ slug, title, content, isActive })
      .onConflictDoUpdate({
        target: infoPages.slug,
        set: { title, content, isActive, updatedAt: new Date() }
      })
      .returning();
    return page;
  }

  // Commissions
  async getCommissions(userId?: string): Promise<Commission[]> {
    if (userId) {
      return await db.select().from(commissions).where(eq(commissions.userId, userId)).orderBy(desc(commissions.createdAt));
    }
    return await db.select().from(commissions).orderBy(desc(commissions.createdAt));
  }

  async createCommission(commission: InsertCommission): Promise<Commission> {
    const [c] = await db.insert(commissions).values(commission).returning();
    return c;
  }

  // Ad Clicks
  async getAdClicks(userId?: string): Promise<AdClick[]> {
    if (userId) {
      return await db.select().from(adClicks).where(eq(adClicks.userId, userId)).orderBy(desc(adClicks.createdAt));
    }
    return await db.select().from(adClicks).orderBy(desc(adClicks.createdAt));
  }

  async createAdClick(click: InsertAdClick): Promise<AdClick> {
    const [c] = await db.insert(adClicks).values(click).returning();
    return c;
  }

  // Deposits
  async getDeposits(userId?: string): Promise<Deposit[]> {
    if (userId) {
      return await db.select().from(deposits).where(eq(deposits.userId, userId)).orderBy(desc(deposits.createdAt));
    }
    return await db.select().from(deposits).orderBy(desc(deposits.createdAt));
  }

  async createDeposit(deposit: InsertDeposit): Promise<Deposit> {
    const [d] = await db.insert(deposits).values(deposit).returning();
    return d;
  }

  // Stats
  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    totalWithdrawals: string;
    pendingWithdrawals: string;
    totalDeposits: string;
    totalAdClicks: number;
    totalEarnings: string;
  }> {
    const allUsers = await db.select().from(users);
    const allWithdrawals = await db.select().from(withdrawals);
    const allDeposits = await db.select().from(deposits);
    const allClicks = await db.select().from(adClicks);

    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.status === 'active').length;
    const pendingUsers = allUsers.filter(u => u.status === 'pending').length;
    
    const totalWithdrawals = allWithdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + parseFloat(w.amount || '0'), 0)
      .toFixed(2);
    
    const pendingWithdrawals = allWithdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + parseFloat(w.amount || '0'), 0)
      .toFixed(2);
    
    const totalDeposits = allDeposits
      .reduce((sum, d) => sum + parseFloat(d.amount || '0'), 0)
      .toFixed(2);
    
    const totalAdClicks = allClicks.length;
    
    const totalEarnings = allClicks
      .reduce((sum, c) => sum + parseFloat(c.earnedAmount || '0'), 0)
      .toFixed(2);

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      totalWithdrawals,
      pendingWithdrawals,
      totalDeposits,
      totalAdClicks,
      totalEarnings
    };
  }

  // Admin Credentials
  async getAdminByCredentials(username: string, password: string): Promise<AdminCredentials | undefined> {
    const [admin] = await db.select().from(adminCredentials)
      .where(and(
        eq(adminCredentials.username, username),
        eq(adminCredentials.password, password)
      ));
    return admin;
  }

  async createAdminCredentials(username: string, password: string): Promise<AdminCredentials> {
    const [admin] = await db.insert(adminCredentials)
      .values({ username, password })
      .returning();
    return admin;
  }
}

export const storage = new DatabaseStorage();
// Export authStorage for the auth module to use (aliased to same instance)
export const authStorage = storage;
