import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, fullName, mobileNumber } = req.body;
    
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: "Email or username already exists" });
    }

    const user = new User({
      username,
      email,
      password,
      fullName,
      mobileNumber,
      destinationAmount: 25000,
      isApproved: false
    });

    await user.save();

    req.session.userId = user._id;
    res.json({ message: "Registered successfully", userId: user._id, isApproved: false });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: "Account pending approval" });
    }

    if (user.isFrozen) {
      return res.status(403).json({ message: "Account frozen" });
    }

    req.session.userId = user._id;
    res.json({ message: "Logged in", userId: user._id, isAdmin: user.isAdmin });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});

export default router;
