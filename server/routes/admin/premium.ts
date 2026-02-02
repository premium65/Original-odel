
import { Router } from "express";
import { storage } from "../../storage";

const router = Router();

// Middleware to check admin auth
async function checkAdmin(req: any, res: any, next: any) {
    if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
        return res.status(403).send("Admin access required");
    }
    req.adminUser = user;
    next();
}

// Get all premium plans
router.get("/plans", checkAdmin, async (req, res) => {
    try {
        const plans = await storage.getAllPremiumPlans();
        res.json(plans);
    } catch (error) {
        console.error("Fetch premium plans error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get single premium plan
router.get("/plans/:id", checkAdmin, async (req, res) => {
    try {
        const plan = await storage.getPremiumPlan(parseInt(req.params.id));
        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }
        res.json(plan);
    } catch (error) {
        console.error("Fetch premium plan error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Create premium plan
router.post("/plans", checkAdmin, async (req, res) => {
    try {
        const plan = await storage.createPremiumPlan(req.body);
        res.json(plan);
    } catch (error) {
        console.error("Create premium plan error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Update premium plan
router.put("/plans/:id", checkAdmin, async (req, res) => {
    try {
        const plan = await storage.updatePremiumPlan(parseInt(req.params.id), req.body);
        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }
        res.json(plan);
    } catch (error) {
        console.error("Update premium plan error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete premium plan
router.delete("/plans/:id", checkAdmin, async (req, res) => {
    try {
        await storage.deletePremiumPlan(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error) {
        console.error("Delete premium plan error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all premium purchases
router.get("/purchases", checkAdmin, async (req, res) => {
    try {
        const purchases = await storage.getAllPremiumPurchases();
        res.json(purchases);
    } catch (error) {
        console.error("Fetch premium purchases error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
