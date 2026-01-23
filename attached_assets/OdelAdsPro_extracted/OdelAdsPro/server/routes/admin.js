import express from "express";
import {
  adminDashboardStats,
  approveUser,
  freezeUser
} from "../controllers/adminController.js";

import { adminMiddleware } from "../middleware/admin.js";

const router = express.Router();

// Dashboard stats
router.get("/stats", adminMiddleware, adminDashboardStats);

// Approve new user
router.put("/approve/:id", adminMiddleware, approveUser);

// Freeze user account
router.put("/freeze/:id", adminMiddleware, freezeUser);

export const adminRoutes = router;
