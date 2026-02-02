import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === RATINGS TABLE ===
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  targetUsername: varchar("target_username", { length: 255 }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === ADS TABLE ===
export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  targetUrl: text("target_url"),
  price: decimal("price", { precision: 10, scale: 2 }),
  // Admin panel fields
  type: text("type").default("click"),
  url: text("url"),
  reward: decimal("reward", { precision: 10, scale: 2 }),
  duration: integer("duration").default(30),
  totalViews: integer("total_views").default(0),
  isActive: boolean("is_active").default(true),
  // Extended ad card fields
  currency: text("currency").default("LKR"),
  priceColor: text("price_color").default("#f59e0b"),
  features: text("features"), // JSON array as text
  buttonText: text("button_text").default("Add to Cart"),
  buttonIcon: text("button_icon").default("shopping-cart"),
  showOnDashboard: boolean("show_on_dashboard").default(true),
  displayOrder: integer("display_order").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// === WITHDRAWALS TABLE ===
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // Bank Transfer, etc.
  accountDetails: text("account_details"), // Make optional if new admin uses bankName/Account
  // New fields
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  processedBy: varchar("processed_by"), // Admin ID (UUID)
  processedAt: timestamp("processed_at"),

  status: text("status").default("pending"), // pending, approved, rejected
  reason: text("reason"), // rejection reason
  createdAt: timestamp("created_at").defaultNow(),
});

