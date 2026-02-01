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

    // Set session
    req.session.userId = user[0].id;

    req.session.save((err) => {
      if (err) return res.status(500).json({ error: "Session save error" });
      res.json({ user: { id: user[0].id, username: user[0].username, email: user[0].email, isAdmin: user[0].isAdmin } });
    });
  } catch (error) {
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
