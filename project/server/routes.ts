import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRatingSchema, insertAdSchema, slideshowItems, siteSettings, defaultColorSettings } from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";
import session from "express-session";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy for production (Render)
  app.set("trust proxy", 1);

  // Session middleware
  app.use(
    session({
      proxy: true,
      secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration request received:", JSON.stringify(req.body));
      const data = insertUserSchema.parse(req.body);
      console.log("Parsed registration data:", data);

      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        console.log("Username already exists:", data.username);
        return res.status(400).send("Username already exists");
      }

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        console.log("Email already exists:", data.email);
        return res.status(400).send("Email already exists");
      }

      const hashedPassword = await hashPassword(data.password);
      console.log("Creating user with data:", data);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      console.log("User created successfully:", user.id, user.username);
      res.json({ success: true, userId: user.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).send(error.errors[0].message);
      }
      console.error("Registration error:", error);
      res.status(500).send("Registration failed");
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).send("Username and password are required");
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).send("Invalid username or password");
      }

      if (user.status !== "active") {
        if (user.status === "pending") {
          return res.status(403).send("Your account is pending admin approval");
        } else if (user.status === "frozen") {
          return res.status(403).send("Your account has been suspended");
        }
        return res.status(403).send("Account access denied");
      }

      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send("Login failed");
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).send("Not authenticated");
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // ============================================
  // SLIDESHOW API (PUBLIC)
  // ============================================

  // Get active slideshow items (public)
  app.get("/api/slideshow", async (req, res) => {
    try {
      const items = await db
        .select()
        .from(slideshowItems)
        .where(eq(slideshowItems.isActive, true))
        .orderBy(asc(slideshowItems.order));
      res.json(items);
    } catch (error) {
      console.error("Error fetching slideshow items:", error);
      res.status(500).json({ error: "Failed to fetch slideshow items" });
    }
  });

  // ============================================
  // SITE SETTINGS API (PUBLIC)
  // ============================================

  // Get all site settings (public - for colors)
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await db.select().from(siteSettings);
      
      // Convert to key-value object
      const settingsObj: Record<string, string> = {};
      settings.forEach((s) => {
        settingsObj[s.settingKey] = s.settingValue;
      });
      
      res.json(settingsObj);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // ============================================
  // ADMIN SLIDESHOW API
  // ============================================

  // Get all slideshow items (admin - includes inactive)
  app.get("/api/admin/slideshow", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const items = await db
        .select()
        .from(slideshowItems)
        .orderBy(asc(slideshowItems.order));
      res.json(items);
    } catch (error) {
      console.error("Error fetching slideshow items:", error);
      res.status(500).json({ error: "Failed to fetch slideshow items" });
    }
  });

  // Create slideshow item (admin)
  app.post("/api/admin/slideshow", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const { title, description, imageUrl, linkUrl, buttonText, order, isActive } = req.body;
      
      const [newItem] = await db
        .insert(slideshowItems)
        .values({
          title,
          description,
          imageUrl,
          linkUrl,
          buttonText,
          order: order || 0,
          isActive: isActive !== false,
        })
        .returning();
      
      res.json(newItem);
    } catch (error) {
      console.error("Error creating slideshow item:", error);
      res.status(500).json({ error: "Failed to create slideshow item" });
    }
  });

  // Update slideshow item (admin)
  app.put("/api/admin/slideshow/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const { id } = req.params;
      const { title, description, imageUrl, linkUrl, buttonText, order, isActive } = req.body;
      
      const [updatedItem] = await db
        .update(slideshowItems)
        .set({
          title,
          description,
          imageUrl,
          linkUrl,
          buttonText,
          order,
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(slideshowItems.id, parseInt(id)))
        .returning();
      
      if (!updatedItem) {
        return res.status(404).json({ error: "Slideshow item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating slideshow item:", error);
      res.status(500).json({ error: "Failed to update slideshow item" });
    }
  });

  // Delete slideshow item (admin)
  app.delete("/api/admin/slideshow/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const { id } = req.params;
      
      const [deletedItem] = await db
        .delete(slideshowItems)
        .where(eq(slideshowItems.id, parseInt(id)))
        .returning();
      
      if (!deletedItem) {
        return res.status(404).json({ error: "Slideshow item not found" });
      }
      
      res.json({ success: true, deleted: deletedItem });
    } catch (error) {
      console.error("Error deleting slideshow item:", error);
      res.status(500).json({ error: "Failed to delete slideshow item" });
    }
  });

  // ============================================
  // ADMIN SITE SETTINGS API
  // ============================================

  // Get all settings (admin)
  app.get("/api/admin/settings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const settings = await db.select().from(siteSettings);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update single setting (admin)
  app.put("/api/admin/settings/:key", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const { key } = req.params;
      const { value } = req.body;
      
      const [updatedSetting] = await db
        .update(siteSettings)
        .set({ settingValue: value, updatedAt: new Date() })
        .where(eq(siteSettings.settingKey, key))
        .returning();
      
      if (!updatedSetting) {
        // Create if not exists
        const [newSetting] = await db
          .insert(siteSettings)
          .values({
            settingKey: key,
            settingValue: value,
            category: "custom",
          })
          .returning();
        return res.json(newSetting);
      }
      
      res.json(updatedSetting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  // Bulk update settings (admin)
  app.put("/api/admin/settings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const { settings } = req.body; // Array of { key, value }
      
      for (const setting of settings) {
        await db
          .update(siteSettings)
          .set({ settingValue: setting.value, updatedAt: new Date() })
          .where(eq(siteSettings.settingKey, setting.key));
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Initialize default settings (admin)
  app.post("/api/admin/settings/init", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      // Check if settings already exist
      const existing = await db.select().from(siteSettings);
      
      if (existing.length === 0) {
        // Insert default color settings
        await db.insert(siteSettings).values(defaultColorSettings);
        res.json({ success: true, message: "Default settings initialized" });
      } else {
        res.json({ success: true, message: "Settings already exist" });
      }
    } catch (error) {
      console.error("Error initializing settings:", error);
      res.status(500).json({ error: "Failed to initialize settings" });
    }
  });

  // Reset settings to default (admin)
  app.post("/api/admin/settings/reset", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      // Delete all color settings
      await db.delete(siteSettings).where(eq(siteSettings.category, "colors"));
      
      // Re-insert defaults
      await db.insert(siteSettings).values(defaultColorSettings);
      
      res.json({ success: true, message: "Settings reset to default" });
    } catch (error) {
      console.error("Error resetting settings:", error);
      res.status(500).json({ error: "Failed to reset settings" });
    }
  });

  // ============================================
  // RATING ENDPOINTS
  // ============================================

  app.post("/api/ratings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.status !== "active") {
        return res.status(403).send("You must have an active account to submit ratings");
      }

      const data = insertRatingSchema.parse(req.body);

      const targetUser = await storage.getUserByUsername(data.targetUsername);
      if (!targetUser) {
        return res.status(404).send("Target user not found");
      }

      const rating = await storage.createRating({
        ...data,
        userId: req.session.userId,
      });

      res.json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).send(error.errors[0].message);
      }
      console.error("Rating creation error:", error);
      res.status(500).send("Failed to create rating");
    }
  });

  app.get("/api/ratings/my", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const ratings = await storage.getRatingsByUser(req.session.userId);
      res.json(ratings);
    } catch (error) {
      console.error("Fetch ratings error:", error);
      res.status(500).send("Failed to fetch ratings");
    }
  });

  // ============================================
  // ADS ENDPOINTS
  // ============================================

  app.get("/api/ads", async (req, res) => {
    try {
      const ads = await storage.getAllAds();

      if (req.session.userId) {
        const userClicks = await storage.getUserAdClicks(req.session.userId);
        const clickMap = new Map<number, Date>();
        userClicks.forEach(click => {
          const existing = clickMap.get(click.adId);
          if (!existing || new Date(click.clickedAt) > existing) {
            clickMap.set(click.adId, new Date(click.clickedAt));
          }
        });

        const adsWithClicks = ads.map(ad => ({
          ...ad,
          lastClickedAt: clickMap.get(ad.id)?.toISOString() || null,
        }));

        return res.json(adsWithClicks);
      }

      res.json(ads);
    } catch (error) {
      console.error("Fetch ads error:", error);
      res.status(500).send("Failed to fetch ads");
    }
  });

  app.get("/api/ads/click-count", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const count = await storage.getUserAdClickCount(req.session.userId);
      res.json({ count });
    } catch (error) {
      console.error("Fetch ad click count error:", error);
      res.status(500).send("Failed to fetch ad click count");
    }
  });

  app.post("/api/ads/click", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const { adId } = req.body;
      if (!adId) {
        return res.status(400).send("Ad ID is required");
      }

      const ad = await storage.getAd(adId);
      if (!ad) {
        return res.status(404).send("Ad not found");
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      if (user.restrictionAdsLimit !== null && user.restrictionAdsLimit !== undefined) {
        if (user.restrictedAdsCompleted >= user.restrictionAdsLimit) {
          return res.status(403).json({
            error: "restriction_limit_reached",
            message: `You have reached the maximum of ${user.restrictionAdsLimit} ads allowed under restriction.`
          });
        }

        const click = await storage.recordAdClick(req.session.userId, adId);
        await storage.incrementRestrictedAds(req.session.userId);

        const commission = user.restrictionCommission || ad.price;
        await storage.addMilestoneReward(req.session.userId, commission);

        const currentOngoing = parseFloat(user.ongoingMilestone || "0");
        const commissionValue = parseFloat(commission);
        const newOngoing = Math.max(0, currentOngoing - commissionValue);
        await storage.resetUserField(req.session.userId, "ongoingMilestone");
        if (newOngoing > 0) {
          await storage.addUserFieldValue(req.session.userId, "ongoingMilestone", newOngoing.toFixed(2));
        }

        await storage.incrementAdsCompleted(req.session.userId);

        res.json({
          success: true,
          click,
          earnings: commission,
          restricted: true,
          restrictedCount: (user.restrictedAdsCompleted || 0) + 1,
          restrictionLimit: user.restrictionAdsLimit
        });
      } else {
        const click = await storage.recordAdClick(req.session.userId, adId);
        await storage.addMilestoneReward(req.session.userId, ad.price);
        await storage.addMilestoneAmount(req.session.userId, ad.price);
        await storage.incrementAdsCompleted(req.session.userId);

        const totalClicks = await storage.getUserAdClickCount(req.session.userId);
        if (totalClicks === 1) {
          await storage.resetDestinationAmount(req.session.userId);
        }

        res.json({ success: true, click, earnings: ad.price, restricted: false });
      }
    } catch (error) {
      console.error("Record ad click error:", error);
      res.status(500).send("Failed to record ad click");
    }
  });

  // ============================================
  // ADMIN USER ENDPOINTS
  // ============================================

  app.get("/api/admin/users", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const users = await storage.getAllUsers();
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Fetch users error:", error);
      res.status(500).send("Failed to fetch users");
    }
  });

  app.get("/api/admin/users/:userId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).send("User not found");
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Fetch user error:", error);
      res.status(500).send("Failed to fetch user");
    }
  });

  app.post("/api/admin/users/:userId/status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
      const { status } = req.body;

      if (!["pending", "active", "frozen"].includes(status)) {
        return res.status(400).send("Invalid status");
      }

      const updatedUser = await storage.updateUserStatus(userId, status);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update status error:", error);
      res.status(500).send("Failed to update status");
    }
  });

  // ============================================
  // ADMIN RATINGS ENDPOINTS
  // ============================================

  app.get("/api/admin/ratings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const allRatings = await storage.getAllRatings();
      res.json(allRatings);
    } catch (error) {
      console.error("Fetch ratings error:", error);
      res.status(500).send("Failed to fetch ratings");
    }
  });

  app.delete("/api/admin/ratings/:ratingId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const ratingId = parseInt(req.params.ratingId);
      const result = await storage.deleteRating(ratingId);

      if (!result) {
        return res.status(404).send("Rating not found");
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete rating error:", error);
      res.status(500).send("Failed to delete rating");
    }
  });

  // ============================================
  // WITHDRAWAL ENDPOINTS
  // ============================================

  app.post("/api/withdrawals", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const { amount, bankDetails } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).send("Invalid amount");
      }

      if (!bankDetails || !bankDetails.fullName || !bankDetails.accountNumber || !bankDetails.bankName || !bankDetails.branch) {
        return res.status(400).send("Bank details are required");
      }

      const withdrawal = await storage.createWithdrawal(req.session.userId, amount, bankDetails);
      res.json(withdrawal);
    } catch (error: any) {
      console.error("Create withdrawal error:", error);
      res.status(400).send(error.message || "Failed to create withdrawal request");
    }
  });

  app.get("/api/withdrawals/my", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const withdrawals = await storage.getUserWithdrawals(req.session.userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Fetch withdrawals error:", error);
      res.status(500).send("Failed to fetch withdrawals");
    }
  });

  // ============================================
  // ADMIN WITHDRAWAL ENDPOINTS
  // ============================================

  app.get("/api/admin/withdrawals", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const withdrawals = await storage.getAllWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      console.error("Fetch all withdrawals error:", error);
      res.status(500).send("Failed to fetch withdrawals");
    }
  });

  app.get("/api/admin/withdrawals/pending", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const withdrawals = await storage.getPendingWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      console.error("Fetch pending withdrawals error:", error);
      res.status(500).send("Failed to fetch pending withdrawals");
    }
  });

  app.post("/api/admin/withdrawals/:id/approve", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const id = parseInt(req.params.id);
      const withdrawal = await storage.approveWithdrawal(id, req.session.userId);
      res.json(withdrawal);
    } catch (error: any) {
      console.error("Approve withdrawal error:", error);
      res.status(400).send(error.message || "Failed to approve withdrawal");
    }
  });

  app.post("/api/admin/withdrawals/:id/reject", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const id = parseInt(req.params.id);
      const { notes } = req.body;
      const withdrawal = await storage.rejectWithdrawal(id, req.session.userId, notes || "");
      res.json(withdrawal);
    } catch (error: any) {
      console.error("Reject withdrawal error:", error);
      res.status(400).send(error.message || "Failed to reject withdrawal");
    }
  });

  // ============================================
  // ADMIN DEPOSIT ENDPOINT
  // ============================================

  app.post("/api/admin/users/:userId/deposit", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
      const { amount } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).send("Invalid amount");
      }

      const updatedUser = await storage.addMilestoneAmount(userId, amount);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Deposit error:", error);
      res.status(500).send("Failed to add deposit");
    }
  });

  // ============================================
  // MULTER CONFIG FOR FILE UPLOADS
  // ============================================

  const uploadDir = path.join(process.cwd(), "attached_assets", "ad_images");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed!"));
      }
    },
  });

  // ============================================
  // ADMIN AD MANAGEMENT ENDPOINTS
  // ============================================

  app.post("/api/admin/ads", upload.single("image"), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      if (!req.file) {
        return res.status(400).send("Image file is required");
      }

      const { adCode, name, price, details, link } = req.body;

      if (!adCode || !name || !price || !link) {
        return res.status(400).send("All fields are required");
      }

      const imageUrl = `/attached_assets/ad_images/${req.file.filename}`;

      const ad = await storage.createAd({
        adCode,
        price,
        link,
        imageUrl,
        duration: 10,
      });

      res.json(ad);
    } catch (error: any) {
      console.error("Create ad error:", error);
      res.status(500).send(error.message || "Failed to create ad");
    }
  });

  app.put("/api/admin/ads/:id", upload.single("image"), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const id = parseInt(req.params.id);
      const existingAd = await storage.getAd(id);

      if (!existingAd) {
        return res.status(404).send("Ad not found");
      }

      const { adCode, name, price, details, link } = req.body;

      if (!adCode || !name || !price || !link) {
        return res.status(400).send("All fields are required");
      }

      let imageUrl = existingAd.imageUrl;

      if (req.file) {
        if (existingAd.imageUrl) {
          const oldFilePath = path.join(process.cwd(), existingAd.imageUrl);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        imageUrl = `/attached_assets/ad_images/${req.file.filename}`;
      }

      const ad = await storage.updateAd(id, {
        adCode,
        price,
        link,
        imageUrl,
        duration: 10,
      });

      res.json(ad);
    } catch (error: any) {
      console.error("Update ad error:", error);
      res.status(500).send(error.message || "Failed to update ad");
    }
  });

  app.delete("/api/admin/ads/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const id = parseInt(req.params.id);
      const ad = await storage.getAd(id);

      if (!ad) {
        return res.status(404).send("Ad not found");
      }

      if (ad.imageUrl) {
        const filePath = path.join(process.cwd(), ad.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const success = await storage.deleteAd(id);
      if (success) {
        res.json({ success: true, message: "Ad deleted successfully" });
      } else {
        res.status(404).send("Ad not found");
      }
    } catch (error: any) {
      console.error("Delete ad error:", error);
      res.status(500).send(error.message || "Failed to delete ad");
    }
  });

  // ============================================
  // ADMIN PREMIUM MANAGEMENT ENDPOINTS
  // ============================================

  app.post("/api/admin/users/:userId/reset", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
      const { field } = req.body;

      const updatedUser = await storage.resetUserField(userId, field);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Reset field error:", error);
      res.status(500).send("Failed to reset field");
    }
  });

  app.post("/api/admin/users/:userId/add-value", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
      const { field, amount } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).send("Invalid amount");
      }

      const updatedUser = await storage.addUserFieldValue(userId, field, amount);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Add value error:", error);
      res.status(500).send("Failed to add value");
    }
  });

  app.patch("/api/admin/users/:userId/details", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
      const { username, mobileNumber, password } = req.body;

      const updatedUser = await storage.updateUserDetails(userId, {
        username,
        mobileNumber,
        password,
      });

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user details error:", error);
      res.status(500).send(error instanceof Error ? error.message : "Failed to update user details");
    }
  });

  app.patch("/api/admin/users/:userId/bank", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
      const { bankName, accountNumber, accountHolderName, branchName } = req.body;

      const updatedUser = await storage.updateUserBankDetails(userId, {
        bankName,
        accountNumber,
        accountHolderName,
        branchName,
      });

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update bank details error:", error);
      res.status(500).send(error instanceof Error ? error.message : "Failed to update bank details");
    }
  });

  // ============================================
  // ADMIN RESTRICTION ENDPOINTS
  // ============================================

  app.post("/api/admin/users/:userId/restrict", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);
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
    } catch (error) {
      console.error("Set restriction error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to set restriction";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/admin/users/:userId/unrestrict", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const userId = parseInt(req.params.userId);

      const updatedUser = await storage.removeUserRestriction(userId);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Remove restriction error:", error);
      res.status(500).send("Failed to remove restriction");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
