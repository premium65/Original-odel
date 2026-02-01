import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../../db";
import { users, milestones } from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";

const router = Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;
    let query = db.select().from(users).orderBy(desc(users.createdAt)).limit(Number(limit)).offset(Number(offset));
    const allUsers = await query;
    const usersWithoutPassword = allUsers.map(({ password, ...user }: any) => user);
    res.json(usersWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get pending users
router.get("/pending", async (req, res) => {
  try {
    const pendingUsers = await db.select().from(users).where(eq(users.status, "pending")).orderBy(desc(users.createdAt));
    const usersWithoutPassword = pendingUsers.map(({ password, ...user }: any) => user);
    res.json(usersWithoutPassword);
  } catch (error) {
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
    const updated = await db.update(users).set({ status: "active", updatedAt: new Date() }).where(eq(users.id, req.params.id)).returning();
    res.json(updated[0]);
  } catch (error) {
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

export default router;
