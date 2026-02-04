import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

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

    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);

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

    // Set session - ensure both userId and isAdmin are set
    req.session.userId = user[0].id;
    req.session.isAdmin = user[0].isAdmin;

    req.session.save((err) => {
      if (err) {
        console.error("[ADMIN_AUTH] Session save error:", err);
        return res.status(500).json({ error: "Session save error" });
      }
      console.log("[ADMIN_AUTH] User logged in:", user[0].username, "ID:", user[0].id, "isAdmin:", user[0].isAdmin);
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
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });

    // Handle hardcoded admin case
    if (req.session.userId === "admin" && req.session.isAdmin) {
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

    // Database lookup if db is available
    if (!db) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const user = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);

    if (!user.length) return res.status(404).json({ error: "User not found" });

    const { password, ...userData } = user[0];
    res.json(userData);
  } catch (error) {
    res.status(401).json({ error: "Invalid session" });
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
