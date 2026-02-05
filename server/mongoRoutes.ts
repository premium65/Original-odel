import type { Express } from "express";
import { mongoStorage } from "./mongoStorage";
import bcrypt from "bcrypt";

export function registerMongoRoutes(app: Express) {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, fullName, mobileNumber } = req.body;

      // Check if username already exists
      const existingUsername = await mongoStorage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).send("Username already exists");
      }

      // Check if email already exists
      const existingEmail = await mongoStorage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).send("Email already exists");
      }

      const user = await mongoStorage.createUser({
        username,
        email,
        password,
        fullName,
        mobileNumber,
      });

      res.json({ message: "Registration successful. Please wait for admin approval.", user: { id: user._id, username: user.username } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).send("Registration failed");
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Try to find by username or email
      let user = await mongoStorage.getUserByUsername(username);
      if (!user) {
        user = await mongoStorage.getUserByEmail(username);
      }

      if (!user) {
        return res.status(401).send("Invalid credentials");
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).send("Invalid credentials");
      }

      if (user.status === "pending") {
        return res.status(403).send("Account pending approval");
      }

      if (user.status === "frozen") {
        return res.status(403).send("Account has been frozen");
      }

      req.session.userId = user._id.toString();
      req.session.isAdmin = user.isAdmin;

      res.json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          isAdmin: user.isAdmin,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send("Login failed");
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Logout failed");
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const user = await mongoStorage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        status: user.status,
        isAdmin: user.isAdmin,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        accountHolderName: user.accountHolderName,
        branchName: user.branchName,
        destinationAmount: user.destinationAmount,
        milestoneAmount: user.milestoneAmount,
        milestoneReward: user.milestoneReward,
        totalAdsCompleted: user.totalAdsCompleted,
        restrictionAdsLimit: user.restrictionAdsLimit,
        restrictionDeposit: user.restrictionDeposit,
        restrictionCommission: user.restrictionCommission,
        ongoingMilestone: user.ongoingMilestone,
        restrictedAdsCompleted: user.restrictedAdsCompleted,
        points: user.points,
        registeredAt: user.registeredAt,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).send("Failed to get user");
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const users = await mongoStorage.getAllUsers();
      res.json(users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        status: user.status,
        isAdmin: user.isAdmin,
        registeredAt: user.registeredAt,
        destinationAmount: user.destinationAmount,
        milestoneAmount: user.milestoneAmount,
        milestoneReward: user.milestoneReward,
        totalAdsCompleted: user.totalAdsCompleted,
        points: user.points,
      })));
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).send("Failed to get users");
    }
  });

  app.get("/api/admin/pending", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const users = await mongoStorage.getPendingUsers();
      res.json(users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        status: user.status,
        registeredAt: user.registeredAt,
      })));
    } catch (error) {
      console.error("Get pending users error:", error);
      res.status(500).send("Failed to get pending users");
    }
  });

  app.post("/api/admin/approve/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const user = await mongoStorage.approveUser(req.params.id);
      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json({ message: "User approved", user: { id: user._id, status: user.status } });
    } catch (error) {
      console.error("Approve user error:", error);
      res.status(500).send("Failed to approve user");
    }
  });

  app.post("/api/admin/freeze/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const user = await mongoStorage.freezeUser(req.params.id);
      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json({ message: "User frozen", user: { id: user._id, status: user.status } });
    } catch (error) {
      console.error("Freeze user error:", error);
      res.status(500).send("Failed to freeze user");
    }
  });

  app.get("/api/admin/users/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const user = await mongoStorage.getUser(req.params.id);
      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        status: user.status,
        isAdmin: user.isAdmin,
        registeredAt: user.registeredAt,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        accountHolderName: user.accountHolderName,
        branchName: user.branchName,
        destinationAmount: user.destinationAmount,
        milestoneAmount: user.milestoneAmount,
        milestoneReward: user.milestoneReward,
        totalAdsCompleted: user.totalAdsCompleted,
        restrictionAdsLimit: user.restrictionAdsLimit,
        restrictionDeposit: user.restrictionDeposit,
        restrictionCommission: user.restrictionCommission,
        ongoingMilestone: user.ongoingMilestone,
        restrictedAdsCompleted: user.restrictedAdsCompleted,
        points: user.points,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).send("Failed to get user");
    }
  });

  app.patch("/api/admin/users/:userId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const { fullName, email, mobileNumber, status } = req.body;
      const user = await mongoStorage.updateUser(req.params.userId, {
        fullName,
        email,
        mobileNumber,
        status,
      });

      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).send("Failed to update user");
    }
  });

  app.patch("/api/admin/users/:userId/bank", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const user = await mongoStorage.updateUserBankDetails(req.params.userId, req.body);
      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json(user);
    } catch (error) {
      console.error("Update bank details error:", error);
      res.status(500).send("Failed to update bank details");
    }
  });

  app.post("/api/admin/users/:userId/restriction", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const user = await mongoStorage.setUserRestriction(req.params.userId, req.body);
      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json(user);
    } catch (error) {
      console.error("Set restriction error:", error);
      res.status(500).send("Failed to set restriction");
    }
  });

  app.delete("/api/admin/users/:userId/restriction", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const user = await mongoStorage.removeUserRestriction(req.params.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json(user);
    } catch (error) {
      console.error("Remove restriction error:", error);
      res.status(500).send("Failed to remove restriction");
    }
  });

  app.post("/api/admin/users/:userId/reset", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const { field } = req.body;
      const user = await mongoStorage.resetUserField(req.params.userId, field);
      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json(user);
    } catch (error: any) {
      console.error("Reset field error:", error);
      res.status(500).send(error.message || "Failed to reset field");
    }
  });

  app.post("/api/admin/users/:userId/add-value", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const { field, amount } = req.body;
      const user = await mongoStorage.addUserFieldValue(req.params.userId, field, amount);
      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json(user);
    } catch (error: any) {
      console.error("Add value error:", error);
      res.status(500).send(error.message || "Failed to add value");
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Failed to logout");
      }
      res.clearCookie("connect.sid");
      res.sendStatus(200);
    });
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Failed to logout");
      }
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });

  // Ads routes
  app.get("/api/ads", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const ads = await mongoStorage.getAdsWithUserClicks(req.session.userId);
      res.json(ads);
    } catch (error) {
      console.error("Get ads error:", error);
      res.status(500).send("Failed to get ads");
    }
  });

  app.get("/api/admin/ads", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const ads = await mongoStorage.getAllAds();
      res.json(ads.map(ad => ({ ...ad.toObject(), id: ad._id })));
    } catch (error) {
      console.error("Get ads error:", error);
      res.status(500).send("Failed to get ads");
    }
  });

  app.post("/api/admin/ads", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const ad = await mongoStorage.createAd(req.body);
      res.json({ ...ad.toObject(), id: ad._id });
    } catch (error) {
      console.error("Create ad error:", error);
      res.status(500).send("Failed to create ad");
    }
  });

  app.patch("/api/admin/ads/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const ad = await mongoStorage.updateAd(req.params.id, req.body);
      if (!ad) {
        return res.status(404).send("Ad not found");
      }

      res.json({ ...ad.toObject(), id: ad._id });
    } catch (error) {
      console.error("Update ad error:", error);
      res.status(500).send("Failed to update ad");
    }
  });

  app.delete("/api/admin/ads/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const deleted = await mongoStorage.deleteAd(req.params.id);
      if (!deleted) {
        return res.status(404).send("Ad not found");
      }

      res.json({ message: "Ad deleted" });
    } catch (error) {
      console.error("Delete ad error:", error);
      res.status(500).send("Failed to delete ad");
    }
  });

  // Ad click
  app.post("/api/ads/click", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const { adId } = req.body;
      if (!adId) {
        return res.status(400).send("Ad ID is required");
      }

      const ad = await mongoStorage.getAd(adId);
      if (!ad) {
        return res.status(404).send("Ad not found");
      }

      const user = await mongoStorage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Check if user has an active restriction
      if (user.restrictionAdsLimit !== null && user.restrictionAdsLimit !== undefined) {
        if (user.restrictedAdsCompleted >= user.restrictionAdsLimit) {
          return res.status(403).json({
            error: "restriction_limit_reached",
            message: `You have reached the maximum of ${user.restrictionAdsLimit} ads allowed under restriction.`
          });
        }

        // Under restriction: commission goes to Milestone Reward only
        const commission = user.restrictionCommission || ad.price;

        // Record click
        const click = await mongoStorage.recordAdClick(req.session.userId, adId, commission);

        // Increment restricted ads counter
        await mongoStorage.incrementRestrictedAds(req.session.userId);

        await mongoStorage.addMilestoneReward(req.session.userId, commission);

        // Update ongoing milestone
        const currentOngoing = parseFloat(user.ongoingMilestone || "0");
        const commissionValue = parseFloat(commission);
        const newOngoing = Math.max(0, currentOngoing - commissionValue);
        await mongoStorage.resetUserField(req.session.userId, "ongoingMilestone");
        if (newOngoing > 0) {
          await mongoStorage.addUserFieldValue(req.session.userId, "ongoingMilestone", newOngoing.toFixed(2));
        }

        // Increment total ads completed
        await mongoStorage.incrementAdsCompleted(req.session.userId);

        res.json({
          success: true,
          click,
          earnings: commission,
          restricted: true,
          restrictedCount: (user.restrictedAdsCompleted || 0) + 1,
          restrictionLimit: user.restrictionAdsLimit
        });
      } else {
        // Normal ad click (no restriction)
        // Check for first ad click bonus reset
        if (user.totalAdsCompleted === 0 && user.milestoneAmount === "25000") {
          await mongoStorage.updateUser(req.session.userId, { milestoneAmount: "0" });
        }

        const click = await mongoStorage.recordAdClick(req.session.userId, adId, ad.price);

        // Reset destination amount on first ad click
        if (user.totalAdsCompleted === 0) {
          await mongoStorage.resetDestinationAmount(req.session.userId);
        }

        // Add to both milestone amount and reward
        await mongoStorage.addMilestoneAmount(req.session.userId, ad.price);
        await mongoStorage.addMilestoneReward(req.session.userId, ad.price);

        // Increment total ads completed
        await mongoStorage.incrementAdsCompleted(req.session.userId);

        res.json({ success: true, click, earnings: ad.price, restricted: false });
      }
    } catch (error) {
      console.error("Record ad click error:", error);
      res.status(500).send("Failed to record ad click");
    }
  });

  // Ratings routes
  app.get("/api/ratings", async (req, res) => {
    try {
      const ratings = await mongoStorage.getRatings();
      res.json(ratings);
    } catch (error) {
      console.error("Get ratings error:", error);
      res.status(500).send("Failed to get ratings");
    }
  });

  app.get("/api/ratings/my", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const ratings = await mongoStorage.getUserRatings(req.session.userId);
      res.json(ratings);
    } catch (error) {
      console.error("Get user ratings error:", error);
      res.status(500).send("Failed to get ratings");
    }
  });

  app.post("/api/ratings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const rating = await mongoStorage.createRating(req.session.userId, req.body);
      res.json(rating);
    } catch (error) {
      console.error("Create rating error:", error);
      res.status(500).send("Failed to create rating");
    }
  });

  app.delete("/api/admin/ratings/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const deleted = await mongoStorage.deleteRating(req.params.id);
      if (!deleted) {
        return res.status(404).send("Rating not found");
      }

      res.json({ message: "Rating deleted" });
    } catch (error) {
      console.error("Delete rating error:", error);
      res.status(500).send("Failed to delete rating");
    }
  });

  // Withdrawals routes
  app.get("/api/withdrawals", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const withdrawals = await mongoStorage.getWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      console.error("Get withdrawals error:", error);
      res.status(500).send("Failed to get withdrawals");
    }
  });

  app.get("/api/withdrawals/my", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const withdrawals = await mongoStorage.getUserWithdrawals(req.session.userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Get user withdrawals error:", error);
      res.status(500).send("Failed to get withdrawals");
    }
  });

  app.post("/api/withdrawals", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const { amount, fullName, accountNumber, bankName, branch } = req.body;

      // Check for minimum ads requirement
      const user = await mongoStorage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Users can withdraw if they have completed 28 ads OR have received a manual deposit
      if ((user.totalAdsCompleted || 0) < 28 && !user.hasDeposit) {
        return res.status(403).send("You must view at least 28 ads before withdrawing.");
      }

      const withdrawal = await mongoStorage.createWithdrawal(req.session.userId, amount, {
        fullName,
        accountNumber,
        bankName,
        branch,
      });

      res.json(withdrawal);
    } catch (error: any) {
      console.error("Create withdrawal error:", error);
      res.status(500).send(error.message || "Failed to create withdrawal");
    }
  });

  app.post("/api/admin/withdrawals/:id/approve", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const withdrawal = await mongoStorage.approveWithdrawal(req.params.id, req.session.userId);
      res.json(withdrawal);
    } catch (error: any) {
      console.error("Approve withdrawal error:", error);
      res.status(500).send(error.message || "Failed to approve withdrawal");
    }
  });

  app.post("/api/admin/withdrawals/:id/reject", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const { notes } = req.body;
      const withdrawal = await mongoStorage.rejectWithdrawal(req.params.id, req.session.userId, notes);
      res.json(withdrawal);
    } catch (error: any) {
      console.error("Reject withdrawal error:", error);
      res.status(500).send(error.message || "Failed to reject withdrawal");
    }
  });

  // Stats route for admin dashboard
  app.get("/api/admin/stats", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await mongoStorage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const users = await mongoStorage.getAllUsers();
      const withdrawals = await mongoStorage.getWithdrawals();

      const stats = {
        totalUsers: users.length,
        pendingUsers: users.filter(u => u.status === 'pending').length,
        activeUsers: users.filter(u => u.status === 'active').length,
        frozenUsers: users.filter(u => u.status === 'frozen').length,
        totalWithdrawals: withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0),
        pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).send("Failed to get stats");
    }
  });
}
