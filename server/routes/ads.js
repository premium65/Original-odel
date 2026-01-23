import express from "express";
import Ad from "../models/Ad.js";
import AdClick from "../models/AdClick.js";
import User from "../models/User.js";

const router = express.Router();

// Get all ads with user's click status
router.get("/", async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true });
    
    // If user logged in, add last click info
    if (req.session?.userId) {
      const userId = req.session.userId;
      const enrichedAds = await Promise.all(ads.map(async (ad) => {
        const lastClick = await AdClick.findOne({ userId, adId: ad._id }).sort({ clickedAt: -1 });
        const canClickNow = !lastClick || (Date.now() - lastClick.clickedAt > 24 * 60 * 60 * 1000);
        return { ...ad.toObject(), lastClick, canClickNow };
      }));
      return res.json(enrichedAds);
    }

    res.json(ads);
  } catch (err) {
    console.error("Get ads error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Click ad and earn
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

    // Check 24-hour cooldown
    const lastClick = await AdClick.findOne({ userId, adId: ad._id }).sort({ clickedAt: -1 });
    if (lastClick && Date.now() - lastClick.clickedAt < 24 * 60 * 60 * 1000) {
      const timeLeft = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - lastClick.clickedAt)) / 1000 / 60);
      return res.status(400).json({ message: `Please wait ${timeLeft} minutes` });
    }

    // Record click
    const click = new AdClick({ userId, adId: ad._id, earnings: ad.price });
    await click.save();

    // Update user earnings
    const user = await User.findById(userId);
    const isFirstClick = user.adsClicked === 0;

    user.milestoneAmount += ad.price;
    user.milestoneReward += ad.price;
    user.adsClicked += 1;
    
    if (isFirstClick) {
      user.destinationAmount = 0; // Reset after first ad
    }

    user.lastAdClick = new Date();
    await user.save();

    res.json({
      message: "Ad clicked successfully",
      earned: ad.price,
      totalBalance: user.milestoneAmount,
      adsCompleted: user.adsClicked
    });
  } catch (err) {
    console.error("Click ad error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
