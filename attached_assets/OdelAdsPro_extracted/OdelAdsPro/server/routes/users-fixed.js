import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }
    
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }
    
    const { fullName, mobile, bankName, accountNumber, accountHolderName, branchName } = req.body;
    
    const user = await User.findByIdAndUpdate(userId, {
      fullName,
      mobile,
      bankName,
      accountNumber,
      accountHolderName,
      branchName
    }, { new: true }).select("-password");
    
    res.json(user);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
