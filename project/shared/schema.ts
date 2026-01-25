import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, serial, numeric, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with approval status
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  mobileNumber: varchar("mobile_number", { length: 20 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, active, frozen
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  isAdmin: integer("is_admin").notNull().default(0), // 0 = regular user, 1 = admin
  // Bank details
  bankName: varchar("bank_name", { length: 100 }),
  accountNumber: varchar("account_number", { length: 50 }),
  accountHolderName: varchar("account_holder_name", { length: 100 }),
  branchName: varchar("branch_name", { length: 100 }),
  // Financial tracking
  destinationAmount: numeric("destination_amount", { precision: 10, scale: 2 }).notNull().default("25000.00"),
  milestoneAmount: numeric("milestone_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  milestoneReward: numeric("milestone_reward", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalAdsCompleted: integer("total_ads_completed").notNull().default(0),
  // Restriction fields
  restrictionAdsLimit: integer("restriction_ads_limit"),
  restrictionDeposit: numeric("restriction_deposit", { precision: 10, scale: 2 }),
  restrictionCommission: numeric("restriction_commission", { precision: 10, scale: 2 }),
  ongoingMilestone: numeric("ongoing_milestone", { precision: 10, scale: 2 }).notNull().default("0.00"),
  restrictedAdsCompleted: integer("restricted_ads_completed").notNull().default(0),
  points: integer("points").notNull().default(100),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  targetUsername: varchar("target_username", { length: 50 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Ads table
export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  adCode: varchar("ad_code", { length: 20 }).notNull().unique(),
  duration: integer("duration").notNull().default(10),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("101.75"),
  link: text("link").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Ad Clicks tracking
export const adClicks = pgTable("ad_clicks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  adId: integer("ad_id").notNull().references(() => ads.id),
  clickedAt: timestamp("clicked_at").notNull().defaultNow(),
});

// Withdrawals table
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: integer("processed_by").references(() => users.id),
  notes: text("notes"),
  bankFullName: varchar("bank_full_name", { length: 100 }),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  bankName: varchar("bank_name", { length: 100 }),
  bankBranch: varchar("bank_branch", { length: 100 }),
});

// ============================================
// SLIDESHOW & SITE SETTINGS TABLES
// ============================================

// Slideshow Items Table
export const slideshowItems = pgTable("slideshow_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  buttonText: text("button_text"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Site Settings Table (for colors, theme, etc.)
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  settingType: text("setting_type").default("string"),
  category: text("category").default("general"),
  label: text("label"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  ratings: many(ratings),
  adClicks: many(adClicks),
  withdrawals: many(withdrawals),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
}));

export const adClicksRelations = relations(adClicks, ({ one }) => ({
  user: one(users, {
    fields: [adClicks.userId],
    references: [users.id],
  }),
  ad: one(ads, {
    fields: [adClicks.adId],
    references: [ads.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
  processedByUser: one(users, {
    fields: [withdrawals.processedBy],
    references: [users.id],
  }),
}));

// ============================================
// INSERT SCHEMAS
// ============================================

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  registeredAt: true,
  status: true,
  isAdmin: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  createdAt: true,
});

export const insertAdClickSchema = createInsertSchema(adClicks).omit({
  id: true,
  clickedAt: true,
  userId: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  requestedAt: true,
  processedAt: true,
  processedBy: true,
  status: true,
  userId: true,
});

export const insertSlideshowItemSchema = createInsertSchema(slideshowItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

// ============================================
// TYPES
// ============================================

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;
export type Ad = typeof ads.$inferSelect;
export type AdClick = typeof adClicks.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;
export type InsertAdClick = z.infer<typeof insertAdClickSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type SlideshowItem = typeof slideshowItems.$inferSelect;
export type InsertSlideshowItem = z.infer<typeof insertSlideshowItemSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

// ============================================
// DEFAULT COLOR SETTINGS
// ============================================

export const defaultColorSettings = [
  { settingKey: "primary_color", settingValue: "#f59e0b", settingType: "color", category: "colors", label: "Primary Color", description: "Main accent color" },
  { settingKey: "secondary_color", settingValue: "#1a1a2e", settingType: "color", category: "colors", label: "Secondary Color", description: "Background color" },
  { settingKey: "accent_color", settingValue: "#16213e", settingType: "color", category: "colors", label: "Accent Color", description: "Accent highlights" },
  { settingKey: "text_color", settingValue: "#ffffff", settingType: "color", category: "colors", label: "Text Color", description: "Main text color" },
  { settingKey: "nav_bg_color", settingValue: "#000000", settingType: "color", category: "colors", label: "Navigation Background", description: "Top nav bar" },
  { settingKey: "footer_bg_color", settingValue: "#111827", settingType: "color", category: "colors", label: "Footer Background", description: "Footer section" },
  { settingKey: "card_bg_color", settingValue: "#1f2937", settingType: "color", category: "colors", label: "Card Background", description: "Cards and panels" },
  { settingKey: "button_color", settingValue: "#f59e0b", settingType: "color", category: "colors", label: "Button Color", description: "Primary buttons" },
  { settingKey: "button_hover_color", settingValue: "#d97706", settingType: "color", category: "colors", label: "Button Hover", description: "Button hover state" },
  { settingKey: "marquee_bg_color", settingValue: "#f59e0b", settingType: "color", category: "colors", label: "Marquee Background", description: "Scrolling banner" },
  { settingKey: "marquee_text_color", settingValue: "#000000", settingType: "color", category: "colors", label: "Marquee Text", description: "Banner text" },
];
