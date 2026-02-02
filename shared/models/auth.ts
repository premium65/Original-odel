import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, boolean, text, decimal, integer } from "drizzle-orm/pg-core";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),

  // Role & Status
  isAdmin: boolean("is_admin").default(false),
  status: text("status").default("pending"), // pending, active, frozen
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),

  // Balance Fields
  // milestoneAmount = withdrawable balance (starts at 0)
  // milestoneReward = total earnings ever (starts at 0)
  // destinationAmount = 25000 LKR first-day bonus (resets to 0 after first ad click)
  milestoneAmount: decimal("milestone_amount", { precision: 10, scale: 2 }).default("0"),
  milestoneReward: decimal("milestone_reward", { precision: 10, scale: 2 }).default("0"),
  destinationAmount: decimal("destination_amount", { precision: 10, scale: 2 }).default("25000"),
  ongoingMilestone: decimal("ongoing_milestone", { precision: 10, scale: 2 }).default("0"),
  totalAdsCompleted: integer("total_ads_completed").default(0),
  points: integer("points").default(0),
  pendingAmount: decimal("pending_amount", { precision: 10, scale: 2 }).default("0"),

  // Restriction/Promotion Fields
  restrictionAdsLimit: integer("restriction_ads_limit"),
  restrictionDeposit: decimal("restriction_deposit", { precision: 10, scale: 2 }),
  restrictionCommission: decimal("restriction_commission", { precision: 10, scale: 2 }),
  restrictedAdsCompleted: integer("restricted_ads_completed").default(0),

  // E-Voucher (Milestone Hold System)
  milestoneAdsCount: integer("milestone_ads_count"), // Trigger point - when to lock ads
  adsLocked: boolean("ads_locked").default(false), // If true, user cannot click ads until deposit

  // E-Bonus (Instant Reward - NO locking)
  bonusAdsCount: integer("bonus_ads_count"), // Trigger point for instant bonus
  bonusAmount: decimal("bonus_amount", { precision: 10, scale: 2 }), // Amount to add to wallet

  // Deposit tracking
  hasDeposit: boolean("has_deposit").default(false),

  // User Details
  mobileNumber: text("mobile_number"),
  username: text("username"),
  password: text("password"), // Added for compatibility with existing database

  // Preferences
  notificationsEnabled: boolean("notifications_enabled").default(true),
  language: text("language").default("en"),
  theme: text("theme").default("dark"),

  // Bank Details
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountHolderName: text("account_holder_name"),
  branchName: text("branch_name"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
