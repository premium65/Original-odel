import express from "express";
import {
  rateAd,
  getUserRatings,
  adminGetRatings
} from "../controllers/ratingController.js";

import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/admin.js";

const router = express.Router();

// User submits rating for an ad
router.post("/", authMiddleware, rateAd);

// User views own rating history
router.get("/", authMiddleware, getUserRatings);

// Admin gets all ratings
router.get("/admin", adminMiddleware, adminGetRatings);

export const ratingRoutes = router;
