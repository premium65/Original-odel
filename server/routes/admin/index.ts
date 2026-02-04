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
        // Normalize session userId - handle both string and number types
        const sessionUserId = req.session.userId ? String(req.session.userId) : null;
        
        if (!sessionUserId) {
            console.warn("[ADMIN_AUTH_MIDDLEWARE] No userId in session");
            return res.status(401).json({ error: "Not authenticated" });
        }

        // Handle hardcoded admin case
        if (sessionUserId === "admin" && (req.session as any).isAdmin) {
            return next();
        }

        // Try PostgreSQL first
        const user = await storage.getUser(sessionUserId);
        if (user) {
            if (!user.isAdmin) {
                console.warn(`[ADMIN_AUTH_MIDDLEWARE] User ${sessionUserId} is not an admin`);
                return res.status(403).json({ error: "Admin access required" });
            }
            return next();
        }

        // Try MongoDB fallback
        const { isMongoConnected } = await import("../../mongoConnection");
        const { mongoStorage } = await import("../../mongoStorage");
        if (isMongoConnected()) {
            try {
                const mongoUser = await mongoStorage.getUser(sessionUserId);
                if (mongoUser) {
                    if (!mongoUser.isAdmin) {
                        console.warn(`[ADMIN_AUTH_MIDDLEWARE] MongoDB user ${sessionUserId} is not an admin`);
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
        const memUser = inMemoryUsers.find(u => u.id === sessionUserId);
        if (memUser) {
            if (!memUser.isAdmin) {
                console.warn(`[ADMIN_AUTH_MIDDLEWARE] In-memory user ${sessionUserId} is not an admin`);
                return res.status(403).json({ error: "Admin access required" });
            }
            return next();
        }

        console.warn(`[ADMIN_AUTH_MIDDLEWARE] User ${sessionUserId} not found in any storage`);
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
