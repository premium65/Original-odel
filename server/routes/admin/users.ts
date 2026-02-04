import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../../db";
import { users, milestones } from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { storage } from "../../storage";

const router = Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    let allUsers: any[] = [];

    // Try PostgreSQL
    if (db) {
      try {
        const { limit = 50, offset = 0 } = req.query;
        allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(Number(limit)).offset(Number(offset));
      } catch (dbErr) {
        console.error("PostgreSQL error:", dbErr);
      }
    }

    // Add in-memory users
    const { inMemoryUsers } = await import("../../memStorage");
    allUsers = [...allUsers, ...inMemoryUsers];

    // Add MongoDB users if connected
    const { isMongoConnected } = await import("../../mongoConnection");
    const { mongoStorage } = await import("../../mongoStorage");
    if (isMongoConnected()) {
      try {
        const mongoUsers = await mongoStorage.getAllUsers();
        allUsers = [...allUsers, ...mongoUsers];
      } catch (err) {
        console.error("MongoDB error:", err);
      }
    }

    // Deduplicate by username
    const uniqueUsers = Array.from(new Map(allUsers.map(item => [item.username, item])).values());
    const usersWithoutPassword = uniqueUsers.map(({ password, ...user }: any) => user);
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get pending users
router.get("/pending", async (req, res) => {
  try {
    let pendingUsers: any[] = [];
    try {
      pendingUsers = await db.select().from(users).where(eq(users.status, "pending")).orderBy(desc(users.createdAt));
    } catch (dbError) {
      console.error("Postgres Error (using fallback):", dbError);
    }

    // Also fetch in-memory pending users
    const { inMemoryUsers } = await import("../../memStorage");
    const memPending = inMemoryUsers.filter(u => u.status === 'pending');

    // Also fetch Mongo users if connected
    const { isMongoConnected } = await import("../../mongoConnection");
    const { mongoStorage } = await import("../../mongoStorage");

    let mongoPending: any[] = [];
    if (isMongoConnected()) {
      // Fetch from Mongo if connected
      try {
        // We need a method to get all users from Mongo, or use existing methods
        // Assuming getAllUsers exists on mongoStorage interface
        const allMongo = await mongoStorage.getAllUsers();
        mongoPending = allMongo.filter(u => u.status === 'pending');
      } catch (err) {
        console.error("Error fetching Mongo users:", err);
      }
    }

    // Merge lists (avoid duplicates based on username or email)
    const allPending = [...pendingUsers, ...mongoPending, ...memPending];

    // Deduplicate by username
    const uniquePending = Array.from(new Map(allPending.map(item => [item.username, item])).values());

    const usersWithoutPassword = uniquePending.map(({ password, ...user }: any) => user);
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error("Pending users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get admins
router.get("/admins", async (req, res) => {
  try {
    const admins = await db.select().from(users).where(eq(users.isAdmin, true)).orderBy(desc(users.createdAt));
    const adminsWithoutPassword = admins.map(({ password, ...user }: any) => user);
    res.json(adminsWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    if (!user.length) return res.status(404).json({ error: "User not found" });
    const { password, ...userData } = user[0];

    // Get user milestone
    const milestone = await db.select().from(milestones).where(and(eq(milestones.userId, req.params.id), eq(milestones.status, "active"))).limit(1);

    res.json({ ...userData, milestone: milestone[0] || null });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create user
router.post("/", async (req, res) => {
  try {
    const { username, email, password, fullName, phone, role = "user" } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = role === 'admin' || role === 'superadmin';

    // Split fullName strictly for storage (simple split)
    const [firstName, ...lastNameParts] = (fullName || "").split(" ");
    const lastName = lastNameParts.join(" ");

    const newUser = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      mobileNumber: phone,
      isAdmin,
      status: "active"
    }).returning();

    const { password: _, ...userData } = newUser[0];
    res.json(userData);
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    updateData.updatedAt = new Date();

    const updated = await db.update(users).set(updateData).where(eq(users.id, req.params.id)).returning();
    if (!updated.length) return res.status(404).json({ error: "User not found" });

    const { password: _, ...userData } = updated[0];
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    await db.delete(users).where(eq(users.id, req.params.id));
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Approve user
router.post("/:id/approve", async (req, res) => {
  try {
    const userId = req.params.id;

    // Try in-memory users first
    const { inMemoryUsers } = await import("../../memStorage");
    const memUserIndex = inMemoryUsers.findIndex(u => u.id === userId || u.username === userId);

    if (memUserIndex !== -1) {
      inMemoryUsers[memUserIndex].status = "active";
      const { password, ...userData } = inMemoryUsers[memUserIndex];
      return res.json({ ...userData, message: "User approved successfully" });
    }

    // Try MongoDB
    const { isMongoConnected } = await import("../../mongoConnection");
    const { mongoStorage } = await import("../../mongoStorage");

    if (isMongoConnected()) {
      try {
        const mongoUser = await mongoStorage.getUser(userId);
        if (mongoUser) {
          await mongoStorage.updateUser(userId, { status: "active" });
          return res.json({ ...mongoUser, status: "active", message: "User approved successfully" });
        }
      } catch (err) {
        console.error("MongoDB approve error:", err);
      }
    }

    // Try PostgreSQL
    if (db) {
      const updated = await db.update(users).set({ status: "active", updatedAt: new Date() }).where(eq(users.id, userId)).returning();
      if (updated.length) {
        return res.json({ ...updated[0], message: "User approved successfully" });
      }
    }

    res.status(404).json({ error: "User not found" });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Reject user
router.post("/:id/reject", async (req, res) => {
  try {
    const userId = req.params.id;

    // Try in-memory users first
    const { inMemoryUsers } = await import("../../memStorage");
    const memUserIndex = inMemoryUsers.findIndex(u => u.id === userId || u.username === userId);

    if (memUserIndex !== -1) {
      inMemoryUsers.splice(memUserIndex, 1);
      return res.json({ message: "User rejected and removed" });
    }

    // Try MongoDB
    const { isMongoConnected } = await import("../../mongoConnection");
    const { mongoStorage } = await import("../../mongoStorage");

    if (isMongoConnected()) {
      try {
        const mongoUser = await mongoStorage.getUser(userId);
        if (mongoUser) {
          await mongoStorage.deleteUser(userId);
          return res.json({ message: "User rejected and removed" });
        }
      } catch (err) {
        console.error("MongoDB reject error:", err);
      }
    }

    // Try PostgreSQL
    if (db) {
      await db.delete(users).where(eq(users.id, userId));
      return res.json({ message: "User rejected and removed" });
    }

    res.status(404).json({ error: "User not found" });
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create milestone for user
router.post("/:id/milestone", async (req, res) => {
  try {
    const { totalAds, depositAmount, rewardAmount, commissionPerAd } = req.body;
    const milestone = await db.insert(milestones).values({
      userId: req.params.id,
      totalAds, depositAmount, rewardAmount, commissionPerAd
    }).returning();
    res.json(milestone[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update user balance/points
router.post("/:id/balance", async (req, res) => {
  try {
    const { amount, type } = req.body; // type: add, subtract, set
    const user = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    if (!user.length) return res.status(404).json({ error: "User not found" });

    let newBalance = Number(user[0].balance);
    if (type === "add") newBalance += Number(amount);
    else if (type === "subtract") newBalance -= Number(amount);
    else newBalance = Number(amount);

    const updated = await db.update(users).set({ balance: newBalance.toString() }).where(eq(users.id, req.params.id)).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Freeze user
router.post("/:id/freeze", async (req, res) => {
  try {
    const userId = req.params.id;

    // Try PostgreSQL first
    if (db) {
      const updated = await db.update(users).set({ status: "frozen", updatedAt: new Date() }).where(eq(users.id, userId)).returning();
      if (updated.length) {
        return res.json(updated[0]);
      }
    }

    // Try MongoDB fallback
    const { isMongoConnected } = await import("../../mongoConnection");
    const { mongoStorage } = await import("../../mongoStorage");
    if (isMongoConnected()) {
      const mongoUser = await mongoStorage.updateUserStatus(userId, "frozen");
      if (mongoUser) {
        return res.json(mongoUser);
      }
    }

    res.status(404).json({ error: "User not found" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Unfreeze/reactivate user
router.post("/:id/unfreeze", async (req, res) => {
  try {
    const userId = req.params.id;

    // Try PostgreSQL first
    if (db) {
      const updated = await db.update(users).set({ status: "active", updatedAt: new Date() }).where(eq(users.id, userId)).returning();
      if (updated.length) {
        return res.json(updated[0]);
      }
    }

    // Try MongoDB fallback
    const { isMongoConnected } = await import("../../mongoConnection");
    const { mongoStorage } = await import("../../mongoStorage");
    if (isMongoConnected()) {
      const mongoUser = await mongoStorage.updateUserStatus(userId, "active");
      if (mongoUser) {
        return res.json(mongoUser);
      }
    }

    res.status(404).json({ error: "User not found" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Set user restriction
router.post("/:id/restriction", async (req, res) => {
  try {
    const { adsLimit, deposit, commission, pendingAmount } = req.body;

    // Validate numeric inputs
    const depositNum = parseFloat(deposit);
    const commissionNum = parseFloat(commission);
    const pendingNum = pendingAmount ? parseFloat(pendingAmount) : depositNum;

    if (isNaN(depositNum) || depositNum <= 0) throw new Error("Invalid deposit amount");
    if (isNaN(commissionNum) || commissionNum <= 0) throw new Error("Invalid commission amount");

    // Check if user already has a restriction (to differentiate CREATE vs EDIT)
    const user = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    if (!user.length) return res.status(404).json({ error: "User not found" });

    const existingUser = user[0];
    const isEditing = existingUser.restrictionAdsLimit !== null && existingUser.restrictionAdsLimit !== undefined;

    const updateData: any = {
      restrictionAdsLimit: adsLimit,
      restrictionDeposit: depositNum.toFixed(2),
      restrictionCommission: commissionNum.toFixed(2),
      ongoingMilestone: pendingNum.toFixed(2),
    };

    // Only modify these fields when CREATING a new restriction (not editing)
    if (!isEditing) {
      updateData.restrictedAdsCompleted = 0;
      // Deduct deposit from Milestone Amount (creates negative balance)
      updateData.milestoneAmount = sql`${users.milestoneAmount} - ${depositNum}::numeric`;
    }

    const updated = await db.update(users).set(updateData).where(eq(users.id, req.params.id)).returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Remove user restriction
router.delete("/:id/restriction", async (req, res) => {
  try {
    const updated = await db.update(users).set({
      restrictionAdsLimit: null,
      restrictionDeposit: null,
      restrictionCommission: null,
      restrictedAdsCompleted: 0,
      ongoingMilestone: "0.00",
    }).where(eq(users.id, req.params.id)).returning();

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Reset user field
router.post("/:id/reset", async (req, res) => {
  try {
    const { field } = req.body;
    const updateData: any = {};

    // Map field names to database columns
    if (field === 'booking') {
      updateData.totalAdsCompleted = 0;
      updateData.restrictedAdsCompleted = 0;
      // Also delete ad clicks history?
      // const { adClicks } = await import("@shared/schema"); 
      // await db.delete(adClicks).where(eq(adClicks.userId, req.params.id));
      // NOTE: Importing schema dynamically might be tricky here, assume handled or just reset counters for now.
    } else if (field === 'points') {
      updateData.milestoneAmount = "0.00";
    } else if (field === 'premiumTreasure') {
      updateData.milestoneReward = "0.00";
    } else if (field === 'normalTreasure') {
      updateData.destinationAmount = "0.00";
    } else if (field === 'bookingValue') {
      updateData.milestoneAmount = "0.00";
    } else if (field === 'ongoingMilestone') {
      updateData.ongoingMilestone = "0.00";
    } else {
      return res.status(400).json({ error: "Invalid field" });
    }

    const updated = await db.update(users).set(updateData).where(eq(users.id, req.params.id)).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add value to user field
router.post("/:id/add-value", async (req, res) => {
  try {
    const { field, amount } = req.body;
    const numValue = parseFloat(amount);

    if (field === 'points' && numValue > 100) {
      return res.status(400).json({ error: "Points cannot exceed 100" });
    }

    let updateExpr;
    // Map field names to database columns logic
    if (field === 'points') {
      // Set points directly
      updateExpr = { points: numValue };
    } else if (field === 'balance') {
      updateExpr = { balance: sql`${users.balance} + ${amount}::numeric` };
    } else if (field === 'premiumTreasure') {
      updateExpr = { milestoneReward: sql`${users.milestoneReward} + ${amount}::numeric` };
    } else if (field === 'normalTreasure') {
      updateExpr = { destinationAmount: sql`${users.destinationAmount} + ${amount}::numeric` };
    } else if (field === 'bookingValue') {
      updateExpr = { milestoneAmount: sql`${users.milestoneAmount} + ${amount}::numeric` };
    } else {
      return res.status(400).json({ error: "Invalid field" });
    }

    const updated = await db.update(users).set(updateExpr).where(eq(users.id, req.params.id)).returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Set user restriction (frontend calls /restrict)
router.post("/:id/restrict", async (req, res) => {
  try {
    const userId = req.params.id;
    const { adsLimit, deposit, commission, pendingAmount } = req.body;

    if (!adsLimit || adsLimit <= 0) {
      return res.status(400).json({ error: "Invalid ads limit" });
    }
    if (!deposit || parseFloat(deposit) <= 0 || isNaN(parseFloat(deposit))) {
      return res.status(400).json({ error: "Invalid deposit amount" });
    }
    if (!commission || parseFloat(commission) <= 0 || isNaN(parseFloat(commission))) {
      return res.status(400).json({ error: "Invalid commission amount" });
    }

    const updatedUser = await storage.setUserRestriction(userId, adsLimit, deposit, commission, pendingAmount);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Set restriction error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Remove user restriction (frontend calls POST /unrestrict)
router.post("/:id/unrestrict", async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await storage.removeUserRestriction(userId);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Remove restriction error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Update user details (username, mobile, password)
router.patch("/:id/details", async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, mobileNumber, password } = req.body;

    const updatedUser = await storage.updateUserDetails(userId, {
      username,
      mobileNumber,
      password,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Update user details error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Update bank details
router.patch("/:id/bank", async (req, res) => {
  try {
    const userId = req.params.id;
    const { bankName, accountNumber, accountHolderName, branchName } = req.body;

    const updatedUser = await storage.updateUserBankDetails(userId, {
      bankName,
      accountNumber,
      accountHolderName,
      branchName,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Update bank details error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Create E-Voucher (Milestone Hold System)
router.post("/:id/evoucher", async (req, res) => {
  try {
    const userId = req.params.id;
    const { milestoneAdsCount, milestoneAmount, milestoneReward, ongoingMilestone, bannerUrl } = req.body;

    if (!milestoneAdsCount || milestoneAdsCount <= 0) {
      return res.status(400).json({ error: "Invalid milestone ads count" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await storage.updateUser(userId, {
      milestoneAdsCount: parseInt(milestoneAdsCount),
      milestoneAmount: milestoneAmount || "-5000",
      milestoneReward: milestoneReward || "0",
      ongoingMilestone: ongoingMilestone || "0",
      adsLocked: false,
      eVoucherBannerUrl: bannerUrl || null,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "Failed to update user" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Create E-Voucher error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Clear E-Voucher lock (unlock after deposit)
router.post("/:id/evoucher-unlock", async (req, res) => {
  try {
    const userId = req.params.id;

    const updatedUser = await storage.updateUser(userId, {
      milestoneAmount: "0",
      adsLocked: false,
      hasDeposit: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("E-Voucher unlock error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Create E-Bonus (Instant Reward - NO locking)
router.post("/:id/ebonus", async (req, res) => {
  try {
    const userId = req.params.id;
    const { bonusAdsCount, bonusAmount, bannerUrl } = req.body;

    if (!bonusAdsCount || bonusAdsCount <= 0) {
      return res.status(400).json({ error: "Invalid bonus ads count" });
    }
    if (!bonusAmount || parseFloat(bonusAmount) <= 0) {
      return res.status(400).json({ error: "Invalid bonus amount" });
    }

    const updatedUser = await storage.updateUser(userId, {
      bonusAdsCount: parseInt(bonusAdsCount),
      bonusAmount: bonusAmount,
      eBonusBannerUrl: bannerUrl || null,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Create E-Bonus error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Toggle admin status
router.post("/:id/toggle-admin", async (req, res) => {
  try {
    const userId = req.params.id;
    const { isAdmin } = req.body;

    const updatedUser = await storage.updateUser(userId, {
      isAdmin: !!isAdmin
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Toggle admin error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Manual deposit adapter (backward compatibility)
router.post("/:id/deposit", async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount, description } = req.body;
    const adminId = req.session.userId ? String(req.session.userId) : "unknown";

    // Validation
    if (!amount) {
      console.warn(`[USER_DEPOSIT_ADAPTER] Missing amount, admin: ${adminId}, userId: ${userId}`);
      return res.status(400).json({ error: "Amount is required" });
    }

    // Coerce to number and validate
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      console.warn(`[USER_DEPOSIT_ADAPTER] Invalid amount: ${amount}, admin: ${adminId}, userId: ${userId}`);
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    // Normalize userId
    const targetUserId = String(userId);

    // Verify user exists before proceeding
    const existingUser = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (!existingUser.length) {
      console.warn(`[USER_DEPOSIT_ADAPTER] User not found: ${targetUserId}, admin: ${adminId}`);
      return res.status(404).json({ error: "User not found" });
    }

    // Import deposits and transactions tables
    const { deposits, transactions } = await import("@shared/schema");

    // Use Drizzle transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // 1. Create deposit record
      const [deposit] = await tx.insert(deposits).values({
        userId: targetUserId,
        amount: numAmount.toFixed(2),
        type: "manual_add",
        method: "admin_manual",
        description: description || "Manual deposit by admin",
        reference: `MANUAL-${Date.now()}`,
        status: "approved"
      }).returning();

      // 2. Add amount to user balance
      await tx.update(users).set({
        balance: sql`${users.balance} + ${numAmount}::numeric`,
        hasDeposit: true
      }).where(eq(users.id, targetUserId));

      // 3. Create transaction record
      await tx.insert(transactions).values({
        userId: targetUserId,
        type: "deposit",
        amount: numAmount.toFixed(2),
        status: "approved",
        description: description || "Manual deposit by admin"
      });

      return deposit;
    });

    console.log(`[USER_DEPOSIT_ADAPTER] Success: admin ${adminId} added ${numAmount} LKR to user ${targetUserId}`);
    res.status(201).json({ success: true, deposit: result });
  } catch (error: any) {
    console.error("[USER_DEPOSIT_ADAPTER] Error:", error);
    res.status(500).json({ error: error.message || "Failed to create manual deposit" });
  }
});

export default router;
