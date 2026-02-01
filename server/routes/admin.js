import express from "express";
import User from "../models/User.js";
import AdClick from "../models/AdClick.js";

const router = express.Router();

const isAdmin = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ message: "Not logged in" });
  next();
};

// Dashboard stats
router.get("/stats", isAdmin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    if (!user || user.isAdmin !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ isApproved: false });
    const totalClicks = await AdClick.countDocuments();
    const totalEarnings = await AdClick.aggregate([
      { $group: { _id: null, total: { $sum: "$earnings" } } }
    ]);

    res.json({
      totalUsers,
      pendingUsers,
      totalClicks,
      totalEarnings: totalEarnings[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users
router.get("/users", isAdmin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    if (!user || user.isAdmin !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get pending users
router.get("/pending", isAdmin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    if (!user || user.isAdmin !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const pending = await User.find({ isApproved: false }).select("-password");
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Approve user
router.put("/approve/:id", isAdmin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const admin = await User.findById(userId);
    if (!admin || admin.isAdmin !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ message: "User approved", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Freeze user
router.put("/freeze/:id", isAdmin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const admin = await User.findById(userId);
    if (!admin || admin.isAdmin !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { isFrozen: true }, { new: true });
    res.json({ message: "User frozen", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
