import { Router } from "express";
import { db } from "../../db";
import { settings, siteContent, contacts, slideshow, branding, themeSettings, infoPages } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// ===== SETTINGS =====
router.get("/config", async (req, res) => {
  try {
    const allSettings = await db.select().from(settings);
    const settingsObj = allSettings.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/config", async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await db.insert(settings).values({ key, value: String(value) })
        .onConflictDoUpdate({ target: settings.key, set: { value: String(value), updatedAt: new Date() } });
    }
    res.json({ message: "Settings updated" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Upload dashboard video
router.post("/upload-video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file provided" });
    }

    const videoUrl = `/uploads/${req.file.filename}`;

    // Save video URL to settings
    await db.insert(settings).values({ key: "dashboardVideoUrl", value: videoUrl })
      .onConflictDoUpdate({ target: settings.key, set: { value: videoUrl, updatedAt: new Date() } });

    res.json({ success: true, videoUrl });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== SITE CONTENT =====
router.get("/content/:page", async (req, res) => {
  try {
    const content = await db.select().from(siteContent).where(eq(siteContent.page, req.params.page));
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/content/:page", async (req, res) => {
  try {
    const { section, title, content, metadata } = req.body;
    await db.insert(siteContent).values({ page: req.params.page, section, title, content, metadata })
      .onConflictDoUpdate({ target: [siteContent.page], set: { title, content, metadata, updatedAt: new Date() } });
    res.json({ message: "Content updated" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===== CONTACTS =====
router.get("/contacts", async (req, res) => {
  try {
    const allContacts = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    res.json(allContacts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/contacts/:type", async (req, res) => {
  try {
    const typeContacts = await db.select().from(contacts).where(eq(contacts.type, req.params.type));
    res.json(typeContacts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/contacts", async (req, res) => {
  try {
    const { type, value, label } = req.body;
    const newContact = await db.insert(contacts).values({ type, value, label }).returning();
    res.json(newContact[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/contacts/:id", async (req, res) => {
  try {
    const { value, label, isActive } = req.body;
    const updated = await db.update(contacts).set({ value, label, isActive }).where(eq(contacts.id, Number(req.params.id))).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/contacts/:id", async (req, res) => {
  try {
    await db.delete(contacts).where(eq(contacts.id, Number(req.params.id)));
    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===== SLIDESHOW =====
router.get("/slideshow", async (req, res) => {
  try {
    const slides = await db.select().from(slideshow).orderBy(slideshow.sortOrder);
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/slideshow", upload.single("image"), async (req, res) => {
  try {
    const { title, link, sortOrder } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const newSlide = await db.insert(slideshow).values({ title, imageUrl, link, sortOrder: Number(sortOrder) }).returning();
    res.json(newSlide[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/slideshow/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, link, sortOrder, isActive } = req.body;
    const updateData: any = { title, link, sortOrder: Number(sortOrder), isActive: isActive === "true" };
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;
    const updated = await db.update(slideshow).set(updateData).where(eq(slideshow.id, Number(req.params.id))).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/slideshow/:id", async (req, res) => {
  try {
    await db.delete(slideshow).where(eq(slideshow.id, Number(req.params.id)));
    res.json({ message: "Slide deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===== BRANDING =====
router.get("/branding", async (req, res) => {
  try {
    const brandingData = await db.select().from(branding).limit(1);
    res.json(brandingData[0] || {
      siteName: "OdelADS",
      siteTagline: "Watch & Earn",
      logoUrl: "",
      logoIconUrl: "",
      faviconUrl: "",
      footerText: "",
      copyrightText: ""
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/branding", async (req, res) => {
  try {
    const { siteName, siteTagline, logoUrl, logoIconUrl, faviconUrl, footerText, copyrightText } = req.body;

    // Check if branding record exists
    const existing = await db.select().from(branding).limit(1);

    if (existing.length > 0) {
      // Update existing record
      const updated = await db.update(branding)
        .set({ siteName, siteTagline, logoUrl, logoIconUrl, faviconUrl, footerText, copyrightText, updatedAt: new Date() })
        .where(eq(branding.id, existing[0].id))
        .returning();
      res.json(updated[0]);
    } else {
      // Insert new record
      const newBranding = await db.insert(branding)
        .values({ siteName, siteTagline, logoUrl, logoIconUrl, faviconUrl, footerText, copyrightText })
        .returning();
      res.json(newBranding[0]);
    }
  } catch (error) {
    console.error("[BRANDING] Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== THEME SETTINGS =====
router.get("/theme", async (req, res) => {
  try {
    const themeData = await db.select().from(themeSettings);
    const themeObj: Record<string, any> = {};
    themeData.forEach((t: any) => {
      themeObj[t.key] = { value: t.value, label: t.label, category: t.category };
    });
    res.json(themeObj);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/theme", async (req, res) => {
  try {
    const updates = req.body; // { key: value, key2: value2, ... }
    for (const [key, value] of Object.entries(updates)) {
      await db.insert(themeSettings)
        .values({ key, value: String(value), updatedAt: new Date() })
        .onConflictDoUpdate({ target: themeSettings.key, set: { value: String(value), updatedAt: new Date() } });
    }
    res.json({ message: "Theme settings updated" });
  } catch (error) {
    console.error("[THEME] Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== INFO PAGES (About, Terms, Privacy) =====
router.get("/info-pages", async (req, res) => {
  try {
    const pages = await db.select().from(infoPages);
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/info-pages/:slug", async (req, res) => {
  try {
    const page = await db.select().from(infoPages).where(eq(infoPages.slug, req.params.slug)).limit(1);
    if (page.length === 0) {
      // Return default content for the slug
      return res.json({
        slug: req.params.slug,
        title: req.params.slug.charAt(0).toUpperCase() + req.params.slug.slice(1),
        content: "",
        isActive: true
      });
    }
    res.json(page[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/info-pages/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, isActive } = req.body;

    // Check if page exists
    const existing = await db.select().from(infoPages).where(eq(infoPages.slug, slug)).limit(1);

    if (existing.length > 0) {
      // Update existing page
      const updated = await db.update(infoPages)
        .set({ title, content, isActive, updatedAt: new Date() })
        .where(eq(infoPages.slug, slug))
        .returning();
      res.json(updated[0]);
    } else {
      // Insert new page
      const newPage = await db.insert(infoPages)
        .values({ slug, title, content, isActive: isActive ?? true })
        .returning();
      res.json(newPage[0]);
    }
  } catch (error) {
    console.error("[INFO-PAGES] Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Cleanup fake data
router.delete("/cleanup", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    // Import schema dynamically or use existing imports
    const { users, transactions, milestones, withdrawals, deposits, adViews, premiumPurchases } = await import("@shared/schema");
    const { eq, not } = await import("drizzle-orm");

    console.log("Starting DB cleanup via API...");

    await db.delete(transactions);
    await db.delete(withdrawals);
    await db.delete(deposits);
    await db.delete(milestones);
    await db.delete(adViews);
    await db.delete(premiumPurchases);

    // Delete non-admin users
    await db.delete(users).where(not(eq(users.username, 'admin')));

    // Reset admin
    await db.update(users).set({
      points: 100,
      milestoneAmount: "0.00",
      milestoneReward: "0.00",
      destinationAmount: "0.00",
      totalAdsCompleted: 0,
      restrictionAdsLimit: null,
      restrictionDeposit: null,
      restrictionCommission: null,
      ongoingMilestone: "0.00",
      restrictedAdsCompleted: 0
    }).where(eq(users.username, 'admin'));

    console.log("DB cleanup complete");
    res.json({ message: "Database cleaned successfully" });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({ error: "Cleanup failed" });
  }
});

// Repair DB Schema
router.get("/repair-db", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });

    const { sql } = await import("drizzle-orm");

    console.log("Starting DB Schema Repair...");

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

    console.log("DB Schema Repair Completed");
    res.json({ message: "Database schema repaired successfully" });
  } catch (error: any) {
    console.error("Repair failed:", error);
    res.status(500).json({ error: error.message || "Repair failed" });
  }
});

export default router;
