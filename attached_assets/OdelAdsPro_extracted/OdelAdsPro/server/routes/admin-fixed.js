import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Middleware to check if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    // For now, decode token or use session
    // You can implement JWT verification here
    const userId = req.session?.userId || token;
    
    const user = await User.findById(userId);
    if (!user || user.isAdmin !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Get dashboard stats
router.get("/stats", adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ isApproved: false, isFrozen: false });
    const activeUsers = await User.countDocuments({ isApproved: true, isFrozen: false });
    const frozenUsers = await User.countDocuments({ isFrozen: true });
    
    res.json({
      totalUsers,
      pendingUsers,
      activeUsers,
      frozenUsers,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get pending users
router.get("/pending", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ isApproved: false, isFrozen: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Get pending error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve user
router.put("/approve/:id", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User approved", user });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Freeze user
router.put("/freeze/:id", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isFrozen: true },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User frozen", user });
  } catch (err) {
    console.error("Freeze error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Unfreeze user
router.put("/unfreeze/:id", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isFrozen: false },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User unfrozen", user });
  } catch (err) {
    console.error("Unfreeze error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single user details
router.get("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user
router.put("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const { fullName, email, mobile, destinationAmount, milestoneAmount, milestoneReward } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, mobile, destinationAmount, milestoneAmount, milestoneReward },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User updated", user });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export { router as adminRoutes };
