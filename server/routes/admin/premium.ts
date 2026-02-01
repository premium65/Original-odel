
import { Router } from "express";
import { storage } from "../../storage";

const router = Router();

// Get all premium purchases
router.get("/purchases", async (req, res) => {
    try {
        // Check admin auth - reusing middleware logic or simple check if applied globally to /admin
        // Assuming the parent router checks auth or we check here.
        // Most other admin routes check individually or rely on session.

        if (!req.session.userId) {
            return res.status(401).send("Not authenticated");
        }

        const user = await storage.getUser(req.session.userId);
        if (!user || !user.isAdmin) {
            return res.status(403).send("Admin access required");
        }

        const purchases = await storage.getAllPremiumPurchases();
        res.json(purchases);
    } catch (error) {
        console.error("Fetch premium purchases error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
