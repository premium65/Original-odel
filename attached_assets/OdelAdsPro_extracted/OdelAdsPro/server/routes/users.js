import express from "express";
import {
  getAllUsers,
  getUserProfile,
  updateUserStatus
} from "../controllers/userController.js";

import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/admin.js";

const router = express.Router();

// Get all users (Admin only)
router.get("/", adminMiddleware, getAllUsers);

// Get logged-in user profile
router.get("/profile", authMiddleware, getUserProfile);

// Approve / Block user (Admin)
router.put("/status/:id", adminMiddleware, updateUserStatus);

export const userRoutes = router;
