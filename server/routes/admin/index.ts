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
        if (!req.session.userId) {
            console.log("[ADMIN_AUTH] No userId in session");
            return res.status(401).json({ error: "Not authenticated" });
        }

        // Coerce userId to string for consistent lookups
        const userId = String(req.session.userId);

        // Handle hardcoded admin case
        if (userId === "admin" && (req.session as any).isAdmin) {
            return next();
        }

        // Try PostgreSQL first
        const user = await storage.getUser(userId);
        if (user) {
            if (!user.isAdmin) {
                console.log("[ADMIN_AUTH] User is not admin:", userId);
                return res.status(403).json({ error: "Admin access required" });
            }
            return next();
        }

        // Try MongoDB fallback
        const { isMongoConnected } = await import("../../mongoConnection");
        const { mongoStorage } = await import("../../mongoStorage");
        if (isMongoConnected()) {
            try {
                const mongoUser = await mongoStorage.getUser(userId);
                if (mongoUser) {
                    if (!mongoUser.isAdmin) {
                        console.log("[ADMIN_AUTH] Mongo user is not admin:", userId);
                        return res.status(403).json({ error: "Admin access required" });
                    }
                    return next();
                }
            } catch (err) {
                console.error("[ADMIN_AUTH_MIDDLEWARE] MongoDB error:", err);
            }
        }

        // Try in-memory fallback
        const { inMemoryUsers } = await import("../../memStorage");
        const memUser = inMemoryUsers.find(u => u.id === userId);
        if (memUser) {
            if (!memUser.isAdmin) {
                console.log("[ADMIN_AUTH] In-memory user is not admin:", userId);
                return res.status(403).json({ error: "Admin access required" });
            }
            return next();
        }

        console.log("[ADMIN_AUTH] User not found in any storage:", userId);
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
