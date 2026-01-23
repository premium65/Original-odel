import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// ------------------------------
// REGISTER USER
// ------------------------------
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, mobile, userCode, password } = req.body;

    if (!fullName || !email || !mobile || !userCode || !password) {
      return res.json({ success: false, message: "All fields required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.json({ success: false, message: "Email already registered" });
    }

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.json({ success: false, message: "Mobile already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      mobile,
      userCode,
      password: hashedPassword,
      destinationAmount: 25000, // FIRST DAY BONUS
      milestoneAmount: 0,
      milestoneReward: 0,
      isApproved: false,
      isFrozen: false,
    });

    await newUser.save();

    return res.json({
      success: true,
      message: "Registration successful. Waiting admin approval.",
    });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: "Server error" });
  }
});

export default router;
