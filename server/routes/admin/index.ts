import { Router } from "express";
import dashboardRoutes from "./dashboard";
import usersRoutes from "./users";
import transactionsRoutes from "./transactions";
import adsRoutes from "./ads";
import settingsRoutes from "./settings";
import authRoutes from "./auth";

export function registerAdminRoutes(app: Router) {
    const router = Router();

    // Mount routes under /admin prefix
    router.use("/admin/dashboard", dashboardRoutes);
    router.use("/admin/users", usersRoutes);
    router.use("/admin/transactions", transactionsRoutes);
    router.use("/admin/ads", adsRoutes);
    router.use("/admin/settings", settingsRoutes);
    router.use("/admin/auth", authRoutes);

    app.use("/api", router);
}
