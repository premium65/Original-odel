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

// Create ad (JSON body)
router.post("/", async (req, res) => {
  try {
    console.log("[ADMIN/ADS] Create ad - body:", JSON.stringify(req.body));

    const { title, description, type, url, reward, duration, imageUrl, targetUrl, price, isActive } = req.body;

    // Use only basic fields that exist in the database
    const insertData: any = {
      title: title || "New Ad",
      description: description || "",
      type: type || "click",
      url: url || targetUrl || "",
      imageUrl: imageUrl || "",
      targetUrl: targetUrl || url || "",
      price: (price || reward || "0").toString(),
      reward: (reward || price || "0").toString(),
      duration: duration ? Number(duration) : 30,
      isActive: isActive !== false
    };

    console.log("[ADMIN/ADS] Insert data:", JSON.stringify(insertData));

    if (!db) {
      console.error("[ADMIN/ADS] DB is null!");
      return res.status(500).json({ error: "Database not connected" });
    }

    const newAd = await db.insert(ads).values(insertData).returning();
    console.log("[ADMIN/ADS] Ad created with ID:", newAd[0]?.id);
    res.json(newAd[0]);
  } catch (error: any) {
    console.error("[ADMIN/ADS] Create error:", error.message || error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Create ad with image upload (multipart/form-data)
router.post("/upload", upload.single("image"), async (req, res) => {
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
    const { title, description, type, url, reward, duration, isActive, imageUrl, targetUrl, price } = req.body;

    const updateData: any = {};

    // Basic fields only
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (url !== undefined || targetUrl !== undefined) updateData.url = url || targetUrl;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
    if (price !== undefined || reward !== undefined) {
      updateData.price = price || reward;
      updateData.reward = reward || price;
    }
    if (duration !== undefined) updateData.duration = Number(duration);
    if (isActive !== undefined) updateData.isActive = typeof isActive === 'boolean' ? isActive : isActive === "true";

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

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
