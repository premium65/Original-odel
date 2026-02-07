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
    if (!db) {
      // Use in-memory storage
      const { inMemoryAds } = await import("../../memStorage");
      return res.json(inMemoryAds);
    }
    const allAds = await db.select().from(ads).orderBy(desc(ads.createdAt));
    res.json(allAds);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get ad by ID
router.get("/:id", async (req, res) => {
  try {
    if (!db) {
      // Use in-memory storage
      const { inMemoryAds } = await import("../../memStorage");
      const ad = inMemoryAds.find((a: any) => a.id === Number(req.params.id));
      if (!ad) return res.status(404).json({ error: "Ad not found" });
      return res.json(ad);
    }
    const ad = await db.select().from(ads).where(eq(ads.id, Number(req.params.id))).limit(1);
    if (!ad.length) return res.status(404).json({ error: "Ad not found" });
    res.json(ad[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create ad
router.post("/", async (req, res) => {
  try {
    const { 
      title, 
      description, 
      imageUrl, 
      targetUrl, 
      price, 
      reward, 
      type, 
      url, 
      duration,
      isActive,
      currency,
      priceColor,
      features,
      buttonText,
      buttonIcon,
      showOnDashboard,
      displayOrder
    } = req.body;

    // Use the provided values or defaults
    const adData: any = {
      title: title || "",
      description: description || "",
      imageUrl: imageUrl || "",
      targetUrl: targetUrl || url || "",
      price: price?.toString() || reward?.toString() || "0",
      type: type || "click",
      url: url || targetUrl || "",
      reward: reward?.toString() || price?.toString() || "0",
      duration: duration ? Number(duration) : 30,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
    };

    if (!db) {
      // Use in-memory storage
      const { inMemoryAds } = await import("../../memStorage");
      let nextId = 1;
      if (inMemoryAds.length > 0) {
        nextId = Math.max(...inMemoryAds.map((a: any) => a.id)) + 1;
      }
      const newAd = { id: nextId, ...adData };
      inMemoryAds.push(newAd);
      console.log("[CREATE AD] Created ad in memory:", newAd.id);
      return res.json(newAd);
    }

    const newAd = await db.insert(ads).values(adData).returning();
    res.json(newAd[0]);
  } catch (error) {
    console.error("[CREATE AD] Error:", error);
    res.status(500).json({ error: "Server error", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Update ad
router.put("/:id", async (req, res) => {
  try {
    const { 
      title, 
      description, 
      imageUrl, 
      targetUrl, 
      price, 
      reward, 
      type, 
      url, 
      duration, 
      isActive,
      currency,
      priceColor,
      features,
      buttonText,
      buttonIcon,
      showOnDashboard,
      displayOrder
    } = req.body;

    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
    if (url !== undefined) updateData.url = url;
    if (type !== undefined) updateData.type = type;
    if (duration !== undefined) updateData.duration = Number(duration);
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Handle price/reward (they can be the same)
    if (price !== undefined) {
      updateData.price = price.toString();
      if (reward === undefined) updateData.reward = price.toString();
    }
    if (reward !== undefined) {
      updateData.reward = reward.toString();
      if (price === undefined) updateData.price = reward.toString();
    }

    if (!db) {
      // Use in-memory storage
      const { inMemoryAds } = await import("../../memStorage");
      const adIndex = inMemoryAds.findIndex((a: any) => a.id === Number(req.params.id));
      if (adIndex === -1) {
        return res.status(404).json({ error: "Ad not found" });
      }
      inMemoryAds[adIndex] = { ...inMemoryAds[adIndex], ...updateData };
      return res.json(inMemoryAds[adIndex]);
    }

    const updated = await db.update(ads).set(updateData).where(eq(ads.id, Number(req.params.id))).returning();
    
    if (!updated.length) {
      return res.status(404).json({ error: "Ad not found" });
    }
    
    res.json(updated[0]);
  } catch (error) {
    console.error("[UPDATE AD] Error:", error);
    res.status(500).json({ error: "Server error", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Delete ad
router.delete("/:id", async (req, res) => {
  try {
    if (!db) {
      // Use in-memory storage
      const { inMemoryAds } = await import("../../memStorage");
      const adIndex = inMemoryAds.findIndex((a: any) => a.id === Number(req.params.id));
      if (adIndex === -1) {
        return res.status(404).json({ error: "Ad not found" });
      }
      inMemoryAds.splice(adIndex, 1);
      return res.json({ message: "Ad deleted" });
    }
    await db.delete(ads).where(eq(ads.id, Number(req.params.id)));
    res.json({ message: "Ad deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get ad stats
router.get("/:id/stats", async (req, res) => {
  try {
    if (!db) {
      // Return empty stats for in-memory storage
      return res.json({ totalViews: 0, totalRewards: "0" });
    }
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
