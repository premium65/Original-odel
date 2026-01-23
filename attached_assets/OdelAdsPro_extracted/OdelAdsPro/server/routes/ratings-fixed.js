import express from "express";
import Rating from "../models/Rating.js";
import User from "../models/User.js";

const router = express.Router();

// Get all ratings (public)
router.get("/", async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate("userId", "fullName userCode")
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    console.error("Get ratings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's ratings
router.get("/my", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }
    
    const ratings = await Rating.find({ userId }).sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    console.error("Get my ratings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create rating
router.post("/", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }
    
    const { targetUsername, rating, comment } = req.body;
    
    if (!targetUsername || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating data" });
    }
    
    const ratingDoc = new Rating({
      userId,
      targetUsername,
      rating: parseInt(rating),
      comment: comment || ""
    });
    
    await ratingDoc.save();
    res.json({ message: "Rating created", rating: ratingDoc });
  } catch (err) {
    console.error("Create rating error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete rating (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }
    
    const user = await User.findById(userId);
    if (!user || user.isAdmin !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    await Rating.findByIdAndDelete(req.params.id);
    res.json({ message: "Rating deleted" });
  } catch (err) {
    console.error("Delete rating error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