// === DEPOSITS/TRANSACTIONS TABLE (Optional but good for history) ===
// Guide focuses on updating user balance, but tracking deposits is standard.
export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // "deposit", "manual_add", "admin_bonus"
  description: text("description"),
  // New fields
  method: text("method"),
  reference: text("reference"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SITE SETTINGS TABLE (CMS) ===
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === SLIDES TABLE (Home Page Slideshow) ===
export const slides = pgTable("slides", {
  id: serial("id").primaryKey(),
  title: text("title"),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// === CONTACT INFO TABLE ===
export const contactInfo = pgTable("contact_info", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().unique(), // phone, email, whatsapp, telegram
  value: text("value"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === INFO PAGES TABLE (About, Terms, Privacy) ===
export const infoPages = pgTable("info_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // about, terms, privacy
  title: text("title").notNull(),
  content: text("content"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === COMMISSIONS TABLE ===
export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  referralId: varchar("referral_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // referral, bonus, etc
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === AD CLICKS TABLE (Transaction tracking) ===
export const adClicks = pgTable("ad_clicks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  adId: integer("ad_id").notNull().references(() => ads.id),
  earnedAmount: decimal("earned_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === ADMIN CREDENTIALS TABLE ===
export const adminCredentials = pgTable("admin_credentials", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true });
export const insertAdSchema = createInsertSchema(ads).omit({ id: true, createdAt: true });
export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({ id: true, userId: true, status: true, reason: true, createdAt: true });
export const insertDepositSchema = createInsertSchema(deposits).omit({ id: true, createdAt: true });
export const insertSlideSchema = createInsertSchema(slides).omit({ id: true, createdAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });
export const insertContactInfoSchema = createInsertSchema(contactInfo).omit({ id: true, updatedAt: true });
export const insertInfoPageSchema = createInsertSchema(infoPages).omit({ id: true, updatedAt: true });
export const insertCommissionSchema = createInsertSchema(commissions).omit({ id: true, createdAt: true });
export const insertAdClickSchema = createInsertSchema(adClicks).omit({ id: true, createdAt: true });
export const insertAdminCredentialsSchema = createInsertSchema(adminCredentials).omit({ id: true, createdAt: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Slide = typeof slides.$inferSelect;
export type InsertSlide = z.infer<typeof insertSlideSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type ContactInfo = typeof contactInfo.$inferSelect;
export type InsertContactInfo = z.infer<typeof insertContactInfoSchema>;
export type InfoPage = typeof infoPages.$inferSelect;
export type InsertInfoPage = z.infer<typeof insertInfoPageSchema>;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type AdClick = typeof adClicks.$inferSelect;
export type InsertAdClick = z.infer<typeof insertAdClickSchema>;
export type AdminCredentials = typeof adminCredentials.$inferSelect;
export type InsertAdminCredentials = z.infer<typeof insertAdminCredentialsSchema>;

// ==================== NEW TABLES FOR ADMIN PANEL ====================

// Ad Views
export const adViews = pgTable("ad_views", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  adId: integer("ad_id").references(() => ads.id),
  reward: decimal("reward", { precision: 10, scale: 2 }),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  totalAds: integer("total_ads").default(12),
  completedAds: integer("completed_ads").default(0),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }),
  commissionPerAd: decimal("commission_per_ad", { precision: 10, scale: 2 }),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(),
  section: text("section"),
  title: text("title"),
  content: text("content"),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  value: text("value").notNull(),
  label: text("label"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const slideshow = pgTable("slideshow", {
  id: serial("id").primaryKey(),
  title: text("title"),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  link: text("link"),
  buttonText: text("button_text"),
  badge: text("badge"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const premiumPlans = pgTable("premium_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("LKR"),
  totalAds: integer("total_ads").default(28),
  rewardPerAd: decimal("reward_per_ad", { precision: 10, scale: 2 }).notNull(),
  totalReward: decimal("total_reward", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0.00"),
  welcomeBonus: decimal("welcome_bonus", { precision: 10, scale: 2 }).default("25000.00"),
  features: jsonb("features"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const premiumPurchases = pgTable("premium_purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  planId: integer("plan_id").references(() => premiumPlans.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  processedBy: varchar("processed_by"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon").default("gift"),
  iconColor: text("icon_color").default("#f59e0b"),
  borderColor: text("border_color").default("#374151"),
  status: text("status").default("active"),
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clickableAds = pgTable("clickable_ads", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  title: text("title"),
  duration: integer("duration").default(10),
  reward: decimal("reward", { precision: 10, scale: 2 }).notNull(),
  url: text("url"),
  planType: text("plan_type").default("free"),
  planId: integer("plan_id"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const themeSettings = pgTable("theme_settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  category: text("category").default("colors"),
  label: text("label"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const branding = pgTable("branding", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").default("OdelADS"),
  siteTagline: text("site_tagline").default("Watch & Earn"),
  logoUrl: text("logo_url"),
  logoIconUrl: text("logo_icon_url"),
  faviconUrl: text("favicon_url"),
  footerText: text("footer_text"),
  copyrightText: text("copyright_text"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const textLabels = pgTable("text_labels", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  page: text("page"),
  section: text("section"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const footerLinks = pgTable("footer_links", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  icon: text("icon"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dashboardVideo = pgTable("dashboard_video", {
  id: serial("id").primaryKey(),
  title: text("title").default("Watch & Earn"),
  subtitle: text("subtitle").default("ODELADS"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  showLiveBadge: boolean("show_live_badge").default(true),
  autoplay: boolean("autoplay").default(false),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const homePageContent = pgTable("home_page_content", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(),
  title: text("title"),
  content: text("content"),
  imageUrl: text("image_url"),
  buttonText: text("button_text"),
  buttonUrl: text("button_url"),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marqueeText = pgTable("marquee_text", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  icon: text("icon"),
  color: text("color").default("#f59e0b"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const navbarItems = pgTable("navbar_items", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  path: text("path").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const featuresCards = pgTable("features_cards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"),
  valueKey: text("value_key"),
  valuePrefix: text("value_prefix").default("LKR"),
  borderColor: text("border_color").default("#ef4444"),
  iconColor: text("icon_color"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const statusCards = pgTable("status_cards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"),
  borderColor: text("border_color").default("#10b981"),
  iconColor: text("icon_color"),
  showProgress: boolean("show_progress").default(false),
  valueKey: text("value_key"),
  maxValueKey: text("max_value_key"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});


export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  description: text("description"),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow(),
});

