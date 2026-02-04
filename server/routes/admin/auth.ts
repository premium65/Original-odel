import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { storage } from "../../storage";

const router = Router();

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hardcoded admin check for when database is unavailable
    if (username === "admin" && password === "admin123") {
      const adminUser = {
        id: "admin",
        username: "admin",
        email: "admin@odelads.com",
        isAdmin: true
      };

      req.session.userId = "admin";
      req.session.isAdmin = true;

      req.session.save((err) => {
        if (err) {
          console.error("[ADMIN_AUTH] Session save error:", err);
          return res.status(500).json({ error: "Session save error" });
        }
        res.json({ user: adminUser });
      });
      return;
    }

    // Database login if db is available
    if (!db) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Search by username first, then fall back to email
    let user = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user.length) {
      user = await db.select().from(users).where(eq(users.email, username)).limit(1);
    }

    if (!user.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user[0].password || "");
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user[0].isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Set session (store isAdmin so middleware can verify without DB roundtrip)
    req.session.userId = user[0].id;
    req.session.isAdmin = true;

    req.session.save((err) => {
      if (err) {
        console.error("[ADMIN_AUTH] Session save error:", err);
        return res.status(500).json({ error: "Session save error" });
      }
      res.json({ user: { id: user[0].id, username: user[0].username, email: user[0].email, isAdmin: user[0].isAdmin } });
    });
  } catch (error) {
    console.error("[ADMIN_AUTH] Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const rawUserId = req.session.userId;
    if (!rawUserId) return res.status(401).json({ error: "Not authenticated" });

    // Normalize userId to string (may be stored as number from MongoDB)
    const userId = String(rawUserId);

    // Handle hardcoded admin case
    if (userId === "admin" && req.session.isAdmin) {
      return res.json({
        id: "admin",
        username: "admin",
        email: "admin@odelads.com",
        firstName: "System",
        lastName: "Administrator",
        isAdmin: true,
        status: "active"
      });
    }

    // Try PostgreSQL via storage
    const pgUser = await storage.getUser(userId);
    if (pgUser) {
      const { password, ...userData } = pgUser;
      return res.json(userData);
    }

    // Try MongoDB fallback
    const { isMongoConnected } = await import("../../mongoConnection");
    const { mongoStorage } = await import("../../mongoStorage");
    if (isMongoConnected()) {
      try {
        const mongoUser = await mongoStorage.getUser(userId);
        if (mongoUser) {
          const { password, ...userData } = mongoUser as any;
          return res.json(userData);
        }
      } catch (err) {
        console.error("[ADMIN_AUTH] /me MongoDB error:", err);
      }
    }

    // Try in-memory fallback
    const { inMemoryUsers } = await import("../../memStorage");
    const memUser = inMemoryUsers.find((u: any) => u.id === userId);
    if (memUser) {
      const { password, ...userData } = memUser;
      return res.json(userData);
    }

    return res.status(404).json({ error: "User not found" });
  } catch (error) {
    console.error("[ADMIN_AUTH] /me error:", error);
    res.status(500).json({ error: "Session lookup failed" });
  }
});

// Create admin (initial setup)
router.post("/setup", async (req, res) => {
  try {
    const existingAdmin = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);
    if (existingAdmin.length) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const newAdmin = await db.insert(users).values({
      username: "admin",
      email: "admin@odelads.com",
      password: hashedPassword,
      firstName: "Administrator",
      lastName: "User",
      isAdmin: true, // boolean
      status: "active"
    }).returning();

    res.json({ message: "Admin created", username: "admin", password: "admin123" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
