import { Router, Request, Response, NextFunction } from "express";
import dashboardRoutes from "./dashboard";
import usersRoutes from "./users";
import transactionsRoutes from "./transactions";
import adsRoutes from "./ads";
import settingsRoutes from "./settings";
import authRoutes from "./auth";
import premiumRoutes from "./premium";
import { storage } from "../../storage";

// Admin authentication middleware
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        console.log("[ADMIN_AUTH] Checking authentication for:", req.path);
        console.log("[ADMIN_AUTH] Session data:", { userId: req.session.userId, isAdmin: req.session.isAdmin });
        
        // Normalize userId to string (may arrive as number from MongoDB or other session stores)
        const rawUserId = req.session.userId;
        if (!rawUserId) {
            console.log("[ADMIN_AUTH] FAILED: No userId in session");
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = String(rawUserId);
        console.log("[ADMIN_AUTH] UserId from session:", userId);

        // Handle hardcoded admin case
        if (userId === "admin" && req.session.isAdmin) {
            console.log("[ADMIN_AUTH] SUCCESS: Hardcoded admin user");
            return next();
        }

        // Try PostgreSQL first
        console.log("[ADMIN_AUTH] Checking PostgreSQL for user:", userId);
        const user = await storage.getUser(userId);
        if (user) {
            console.log("[ADMIN_AUTH] User found in PostgreSQL, isAdmin:", user.isAdmin);
            if (!user.isAdmin) {
                console.log("[ADMIN_AUTH] FAILED: User is not admin (PostgreSQL)");
                return res.status(403).json({ error: "Admin access required" });
            }
            console.log("[ADMIN_AUTH] SUCCESS: Admin user (PostgreSQL)");
            return next();
        }

        // Try MongoDB fallback
        console.log("[ADMIN_AUTH] User not found in PostgreSQL, trying MongoDB");
        const { isMongoConnected } = await import("../../mongoConnection");
        const { mongoStorage } = await import("../../mongoStorage");
        if (isMongoConnected()) {
            try {
                const mongoUser = await mongoStorage.getUser(userId);
                if (mongoUser) {
                    console.log("[ADMIN_AUTH] User found in MongoDB, isAdmin:", mongoUser.isAdmin);
                    if (!mongoUser.isAdmin) {
                        console.log("[ADMIN_AUTH] FAILED: User is not admin (MongoDB)");
                        return res.status(403).json({ error: "Admin access required" });
                    }
                    console.log("[ADMIN_AUTH] SUCCESS: Admin user (MongoDB)");
                    return next();
                }
            } catch (err) {
                console.error("[ADMIN_AUTH_MIDDLEWARE] MongoDB error:", err);
            }
        }

        // Try in-memory fallback
        console.log("[ADMIN_AUTH] User not found in MongoDB, trying in-memory");
        const { inMemoryUsers } = await import("../../memStorage");
        const memUser = inMemoryUsers.find(u => u.id === userId);
        if (memUser) {
            console.log("[ADMIN_AUTH] User found in memory, isAdmin:", memUser.isAdmin);
            if (!memUser.isAdmin) {
                console.log("[ADMIN_AUTH] FAILED: User is not admin (in-memory)");
                return res.status(403).json({ error: "Admin access required" });
            }
            console.log("[ADMIN_AUTH] SUCCESS: Admin user (in-memory)");
            return next();
        }

        console.log("[ADMIN_AUTH] FAILED: User not found in any storage");
        return res.status(403).json({ error: "Admin access required" });
    } catch (error) {
        console.error("[ADMIN_AUTH_MIDDLEWARE] Error:", error);
        return res.status(500).json({ error: "Authentication error" });
    }
}

export function registerAdminRoutes(app: Router) {
    const router = Router();

    // Auth routes (login/logout/me) do NOT require admin middleware
    router.use("/admin/auth", authRoutes);

    // All other admin routes require authentication
    router.use("/admin/dashboard", requireAdmin, dashboardRoutes);
    router.use("/admin/users", requireAdmin, usersRoutes);
    router.use("/admin/transactions", requireAdmin, transactionsRoutes);
    router.use("/admin/ads", requireAdmin, adsRoutes);
    router.use("/admin/settings", requireAdmin, settingsRoutes);
    router.use("/admin/premium", requireAdmin, premiumRoutes);

    app.use("/api", router);
}
