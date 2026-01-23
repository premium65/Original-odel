import express from "express";
import {
  requestWithdrawal,
  getUserWithdrawals,
  adminGetWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
} from "../controllers/withdrawController.js";

import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/admin.js";

const router = express.Router();

// User requests withdrawal
router.post("/", authMiddleware, requestWithdrawal);

// User views history
router.get("/", authMiddleware, getUserWithdrawals);

// Admin views all requests
router.get("/admin", adminMiddleware, adminGetWithdrawals);

// Admin approve/reject
router.put("/approve/:id", adminMiddleware, approveWithdrawal);
router.put("/reject/:id", adminMiddleware, rejectWithdrawal);

export const withdrawalRoutes = router;
