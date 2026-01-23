// routes/ads.js

import express from "express";
import { 
    getAds, 
    createAd, 
    updateAd, 
    deleteAd 
} from "../controllers/adsController.js";

import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/admin.js";

const router = express.Router();

/**
 * USER — Fetch all ads
 */
router.get("/", authMiddleware, getAds);

/**
 * ADMIN — Create new ad
 */
router.post("/", adminMiddleware, createAd);

/**
 * ADMIN — Update an ad
 */
router.put("/:id", adminMiddleware, updateAd);

/**
 * ADMIN — Delete ad
 */
router.delete("/:id", adminMiddleware, deleteAd);

export default router;
