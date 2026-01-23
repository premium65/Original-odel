import express from "express";
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";

const router = express.Router();

// Request withdrawal
router.post("/", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check 28 ads requirement
    if (user.adsClicked < 28) {
      return res.status(400).json({ message: "Need 28 ads clicked to withdraw" });
    }

    const { amount, bankFullName, bankAccountNumber, bankName, bankBranch } = req.body;

    if (!amount || amount <= 0 || amount > user.milestoneAmount) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const withdrawal = new Withdrawal({
      userId,
      amount,
      bankFullName,
      bankAccountNumber,
      bankName,
      bankBranch,
      status: "pending"
    });

    await withdrawal.save();

    res.json({ message: "Withdrawal requested", withdrawal });
  } catch (err) {
    console.error("Withdrawal error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get my withdrawals
router.get("/my", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }

    const withdrawals = await Withdrawal.find({ userId }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Get all withdrawals
router.get("/admin/all", async (req, res) => {
  try {
    const userId = req.session?.userId;
    const user = await User.findById(userId);
    if (!user || user.isAdmin !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const withdrawals = await Withdrawal.find()
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Approve withdrawal
router.put("/approve/:id", async (req, res) => {
  try {
    const adminId = req.session?.userId;
    const admin = await User.findById(adminId);
    if (!admin || admin.isAdmin !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    withdrawal.status = "approved";
    withdrawal.processedBy = adminId;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Deduct from user's balance
    await User.findByIdAndUpdate(withdrawal.userId, {
      $inc: { milestoneAmount: -withdrawal.amount }
    });

    res.json({ message: "Withdrawal approved", withdrawal });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Reject withdrawal
router.put("/reject/:id", async (req, res) => {
  try {
    const adminId = req.session?.userId;
    const admin = await User.findById(adminId);
    if (!admin || admin.isAdmin !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { notes } = req.body;
    const withdrawal = await Withdrawal.findByIdAndUpdate(req.params.id, {
      status: "rejected",
      notes,
      processedBy: adminId,
      processedAt: new Date()
    }, { new: true });

    res.json({ message: "Withdrawal rejected", withdrawal });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
