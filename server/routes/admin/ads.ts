import { Router } from "express";
import { db } from "../../db";
import { ads, adViews } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

// Ensure extended ad columns exist (idempotent, runs once)
let columnsEnsured = false;
async function ensureAdColumns() {
  if (columnsEnsured || !db) return;
  try {
    await db.execute(sql`ALTER TABLE ads ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'LKR'`);
    await db.execute(sql`ALTER TABLE ads ADD COLUMN IF NOT EXISTS price_color TEXT DEFAULT '#f59e0b'`);
    await db.execute(sql`ALTER TABLE ads ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'`);
    await db.execute(sql`ALTER TABLE ads ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Add to Cart'`);
    await db.execute(sql`ALTER TABLE ads ADD COLUMN IF NOT EXISTS button_icon TEXT DEFAULT 'shopping-cart'`);
    await db.execute(sql`ALTER TABLE ads ADD COLUMN IF NOT EXISTS button_url TEXT`);
    await db.execute(sql`ALTER TABLE ads ADD COLUMN IF NOT EXISTS show_on_dashboard BOOLEAN DEFAULT TRUE`);
    await db.execute(sql`ALTER TABLE ads ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1`);
    columnsEnsured = true;
  } catch (err) {
    console.error("[ADS] Failed to ensure columns:", err);
  }
}

// Get all ads
router.get("/", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const allAds = await db.select().from(ads).orderBy(desc(ads.createdAt));
    res.json(allAds);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get ad by ID
router.get("/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const ad = await db.select().from(ads).where(eq(ads.id, Number(req.params.id))).limit(1);
    if (!ad.length) return res.status(404).json({ error: "Ad not found" });
    res.json(ad[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create ad (accepts JSON body from client)
router.post("/", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    // Ensure extended columns exist before insert
    await ensureAdColumns();

    const {
      title, description, imageUrl, targetUrl, price, reward,
      type, url, duration, isActive,
      currency, priceColor, features, buttonText, buttonIcon,
      showOnDashboard, displayOrder
    } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });

    // Try full insert with all columns
    try {
      const newAd = await db.insert(ads).values({
        title,
        description: description || "",
        imageUrl: imageUrl || "",
        targetUrl: targetUrl || url || "",
        price: price != null ? String(price) : "0",
        reward: reward != null ? String(reward) : (price != null ? String(price) : "0"),
        type: type || "click",
        url: url || targetUrl || "",
        duration: duration ? Number(duration) : 30,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        currency: currency || "LKR",
        priceColor: priceColor || "#f59e0b",
        features: features || [],
        buttonText: buttonText || "Add to Cart",
        buttonIcon: buttonIcon || "shopping-cart",
        buttonUrl: targetUrl || url || "",
        showOnDashboard: showOnDashboard !== undefined ? Boolean(showOnDashboard) : true,
        displayOrder: displayOrder ? Number(displayOrder) : 1,
      }).returning();
      return res.status(201).json(newAd[0]);
    } catch (fullErr: any) {
      console.error("[ADS] Full insert failed, trying core columns:", fullErr.message);
      // Fallback: insert only core columns that are guaranteed to exist
      const result = await db.execute(sql`
        INSERT INTO ads (title, description, image_url, target_url, price, reward, type, url, duration, is_active)
        VALUES (${title}, ${description || ""}, ${imageUrl || ""}, ${targetUrl || url || ""},
                ${price != null ? Number(price) : 0}, ${reward != null ? Number(reward) : (price != null ? Number(price) : 0)},
                ${type || "click"}, ${url || targetUrl || ""}, ${duration ? Number(duration) : 30},
                ${isActive !== false})
        RETURNING *
      `);
      return res.status(201).json(result.rows?.[0] || { success: true });
    }
  } catch (error: any) {
    console.error("[ADS] Create error:", error);
    res.status(500).json({ error: `Failed to create ad: ${error.message || "Unknown error"}` });
  }
});

// Update ad (accepts JSON body from client)
router.put("/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    await ensureAdColumns();

    const {
      title, description, imageUrl, targetUrl, price, reward,
      type, url, duration, isActive,
      currency, priceColor, features, buttonText, buttonIcon,
      showOnDashboard, displayOrder
    } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
    if (price !== undefined) updateData.price = String(price);
    if (reward !== undefined) updateData.reward = String(reward);
    if (type !== undefined) updateData.type = type;
    if (url !== undefined) updateData.url = url;
    if (duration !== undefined) updateData.duration = Number(duration);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (currency !== undefined) updateData.currency = currency;
    if (priceColor !== undefined) updateData.priceColor = priceColor;
    if (features !== undefined) updateData.features = features;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (buttonIcon !== undefined) updateData.buttonIcon = buttonIcon;
    if (showOnDashboard !== undefined) updateData.showOnDashboard = Boolean(showOnDashboard);
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
    if (targetUrl !== undefined) updateData.buttonUrl = targetUrl;

    const updated = await db.update(ads).set(updateData).where(eq(ads.id, Number(req.params.id))).returning();
    if (!updated.length) return res.status(404).json({ error: "Ad not found" });
    res.json(updated[0]);
  } catch (error: any) {
    console.error("[ADS] Update error:", error);
    res.status(500).json({ error: `Failed to update ad: ${error.message || "Unknown error"}` });
  }
});

// Delete ad
router.delete("/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    await db.delete(ads).where(eq(ads.id, Number(req.params.id)));
    res.json({ message: "Ad deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get ad stats
router.get("/:id/stats", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const stats = await db.select({
      totalViews: sql<number>`count(*)`,
      totalRewards: sql<number>`sum(${adViews.reward})`
    }).from(adViews).where(eq(adViews.adId, Number(req.params.id)));
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
