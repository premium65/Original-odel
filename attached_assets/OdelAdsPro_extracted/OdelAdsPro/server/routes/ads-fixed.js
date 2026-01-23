import express from "express";
import Ad from "../models/Ad.js";
import AdClick from "../models/AdClick.js";
import User from "../models/User.js";

const router = express.Router();

// Helper to generate ad code
function generateAdCode() {
  const count = Math.floor(Math.random() * 9000) + 1000;
  return `AD-${count}`;
}

// Get all ads (for users)
router.get("/", async (req, res) => {
  try {
    const userId = req.session?.userId;
    const ads = await Ad.find({ isActive: true }).sort({ createdAt: -1 });
    
    // If user is logged in, add their click info
    if (userId) {
      const clicks = await AdClick.find({ userId }).sort({ clickedAt: -1 });
      const clickMap = new Map();
      
      clicks.forEach(click => {
        const adId = click.adId.toString();
        if (!clickMap.has(adId)) {
          clickMap.set(adId, click.clickedAt);
        }
      });
      
      const adsWithClicks = ads.map(ad => ({
        ...ad.toObject(),
        id: ad._id,
        lastClickedAt: clickMap.get(ad._id.toString()) || null,
      }));
      
      return res.json(adsWithClicks);
    }
    
    res.json(ads);
  } catch (err) {
    console.error("Get ads error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Click an ad (earn money)
router.post("/click/:id", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }
    
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check 24-hour cooldown for this specific ad
    const lastClick = await AdClick.findOne({ 
      userId, 
      adId: ad._id 
    }).sort({ clickedAt: -1 });
    
    if (lastClick) {
      const hoursSinceClick = (Date.now() - lastClick.clickedAt) / (1000 * 60 * 60);
      if (hoursSinceClick < 24) {
        const hoursLeft = Math.ceil(24 - hoursSinceClick);
        return res.status(403).json({ 
          message: `Please wait ${hoursLeft} hours before clicking this ad again` 
        });
      }
    }
    
    // Record the click
    const click = new AdClick({
      userId,
      adId: ad._id,
      earnings: ad.price,
    });
    await click.save();
    
    // Update user earnings
    const isFirstAd = user.adsClicked === 0;
    
    // If first ad, reset destination amount to 0
    if (isFirstAd) {
      user.destinationAmount = 0;
    }
    
    // Add to milestone amount (withdrawable) and milestone reward (total)
    user.milestoneAmount = (user.milestoneAmount || 0) + ad.price;
    user.milestoneReward = (user.milestoneReward || 0) + ad.price;
    user.adsClicked = (user.adsClicked || 0) + 1;
    user.lastAdClick = new Date();
    
    await user.save();
    
    res.json({
      message: "Ad clicked successfully!",
      earnings: ad.price,
      totalAdsClicked: user.adsClicked,
      milestoneAmount: user.milestoneAmount,
      milestoneReward: user.milestoneReward,
    });
  } catch (err) {
    console.error("Click ad error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: Get all ads
router.get("/admin/all", async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    console.error("Admin get ads error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: Create new ad
router.post("/", async (req, res) => {
  try {
    const { title, description, link, imageUrl, price, duration } = req.body;
    
    const ad = new Ad({
      adCode: generateAdCode(),
      title,
      description,
      link: link || "https://example.com",
      imageUrl,
      price: price || 101.75,
      duration: duration || 10,
    });
    
    await ad.save();
    res.json({ message: "Ad created", ad });
  } catch (err) {
    console.error("Create ad error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: Update ad
router.put("/:id", async (req, res) => {
  try {
    const { title, description, link, imageUrl, price, duration, isActive } = req.body;
    
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      { title, description, link, imageUrl, price, duration, isActive },
      { new: true }
    );
    
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    res.json({ message: "Ad updated", ad });
  } catch (err) {
    console.error("Update ad error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: Delete ad
router.delete("/:id", async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    res.json({ message: "Ad deleted" });
  } catch (err) {
    console.error("Delete ad error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
