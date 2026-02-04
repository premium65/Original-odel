
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function repairDatabase() {
    if (!db) {
        console.log("[DB REPAIR] Database not connected, skipping repair.");
        return;
    }

    console.log("[DB REPAIR] Starting automatic schema repair...");

    try {
        // Add missing columns safely
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number TEXT`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(255)`);

        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS milestone_amount DECIMAL(10,2) DEFAULT 0`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS milestone_reward DECIMAL(10,2) DEFAULT 0`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS destination_amount DECIMAL(10,2) DEFAULT 0`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ongoing_milestone DECIMAL(10,2) DEFAULT 0`);

        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_ads_completed INTEGER DEFAULT 0`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_amount DECIMAL(10,2) DEFAULT 0`);

        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS restriction_ads_limit INTEGER`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS restriction_deposit DECIMAL(10,2)`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS restriction_commission DECIMAL(10,2)`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS restricted_ads_completed INTEGER DEFAULT 0`);

        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS has_deposit BOOLEAN DEFAULT FALSE`);

        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en'`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark'`);

        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name TEXT`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_number TEXT`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_holder_name TEXT`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_name TEXT`);

        // E-Voucher and E-Bonus columns
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS milestone_ads_count INTEGER`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ads_locked BOOLEAN DEFAULT FALSE`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS e_voucher_banner_url TEXT`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_ads_count INTEGER`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_amount DECIMAL(10,2)`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS e_bonus_banner_url TEXT`);

        // Ensure ad_clicks table exists with all required columns
        await db.execute(sql`CREATE TABLE IF NOT EXISTS ad_clicks (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR NOT NULL REFERENCES users(id),
            ad_id INTEGER NOT NULL REFERENCES ads(id),
            earned_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        )`);
        // Add earned_amount column if table existed without it
        await db.execute(sql`ALTER TABLE ad_clicks ADD COLUMN IF NOT EXISTS earned_amount DECIMAL(10,2) NOT NULL DEFAULT 0`);

        console.log("[DB REPAIR] Database schema repaired successfully!");
    } catch (error: any) {
        console.error("[DB REPAIR] Schema repair failed:", error.message);
        // Don't throw, just log. We don't want to crash the server if repair fails.
    }
}
