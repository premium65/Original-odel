import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

// =========================
// 🔥 Test Route
// =========================
router.get("/test", (req, res) => {
  res.send("Auth route working!");
});

// Helper to generate user code like ODA123456
function generateUserCode() {
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `ODA${random}`;
}

// =========================
// 📝 Register User
// =========================
router.post("/register", async (req, res) => {
  try {
    console.log("➡️ Incoming body:", req.body);

    const { fullName, email, mobile, password } = req.body;

    // Basic validation
    if (!fullName || !email || !mobile || !password) {
      return res
        .status(400)
        .json({ message: "fullName, email, mobile and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user code
    const userCode = generateUserCode();

    // Create user with ALL required fields
    const user = new User({
      fullName,
      email,
      mobile,
      userCode,
      password: hashedPassword,
    });

    await user.save();

    console.log("✅ User saved:", user._id, userCode);

    return res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      userCode,
    });
  } catch (error) {
    console.error("❌ Register Error:", error);

    // If it’s a validation error, show it clearly
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: error.errors,
      });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// =========================
// 🔑 Login User
// =========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return res.json({
      message: "Login successful",
      userId: user._id,
      userCode: user.userCode,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
