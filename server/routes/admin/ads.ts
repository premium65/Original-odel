import { Router } from "express";
import { db } from "../../db";
import { ads, adViews } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

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
    const {
      title, description, imageUrl, targetUrl, price, reward,
      type, url, duration, isActive,
      currency, priceColor, features, buttonText, buttonIcon,
      showOnDashboard, displayOrder
    } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });

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

    res.status(201).json(newAd[0]);
  } catch (error) {
    console.error("[ADS] Create error:", error);
    res.status(500).json({ error: "Failed to create ad" });
  }
});

// Update ad (accepts JSON body from client)
router.put("/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
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
    // Also set buttonUrl from targetUrl if provided
    if (targetUrl !== undefined) updateData.buttonUrl = targetUrl;

    const updated = await db.update(ads).set(updateData).where(eq(ads.id, Number(req.params.id))).returning();
    if (!updated.length) return res.status(404).json({ error: "Ad not found" });
    res.json(updated[0]);
  } catch (error) {
    console.error("[ADS] Update error:", error);
    res.status(500).json({ error: "Failed to update ad" });
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
