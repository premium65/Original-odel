import { Router } from "express";
import { db } from "../../db";
import { ads, adViews } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: "./uploads/ads",
  filename: (req, file, cb) => {
    cb(null, `ad-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Get all ads
router.get("/", async (req, res) => {
  try {
    const allAds = await db.select().from(ads).orderBy(desc(ads.createdAt));
    res.json(allAds);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get ad by ID
router.get("/:id", async (req, res) => {
  try {
    const ad = await db.select().from(ads).where(eq(ads.id, Number(req.params.id))).limit(1);
    if (!ad.length) return res.status(404).json({ error: "Ad not found" });
    res.json(ad[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create ad
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, type, url, reward, duration } = req.body;
    const imageUrl = req.file ? `/uploads/ads/${req.file.filename}` : null;

    const newAd = await db.insert(ads).values({
      title, description, type, url, imageUrl, reward, duration: Number(duration)
    }).returning();

    res.json(newAd[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update ad (JSON body)
router.put("/:id", async (req, res) => {
  try {
    const { title, description, type, url, reward, duration, isActive, imageUrl, targetUrl, price, currency, priceColor, features, buttonText, buttonIcon, showOnDashboard, displayOrder } = req.body;

    const updateData: any = {
      title,
      description,
      type,
      url: url || targetUrl,
      reward: reward || price,
      duration: duration ? Number(duration) : undefined,
      isActive: typeof isActive === 'boolean' ? isActive : isActive === "true",
      imageUrl,
      targetUrl,
      currency,
      priceColor,
      features: features ? JSON.stringify(features) : undefined,
      buttonText,
      buttonIcon,
      showOnDashboard: typeof showOnDashboard === 'boolean' ? showOnDashboard : showOnDashboard === "true",
      displayOrder: displayOrder ? Number(displayOrder) : undefined
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updated = await db.update(ads).set(updateData).where(eq(ads.id, Number(req.params.id))).returning();
    if (!updated.length) return res.status(404).json({ error: "Ad not found" });
    res.json(updated[0]);
  } catch (error) {
    console.error("Update ad error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update ad with image (multipart/form-data)
router.put("/:id/upload", upload.single("image"), async (req, res) => {
  try {
    const { title, description, type, url, reward, duration, isActive } = req.body;
    const updateData: any = { title, description, type, url, reward, duration: Number(duration), isActive: isActive === "true" };
    if (req.file) updateData.imageUrl = `/uploads/ads/${req.file.filename}`;

    const updated = await db.update(ads).set(updateData).where(eq(ads.id, Number(req.params.id))).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete ad
router.delete("/:id", async (req, res) => {
  try {
    await db.delete(ads).where(eq(ads.id, Number(req.params.id)));
    res.json({ message: "Ad deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get ad stats
router.get("/:id/stats", async (req, res) => {
  try {
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
