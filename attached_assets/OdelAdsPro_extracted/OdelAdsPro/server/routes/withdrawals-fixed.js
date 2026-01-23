import express from "express";
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";

const router = express.Router();

// Minimum ads required to unlock withdrawal
const MIN_ADS_FOR_WITHDRAWAL = 28;

// USER: Request withdrawal
router.post("/", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }
    
    const { amount, bankFullName, bankAccountNumber, bankName, bankBranch } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user has clicked enough ads
    if (user.adsClicked < MIN_ADS_FOR_WITHDRAWAL) {
      return res.status(403).json({ 
        message: `Complete ${MIN_ADS_FOR_WITHDRAWAL} ads to unlock withdrawals. You have completed ${user.adsClicked} ads.` 
      });
    }
    
    // Check if user has enough balance
    if (amount > user.milestoneAmount) {
      return res.status(400).json({ 
        message: `Insufficient balance. You have LKR ${user.milestoneAmount.toFixed(2)} available.` 
      });
    }
    
    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId,
      amount,
      bankFullName,
      bankAccountNumber,
      bankName,
      bankBranch,
    });
    
    await withdrawal.save();
    
    res.json({ message: "Withdrawal request submitted", withdrawal });
  } catch (err) {
    console.error("Request withdrawal error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// USER: Get own withdrawal history
router.get("/my", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }
    
    const withdrawals = await Withdrawal.find({ userId }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error("Get withdrawals error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: Get all withdrawals
router.get("/admin", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate("userId", "fullName email userCode")
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error("Admin get withdrawals error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: Approve withdrawal
router.put("/approve/:id", async (req, res) => {
  try {
    const adminId = req.session?.userId;
    
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Withdrawal already processed" });
    }
    
    // Deduct from user balance
    const user = await User.findById(withdrawal.userId);
    if (user) {
      user.milestoneAmount = Math.max(0, user.milestoneAmount - withdrawal.amount);
      await user.save();
    }
    
    // Update withdrawal status
    withdrawal.status = "approved";
    withdrawal.processedBy = adminId;
    withdrawal.processedAt = new Date();
    await withdrawal.save();
    
    res.json({ message: "Withdrawal approved", withdrawal });
  } catch (err) {
    console.error("Approve withdrawal error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: Reject withdrawal
router.put("/reject/:id", async (req, res) => {
  try {
    const adminId = req.session?.userId;
    const { notes } = req.body;
    
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Withdrawal already processed" });
    }
    
    // Update withdrawal status
    withdrawal.status = "rejected";
    withdrawal.processedBy = adminId;
    withdrawal.processedAt = new Date();
    withdrawal.notes = notes;
    await withdrawal.save();
    
    res.json({ message: "Withdrawal rejected", withdrawal });
  } catch (err) {
    console.error("Reject withdrawal error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export { router as withdrawalRoutes };
