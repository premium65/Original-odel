import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../../db";
import { users, milestones } from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";

const router = Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    let allUsers: any[] = [];

    // Try PostgreSQL
    if (db) {
      try {
        // Remove limit to get ALL users
        allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
        console.log(`[ADMIN/USERS] Found ${allUsers.length} PostgreSQL users`);
      } catch (dbErr) {
        console.error("PostgreSQL error:", dbErr);
      }
    }

    // Add in-memory users
    try {
      const { inMemoryUsers } = await import("../../memStorage");
      if (inMemoryUsers && inMemoryUsers.length > 0) {
        allUsers = [...allUsers, ...inMemoryUsers];
        console.log(`[ADMIN/USERS] Added ${inMemoryUsers.length} in-memory users`);
      }
    } catch (e) {
      // Ignore if memStorage not available
    }

    // Add MongoDB users if connected
    try {
      const { isMongoConnected } = await import("../../mongoConnection");
      const { mongoStorage } = await import("../../mongoStorage");
      if (isMongoConnected()) {
        const mongoUsers = await mongoStorage.getAllUsers();
        allUsers = [...allUsers, ...mongoUsers];
        console.log(`[ADMIN/USERS] Added ${mongoUsers.length} MongoDB users`);
      }
    } catch (err) {
      // Ignore if MongoDB not available
    }

    // Deduplicate by username
    const uniqueUsers = Array.from(new Map(allUsers.map(item => [item.username, item])).values());
    const usersWithoutPassword = uniqueUsers.map(({ password, ...user }: any) => user);

    console.log(`[ADMIN/USERS] Returning ${usersWithoutPassword.length} total users`);
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
    const updated = await db.update(users).set({ status: "frozen", updatedAt: new Date() }).where(eq(users.id, req.params.id)).returning();
    res.json(updated[0]);
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

export default router;
