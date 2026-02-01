import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, serial, numeric } from "drizzle-orm/pg-core";
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
  destinationAmount: numeric("destination_amount", { precision: 10, scale: 2 }).notNull().default("25000.00"), // Registration bonus (becomes 0 after first ad)
  milestoneAmount: numeric("milestone_amount", { precision: 10, scale: 2 }).notNull().default("0.00"), // Current withdrawable balance
  milestoneReward: numeric("milestone_reward", { precision: 10, scale: 2 }).notNull().default("0.00"), // Total ad earnings
  totalAdsCompleted: integer("total_ads_completed").notNull().default(0), // Total number of ads completed
  // Restriction fields
  restrictionAdsLimit: integer("restriction_ads_limit"), // Max ads allowed (e.g., 12)
  restrictionDeposit: numeric("restriction_deposit", { precision: 10, scale: 2 }), // Deposit amount (e.g., 5000)
  restrictionCommission: numeric("restriction_commission", { precision: 10, scale: 2 }), // Commission during restriction
  ongoingMilestone: numeric("ongoing_milestone", { precision: 10, scale: 2 }).notNull().default("0.00"), // Pending amount during restriction
  restrictedAdsCompleted: integer("restricted_ads_completed").notNull().default(0), // Count of ads completed under current restriction
  points: integer("points").notNull().default(100), // User points (modifiable by admin)
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  targetUsername: varchar("target_username", { length: 50 }).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Ads table
export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  adCode: varchar("ad_code", { length: 20 }).notNull().unique(), // AD-0001, AD-0002, etc
  duration: integer("duration").notNull().default(10), // seconds
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("101.75"), // reward per click in LKR
  link: text("link").notNull(),
  imageUrl: text("image_url"), // path to product image
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
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: integer("processed_by").references(() => users.id), // admin who processed
  notes: text("notes"), // admin notes
  // Bank details for withdrawal
  bankFullName: varchar("bank_full_name", { length: 100 }),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  bankName: varchar("bank_name", { length: 100 }),
  bankBranch: varchar("bank_branch", { length: 100 }),
});

// Relations
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

// Insert schemas
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

// Types
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
