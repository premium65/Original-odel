import type { Express } from "express";
import { registerPremiumRoutes } from "./premiumRoutes";
import { registerAdminRoutes } from "./routes/admin/index";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRatingSchema, insertAdSchema, contacts, infoPages, branding, themeSettings, slideshow } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { mongoStorage } from "./mongoStorage";
import { isMongoConnected } from "./mongoConnection";
import cors from "cors";

const SALT_ROUNDS = 10;

// In-memory user storage for when database is down
import { inMemoryUsers } from "./memStorage";

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Helper: find user in both MongoDB and PostgreSQL
async function findUser(userId: string): Promise<any> {
  let user: any = null;
  if (isMongoConnected()) {
    user = await mongoStorage.getUser(userId);
  }
  if (!user) {
    user = await storage.getUser(userId);
  }
  return user;
}

// Helper: find user by username in both databases
async function findUserByUsername(username: string): Promise<any> {
  let user: any = null;
  if (isMongoConnected()) {
    user = await mongoStorage.getUserByUsername(username);
  }
  if (!user) {
    user = await storage.getUserByUsername(username);
  }
  return user;
}

import { repairDatabase } from "./repair";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auto-repair DB on startup (safeguard) - await to ensure schema is ready
  try {
    await repairDatabase();
  } catch (e) {
    console.error("[DB REPAIR] Repair failed on startup:", e);
  }

  // setup client sessions
  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/"
    },
    name: "connect.sid"
  };

  // Use memory session store (simpler and more reliable)
  console.log("[SESSION] Using memory session store");

  app.use(session(sessionConfig));

  // Trust proxy for secure cookies behind reverse proxy
  app.set('trust proxy', 1);

  // CORS middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    })
  );

  // Register Admin Routes (modular - in server/routes/admin/)
  registerAdminRoutes(app);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "OK",
      message: "Server is running",
      timestamp: new Date().toISOString()
    });
  });

  // User auth endpoint (for regular user frontend)
  app.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Return admin user if session is admin
      if (req.session.userId === "admin") {
        return res.json({
          id: "admin",
          username: "admin",
          email: "admin@odelads.com",
          fullName: "System Administrator",
          firstName: "System",
          lastName: "Administrator",
          mobileNumber: "0000000000",
          status: "active",
          isAdmin: 1,
          registeredAt: new Date().toISOString(),
          destinationAmount: "0.00",
          milestoneAmount: "0.00",
          milestoneReward: "0.00",
          totalAdsCompleted: 0,
          points: 100
        });
      }

      // Check database
      const user = await findUser(req.session.userId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      }

      // Check in-memory storage
      const memoryUser = inMemoryUsers.find(u => u.id === req.session.userId);
      if (memoryUser) {
        const { password, ...userWithoutPassword } = memoryUser;
        return res.json(userWithoutPassword);
      }

      return res.status(401).json({ error: "User not found" });
    } catch (error) {
      console.error("[AUTH/USER] Error:", error);
      return res.status(500).json({ error: "Authentication error" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      res.json({});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/slides", async (req, res) => {
    try {
      const slides = await db.select().from(slideshow).where(eq(slideshow.isActive, true)).orderBy(slideshow.sortOrder);
      res.json(slides);
    } catch (error) {
      console.error("[API/SLIDES] Error:", error);
      res.status(500).json({ error: "Failed to fetch slides" });
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const allContacts = await db.select().from(contacts).where(eq(contacts.isActive, true));
      const contactData: Record<string, { value: string; isActive: boolean; label?: string }> = {};
      allContacts.forEach((c: any) => {
        contactData[c.type] = { value: c.value, isActive: c.isActive, label: c.label };
      });
      res.json(contactData);
    } catch (error) {
      console.error("[API/CONTACT] Error:", error);
      res.status(500).json({ error: "Failed to fetch contact data" });
    }
  });

  app.get("/api/branding", async (req, res) => {
    try {
      const brandingData = await db.select().from(branding).limit(1);
      res.json(brandingData[0] || {
        siteName: "OdelADS",
        siteTagline: "Watch & Earn",
        logoUrl: "",
        faviconUrl: ""
      });
    } catch (error) {
      console.error("[API/BRANDING] Error:", error);
      res.status(500).json({ error: "Failed to fetch branding" });
    }
  });

  app.get("/api/theme", async (req, res) => {
    try {
      const themeData = await db.select().from(themeSettings);
      const themeObj: Record<string, string> = {};
      themeData.forEach((t: any) => {
        themeObj[t.key] = t.value;
      });
      res.json(themeObj);
    } catch (error) {
      console.error("[API/THEME] Error:", error);
      res.status(500).json({ error: "Failed to fetch theme" });
    }
  });

  app.get("/api/info-pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await db.select().from(infoPages).where(eq(infoPages.slug, slug)).limit(1);
      if (page.length === 0) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page[0]);
    } catch (error) {
      console.error("[API/INFO-PAGES] Error:", error);
      res.status(500).json({ error: "Failed to fetch info page" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/pages", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  // Admin session check - validates actual session
  app.get("/api/admin/session", async (req, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.json({ isLoggedIn: false });
      }

      if (req.session.userId === "admin") {
        return res.json({
          isLoggedIn: true,
          user: { id: "admin", username: "admin", isAdmin: true }
        });
      }

      const user = await findUser(req.session.userId);
      if (user && user.isAdmin) {
        return res.json({
          isLoggedIn: true,
          user: { id: user.id, username: user.username, isAdmin: true }
        });
      }

      return res.json({ isLoggedIn: false });
    } catch (error) {
      console.error("[ADMIN/SESSION] Error:", error);
      return res.json({ isLoggedIn: false });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("[LOGOUT] Session destroy error:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("[LOGOUT] Error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
      }

      if (!db) {
        return res.status(503).json({ error: "Database is not connected. Please contact support." });
      }

      try {
        const hashedPassword = await hashPassword(password);

        const user = await storage.createUser({
          username,
          email,
          password: hashedPassword,
          firstName: firstName || '',
          lastName: lastName || '',
          status: 'pending',
          isAdmin: false,
          milestoneAmount: "0",
          milestoneReward: "0",
          destinationAmount: "25000",
          ongoingMilestone: "0",
          totalAdsCompleted: 0,
          points: 0,
          pendingAmount: "0",
          hasDeposit: false,
          restrictedAdsCompleted: 0,
          notificationsEnabled: true,
          language: "en",
          theme: "dark",
        });

        return res.json({
          success: true,
          userId: user.id,
          message: "Registration successful! Your account is pending admin approval.",
          status: "pending"
        });
      } catch (createError: any) {
        const errorMessage = createError.message || '';
        if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
          if (errorMessage.includes('username') || errorMessage.includes('users_username')) {
            return res.status(400).json({ error: "Username already exists" });
          }
          if (errorMessage.includes('email') || errorMessage.includes('users_email')) {
            return res.status(400).json({ error: "Email already exists" });
          }
          return res.status(400).json({ error: "Account already exists" });
        }
        console.error("Database unavailable during registration:", errorMessage);
        return res.status(500).json({ error: "Registration failed. Database is unavailable. Please try again later." });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Registration failed. Please try again later." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const loginIdentifier = username || email;

      if (!loginIdentifier || !password) {
        return res.status(400).json({ error: "Username/email and password are required" });
      }

      // Admin check
      if (username === "admin" && password === "admin123") {
        req.session.userId = "admin";
        (req.session as any).isAdmin = true;

        req.session.save((err) => {
          if (err) {
            console.error("[LOGIN] Session save error:", err);
            return res.status(500).json({ error: "Failed to save session" });
          }

          res.json({
            id: "admin",
            username: "admin",
            email: "admin@odelads.com",
            fullName: "System Administrator",
            firstName: "System",
            lastName: "Administrator",
            mobileNumber: "0000000000",
            status: "active",
            isAdmin: 1,
            registeredAt: new Date().toISOString(),
            destinationAmount: "0.00",
            milestoneAmount: "0.00",
            milestoneReward: "0.00",
            totalAdsCompleted: 0,
            points: 100
          });
        });
        return;
      }

      let user: any = await findUserByUsername(loginIdentifier);

      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      if (user.status !== "active") {
        if (user.status === "pending") {
          return res.status(403).json({ error: "Your account is pending admin approval" });
        } else if (user.status === "frozen") {
          return res.status(403).json({ error: "Your account has been suspended" });
        }
        return res.status(403).json({ error: "Account access denied" });
      }

      const userId = user.id || user._id?.toString();
      req.session.userId = String(userId);

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }

        const { password: _, ...userWithoutPassword } = user;
        const userResponse = {
          ...userWithoutPassword,
          isAdmin: user.isAdmin || 0,
          firstName: user.firstName || user.fullName?.split(' ')[0] || '',
          lastName: user.lastName || user.fullName?.split(' ').slice(1).join(' ') || '',
          email: user.email || `${user.username}@example.com`,
          mobileNumber: user.mobileNumber || '',
          username: user.username
        };
        res.json(userResponse);
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ success: true });
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

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).send("Not authenticated");
    }

    let user: any = await findUser(req.session.userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const { password: _, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      isAdmin: user.isAdmin || 0
    };
    res.json(userResponse);
  });

  // Rating endpoints
  app.post("/api/ratings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const currentUser = await findUser(req.session.userId);
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

  // Ads endpoints
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

  app.post("/api/ads/:adId/click", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
      }

      const adId = parseInt(req.params.adId) || (req.body.adId ? parseInt(req.body.adId) : 0);
      if (!adId) {
        return res.status(400).send("Ad ID is required");
      }

      const ad = await storage.getAd(adId);
      if (!ad) {
        return res.status(404).send("Ad not found");
      }

      const user = await findUser(req.session.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Check if ads are locked (E-Voucher milestone reached)
      if (user.adsLocked) {
        const depositRequired = Math.abs(parseFloat(user.milestoneAmount || "0"));
        return res.status(403).json({
          error: "ads_locked",
          message: "Your ads are locked. Please deposit to continue.",
          depositRequired: depositRequired,
          milestoneReward: user.milestoneReward,
          ongoingMilestone: user.ongoingMilestone
        });
      }

      // Check if user has an active restriction
      if (user.restrictionAdsLimit !== null && user.restrictionAdsLimit !== undefined) {
        if (user.restrictedAdsCompleted >= user.restrictionAdsLimit) {
          return res.status(403).json({
            error: "restriction_limit_reached",
            message: `You have reached the maximum of ${user.restrictionAdsLimit} ads allowed under restriction.`
          });
        }

        const commission = parseFloat(String(user.restrictionCommission || ad.price || "0")).toFixed(2);
        const click = await storage.recordAdClick(req.session.userId, adId, commission);
        await storage.incrementRestrictedAds(req.session.userId);
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
        // Normal ad click (no restriction)
        const priceStr = parseFloat(String(ad.price || "0")).toFixed(2);
        const click = await storage.recordAdClick(req.session.userId, adId, priceStr);
        await storage.addMilestoneReward(req.session.userId, priceStr);
        await storage.addMilestoneAmount(req.session.userId, priceStr);
        await storage.incrementAdsCompleted(req.session.userId);

        const updatedUser = await findUser(req.session.userId);
        const newAdsCount = updatedUser?.totalAdsCompleted || 0;
        const totalClicks = await storage.getUserAdClickCount(req.session.userId);

        if (totalClicks === 1) {
          await storage.resetDestinationAmount(req.session.userId);
        }

        // Check if E-Voucher milestone is reached (LOCKS ads)
        if (updatedUser?.milestoneAdsCount && newAdsCount === updatedUser.milestoneAdsCount && !updatedUser.adsLocked) {
          await storage.updateUser(req.session.userId, { adsLocked: true });

          return res.json({
            success: true,
            click,
            earnings: ad.price,
            restricted: false,
            milestoneReached: true,
            milestoneAdsCount: updatedUser.milestoneAdsCount,
            milestoneAmount: updatedUser.milestoneAmount,
            milestoneReward: updatedUser.milestoneReward,
            ongoingMilestone: updatedUser.ongoingMilestone,
            bannerUrl: updatedUser.eVoucherBannerUrl || null
          });
        }

        // Check if E-Bonus is triggered (NO locking - instant reward)
        if (updatedUser?.bonusAdsCount && newAdsCount === updatedUser.bonusAdsCount) {
          const bonusAmount = parseFloat(updatedUser.bonusAmount || "0");
          const eBonusBannerUrl = updatedUser.eBonusBannerUrl;
          if (bonusAmount > 0) {
            const currentDestination = parseFloat(updatedUser.destinationAmount || "0");
            await storage.updateUser(req.session.userId, {
              destinationAmount: (currentDestination + bonusAmount).toFixed(2),
              bonusAdsCount: null,
              bonusAmount: null,
              eBonusBannerUrl: null
            });

            return res.json({
              success: true,
              click,
              earnings: ad.price,
              restricted: false,
              bonusReached: true,
              bonusAdsCount: updatedUser.bonusAdsCount,
              bonusAmount: bonusAmount,
              bannerUrl: eBonusBannerUrl || null
            });
          }
        }

        res.json({ success: true, click, earnings: ad.price, restricted: false });
      }
    } catch (error: any) {
      console.error("Record ad click error:", error);
      const message = error?.message || error?.toString() || "Unknown error";
      res.status(500).json({ error: "Failed to record ad click", details: message });
    }
  });

  // Admin endpoints are handled by modular routes in server/routes/admin/
  // (registered via registerAdminRoutes at the top of this function)

  registerPremiumRoutes(app);
  const httpServer = createServer(app);
  return httpServer;
}
