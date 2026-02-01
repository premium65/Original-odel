import type { Express } from "express";
import { storage } from "./storage";

export function registerPremiumRoutes(app: Express) {
  // Get all premium users (users with milestones)
  app.get("/api/admin/premium-users", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).send("Admin access required");
      }

      // Get all users who have milestone data
      const allUsers = await storage.getAllUsers() as any[];
      const premiumUsers = allUsers.filter(user => user.milestone || user.isRestricted || user.restrictionAdsLimit);

      // Map to the expected format
      const formattedUsers = premiumUsers.map(user => ({
        _id: user.id.toString(),
        username: user.username,
        email: user.email,
        phone: user.mobileNumber || user.phone || "",
        plan: user.plan || "Starter Plan",
        milestone: (user.milestone || user.restrictionAdsLimit) ? {
          adsCountLimit: user.adsLimit || user.restrictionAdsLimit || 0,
          adsClickedCount: user.adsClicked || user.restrictedAdsCompleted || 0,
          depositAmount: parseFloat(user.deposit || user.milestoneAmount || "0"),
          depositPaid: user.depositPaid || false,
          withdrawMilestone: parseFloat(user.pendingAmount || "0"),
          commissionReward: parseFloat(user.commission || user.milestoneReward || "0"),
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

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).send("Admin access required");
      }

      const allUsers = await storage.getAllUsers() as any[];
      const pendingWithdrawals = await storage.getPendingWithdrawals() || [];

      const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.status === "active").length,
        pendingUsers: allUsers.filter(u => u.status === "pending").length,
        totalAdsViewed: allUsers.reduce((sum, u) => sum + (u.totalAdsCompleted || u.adsClicked || 0), 0),
        totalCommission: allUsers.reduce((sum, u) => sum + parseFloat(u.milestoneReward || u.commission || "0"), 0),
        totalWithdraw: allUsers.reduce((sum, u) => sum + parseFloat(u.totalWithdraw || "0"), 0), // totalWithdraw might not exist, but let's keep it safe
        pendingWithdraw: pendingWithdrawals.reduce((sum: number, w: any) => sum + parseFloat(w.amount || "0"), 0),
        totalDeposit: allUsers.reduce((sum, u) => sum + parseFloat(u.balance || "0"), 0),
        activeMilestones: allUsers.filter(u => u.milestoneStatus === "in_progress" || u.restrictionAdsLimit).length,
        premiumUsers: allUsers.filter(u => u.milestone || u.isRestricted || u.restrictionAdsLimit).length,
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

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || !currentUser.isAdmin) {
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

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).send("Admin access required");
      }

      const userId = req.params.userId;
      const { adsCountLimit, depositAmount, withdrawMilestone, commissionReward } = req.body;

      // Update user with milestone data using existing restriction system
      const updatedUser = await storage.setUserRestriction(
        userId,
        adsCountLimit,
        depositAmount.toString(),
        commissionReward.toString()
        // withdrawMilestone is not used in setUserRestriction in this signature, checking storage def
        // storage.ts: setUserRestriction(userId: string, adsLimit: number, deposit: string, commission: string)
      );

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      // Also update milestone status
      await storage.updateUser(userId, { milestoneStatus: "pending" } as any);

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

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).send("Admin access required");
      }

      const userId = req.params.userId;

      // Reset user milestone data
      const updatedUser = await storage.resetUserAds(userId);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      // Update milestone status to reset
      await storage.updateUser(userId, {
        milestoneStatus: "reset",
        depositPaid: false,
        adsClicked: 0
      } as any);

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

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).send("Admin access required");
      }

      const userId = req.params.userId;
      const { points } = req.body;

      await storage.updateUser(userId, { points: points } as any);

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

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).send("Admin access required");
      }

      const userId = req.params.userId;
      const { type } = req.body;

      await storage.updateUser(userId, { treasureType: type } as any);

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

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).send("Admin access required");
      }

      const userId = req.params.userId;
      const { value } = req.body;

      await storage.updateUser(userId, { bookingValue: value } as any);

      res.json({ success: true });
    } catch (error) {
      console.error("Set booking error:", error);
      res.status(500).send("Failed to set booking value");
    }
  });
}
