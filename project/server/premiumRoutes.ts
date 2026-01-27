import type { Express } from "express";
import { storage } from "./storage";

// Helper to get numeric userId for PostgreSQL storage
function getNumericUserId(sessionUserId: string | undefined): number | undefined {
  if (!sessionUserId) return undefined;
  const num = Number(sessionUserId);
  return isNaN(num) ? undefined : num;
}

export function registerPremiumRoutes(app: Express) {
  // Get all premium users (users with milestones)
  app.get("/api/admin/premium-users", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(getNumericUserId(req.session.userId)!);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      // Get all users who have milestone data
      const allUsers = await storage.getAllUsers();
      const premiumUsers = allUsers.filter(user => user.milestone || user.isRestricted);
      
      // Map to the expected format
      const formattedUsers = premiumUsers.map(user => ({
        _id: user.id.toString(),
        username: user.username,
        email: user.email,
        phone: user.phone || "",
        plan: user.plan || "Starter Plan",
        milestone: user.milestone ? {
          adsCountLimit: user.adsLimit || 0,
          adsClickedCount: user.adsClicked || 0,
          depositAmount: parseFloat(user.deposit || "0"),
          depositPaid: user.depositPaid || false,
          withdrawMilestone: parseFloat(user.pendingAmount || "0"),
          commissionReward: parseFloat(user.commission || "0"),
          milestoneStatus: user.milestoneStatus || "pending"
        } : null,
        points: user.points || 0,
        treasureType: user.treasureType || "normal",
        bookingValue: user.bookingValue || 0,
        bankDetails: {
          bankName: user.bankName || "",
          accountNo: user.accountNumber || "",
          branch: user.branchName || ""
        }
      }));

      res.json(formattedUsers);
    } catch (error) {
      console.error("Get premium users error:", error);
      res.status(500).send("Failed to get premium users");
    }
  });

  // Get dashboard stats
  app.get("/api/admin/dashboard/stats", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(getNumericUserId(req.session.userId)!);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const allUsers = await storage.getAllUsers();
      const pendingWithdrawals = await storage.getPendingWithdrawals?.() || [];

      const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.status === "active").length,
        pendingUsers: allUsers.filter(u => u.status === "pending").length,
        totalAdsViewed: allUsers.reduce((sum, u) => sum + (u.adsClicked || 0), 0),
        totalCommission: allUsers.reduce((sum, u) => sum + parseFloat(u.commission || "0"), 0),
        totalWithdraw: allUsers.reduce((sum, u) => sum + parseFloat(u.totalWithdraw || "0"), 0),
        pendingWithdraw: pendingWithdrawals.reduce((sum: number, w: any) => sum + parseFloat(w.amount || "0"), 0),
        totalDeposit: allUsers.reduce((sum, u) => sum + parseFloat(u.balance || "0"), 0),
        activeMilestones: allUsers.filter(u => u.milestoneStatus === "in_progress").length,
        premiumUsers: allUsers.filter(u => u.milestone || u.isRestricted).length,
        pendingWithdrawals: pendingWithdrawals.length
      };

      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).send("Failed to get dashboard stats");
    }
  });

  // Get recent users
  app.get("/api/admin/users/recent", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(getNumericUserId(req.session.userId)!);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const allUsers = await storage.getAllUsers();
      // Sort by createdAt descending and take first 5
      const recentUsers = allUsers
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5)
        .map(u => ({
          _id: u.id.toString(),
          username: u.username,
          email: u.email,
          status: u.status,
          balance: parseFloat(u.balance || "0"),
          createdAt: u.createdAt
        }));

      res.json(recentUsers);
    } catch (error) {
      console.error("Get recent users error:", error);
      res.status(500).send("Failed to get recent users");
    }
  });

  // Create milestone for user
  app.post("/api/admin/users/:userId/milestone", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(getNumericUserId(req.session.userId)!);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
      const { adsCountLimit, depositAmount, withdrawMilestone, commissionReward } = req.body;

      // Update user with milestone data using existing restriction system
      const updatedUser = await storage.setUserRestriction(
        userId,
        adsCountLimit,
        depositAmount.toString(),
        commissionReward.toString(),
        withdrawMilestone.toString()
      );

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      // Also update milestone status
      await storage.updateUser?.(userId, { milestoneStatus: "pending" });

      res.json({ success: true });
    } catch (error) {
      console.error("Create milestone error:", error);
      res.status(500).send("Failed to create milestone");
    }
  });

  // Reset milestone for user
  app.post("/api/admin/users/:userId/milestone/reset", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(getNumericUserId(req.session.userId)!);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);

      // Reset user milestone data
      const updatedUser = await storage.resetUserAds(userId);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      // Update milestone status to reset
      await storage.updateUser?.(userId, { 
        milestoneStatus: "reset",
        depositPaid: false,
        adsClicked: 0
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Reset milestone error:", error);
      res.status(500).send("Failed to reset milestone");
    }
  });

  // Set user points
  app.post("/api/admin/users/:userId/points", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(getNumericUserId(req.session.userId)!);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
      const { points } = req.body;

      await storage.updateUser?.(userId, { points: points });

      res.json({ success: true });
    } catch (error) {
      console.error("Set points error:", error);
      res.status(500).send("Failed to set points");
    }
  });

  // Set user treasure type
  app.post("/api/admin/users/:userId/treasure", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(getNumericUserId(req.session.userId)!);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
      const { type } = req.body;

      await storage.updateUser?.(userId, { treasureType: type });

      res.json({ success: true });
    } catch (error) {
      console.error("Set treasure error:", error);
      res.status(500).send("Failed to set treasure type");
    }
  });

  // Set booking value
  app.post("/api/admin/users/:userId/booking", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(getNumericUserId(req.session.userId)!);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
      const { value } = req.body;

      await storage.updateUser?.(userId, { bookingValue: value });

      res.json({ success: true });
    } catch (error) {
      console.error("Set booking error:", error);
      res.status(500).send("Failed to set booking value");
    }
  });
}
