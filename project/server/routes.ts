import type { Express } from "express";
import { registerPremiumRoutes } from "./premiumRoutes";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRatingSchema, insertAdSchema } from "@shared/schema";
import session from "express-session";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";

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

// In-memory storage for settings (CMS)
const settingsStore: Record<string, any[]> = {
  contact: [],
  pages: [],
  content: [],
  theme: [],
  branding: [],
  slideshow: [],
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy for secure cookies
  app.set('trust proxy', 1);

  // CORS
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  }));

  // Session
  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }));

  // ========================================
  // AUTH ROUTES
  // ========================================
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUsername = await storage.getUserByUsername(data.username);
      const existingEmail = await storage.getUserByEmail(data.email);

      if (existingUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({ ...data, password: hashedPassword });

      res.json({ 
        success: true, 
        message: "Registration successful. Please wait for admin approval.",
        userId: user.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
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
        }
        if (user.status === "frozen") {
          return res.status(403).json({ error: "Your account has been suspended" });
        }
        return res.status(403).json({ error: "Account access denied" });
      }

      req.session.userId = user.id;

      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to save session" });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ========================================
  // RATINGS ROUTES
  // ========================================
  
  app.post("/api/ratings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const data = insertRatingSchema.parse(req.body);
      const rating = await storage.createRating({
        ...data,
        oderId: req.session.userId,
      });

      res.json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Create rating error:", error);
      res.status(500).json({ error: "Failed to create rating" });
    }
  });

  app.get("/api/ratings/my", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const ratings = await storage.getUserRatings(req.session.userId);
      res.json(ratings);
    } catch (error) {
      console.error("Fetch ratings error:", error);
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });

  app.get("/api/ratings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const ratings = await storage.getUserRatings(userId);
      res.json(ratings);
    } catch (error) {
      console.error("Fetch user ratings error:", error);
      res.status(500).json({ error: "Failed to fetch user ratings" });
    }
  });

  // ========================================
  // ADS ROUTES
  // ========================================
  
  app.get("/api/ads", async (req, res) => {
    try {
      const ads = await storage.getAllAds();
      res.json(ads);
    } catch (error) {
      console.error("Fetch ads error:", error);
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  app.get("/api/ads/:id", async (req, res) => {
    try {
      const adId = parseInt(req.params.id);
      const ad = await storage.getAd(adId);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }
      res.json(ad);
    } catch (error) {
      console.error("Fetch ad error:", error);
      res.status(500).json({ error: "Failed to fetch ad" });
    }
  });

  app.get("/api/ads/click-count", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const count = await storage.getUserAdClickCount(req.session.userId);
      res.json({ count });
    } catch (error) {
      console.error("Get ad click count error:", error);
      res.status(500).json({ error: "Failed to get ad click count" });
    }
  });

  app.post("/api/ads/click", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { adId } = req.body;
      if (!adId) {
        return res.status(400).json({ error: "Ad ID is required" });
      }

      const ad = await storage.getAd(adId);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check restriction
      if (user.restrictionAdsLimit !== null && user.restrictionAdsLimit !== undefined) {
        if ((user.restrictedAdsCompleted || 0) >= user.restrictionAdsLimit) {
          return res.status(403).json({
            error: "restriction_limit_reached",
            message: `You have completed all ${user.restrictionAdsLimit} ads.`,
            restrictedCount: user.restrictedAdsCompleted,
            restrictionLimit: user.restrictionAdsLimit,
          });
        }

        const commission = user.restrictionCommission || ad.price;
        await storage.addMilestoneReward(req.session.userId, commission);
        await storage.incrementRestrictedAds(req.session.userId);
        await storage.incrementAdsCompleted(req.session.userId);

        res.json({
          success: true,
          earnings: commission,
          restricted: true,
          restrictedCount: (user.restrictedAdsCompleted || 0) + 1,
          restrictionLimit: user.restrictionAdsLimit,
        });
      } else {
        await storage.addMilestoneReward(req.session.userId, ad.price);
        await storage.addMilestoneAmount(req.session.userId, String(ad.price));
        await storage.incrementAdsCompleted(req.session.userId);

        res.json({
          success: true,
          earnings: ad.price,
          restricted: false,
        });
      }
    } catch (error) {
      console.error("Record ad click error:", error);
      res.status(500).json({ error: "Failed to record ad click" });
    }
  });

  // ========================================
  // ADMIN - USER MANAGEMENT
  // ========================================
  
  app.get("/api/admin/users", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.set("Cache-Control", "no-store");
      res.json(users.map(({ password, ...user }) => user));
    } catch (error) {
      console.error("Fetch users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/:userId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const user = await storage.getUser(parseInt(req.params.userId));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Fetch user error:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/admin/users/:userId/status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { status } = req.body;
      if (!["pending", "active", "frozen"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedUser = await storage.updateUserStatus(parseInt(req.params.userId), status);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update status error:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  app.delete("/api/admin/users/:userId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      await storage.deleteUser(parseInt(req.params.userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ========================================
  // ADMIN - RATINGS
  // ========================================
  
  app.get("/api/admin/ratings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const ratings = await storage.getAllRatings();
      res.json(ratings);
    } catch (error) {
      console.error("Fetch ratings error:", error);
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });

  app.delete("/api/admin/ratings/:ratingId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      await storage.deleteRating(parseInt(req.params.ratingId));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete rating error:", error);
      res.status(500).json({ error: "Failed to delete rating" });
    }
  });

  // ========================================
  // WITHDRAWALS
  // ========================================
  
  app.post("/api/withdrawals", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { amount } = req.body;
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      res.json({ success: true, message: "Withdrawal request submitted" });
    } catch (error) {
      console.error("Withdrawal error:", error);
      res.status(500).json({ error: "Failed to process withdrawal" });
    }
  });

  app.get("/api/withdrawals/my", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      res.json([]);
    } catch (error) {
      console.error("Fetch withdrawals error:", error);
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  app.get("/api/admin/withdrawals", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      res.json([]);
    } catch (error) {
      console.error("Fetch withdrawals error:", error);
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  app.get("/api/admin/withdrawals/pending", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      res.json([]);
    } catch (error) {
      console.error("Fetch pending withdrawals error:", error);
      res.status(500).json({ error: "Failed to fetch pending withdrawals" });
    }
  });

  app.post("/api/admin/withdrawals/:id/approve", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Approve withdrawal error:", error);
      res.status(500).json({ error: "Failed to approve withdrawal" });
    }
  });

  app.post("/api/admin/withdrawals/:id/reject", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Reject withdrawal error:", error);
      res.status(500).json({ error: "Failed to reject withdrawal" });
    }
  });

  // ========================================
  // ADMIN - DEPOSITS
  // ========================================
  
  app.post("/api/admin/users/:userId/deposit", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { amount } = req.body;
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const updatedUser = await storage.addMilestoneAmount(parseInt(req.params.userId), String(amount));
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Deposit error:", error);
      res.status(500).json({ error: "Failed to add deposit" });
    }
  });

  app.get("/api/admin/deposits", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      res.json([]);
    } catch (error) {
      console.error("Get deposits error:", error);
      res.status(500).json({ error: "Failed to fetch deposits" });
    }
  });

  app.post("/api/admin/deposits", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { userId, amount } = req.body;
      if (!userId || !amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid user or amount" });
      }

      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.addMilestoneAmount(parseInt(userId), String(amount));
      res.json({ success: true, message: `Added ${amount} to ${user.username}'s balance` });
    } catch (error) {
      console.error("Create deposit error:", error);
      res.status(500).json({ error: "Failed to create deposit" });
    }
  });

  app.get("/api/admin/commissions", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      res.json([]);
    } catch (error) {
      console.error("Get commissions error:", error);
      res.status(500).json({ error: "Failed to fetch commissions" });
    }
  });

  // ========================================
  // ADMIN - AD MANAGEMENT
  // ========================================
  
  const uploadDir = path.join(process.cwd(), "attached_assets", "ad_images");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
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
      if (extname && mimetype) cb(null, true);
      else cb(new Error("Only image files are allowed!"));
    },
  });

  app.post("/api/admin/ads", upload.single("image"), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const adData = insertAdSchema.parse({
        ...req.body,
        imageUrl: req.file ? `/attached_assets/ad_images/${req.file.filename}` : req.body.imageUrl,
      });

      const ad = await storage.createAd(adData);
      res.json(ad);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Create ad error:", error);
      res.status(500).json({ error: "Failed to create ad" });
    }
  });

  app.put("/api/admin/ads/:id", upload.single("image"), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const adId = parseInt(req.params.id);
      const updateData: any = { ...req.body };
      if (req.file) {
        updateData.imageUrl = `/attached_assets/ad_images/${req.file.filename}`;
      }

      const ad = await storage.updateAd(adId, updateData);
      if (!ad) return res.status(404).json({ error: "Ad not found" });

      res.json(ad);
    } catch (error) {
      console.error("Update ad error:", error);
      res.status(500).json({ error: "Failed to update ad" });
    }
  });

  app.delete("/api/admin/ads/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      await storage.deleteAd(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete ad error:", error);
      res.status(500).json({ error: "Failed to delete ad" });
    }
  });

  // ========================================
  // PREMIUM MANAGE - USER OPERATIONS
  // ========================================
  
  app.post("/api/admin/users/:userId/reset", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { field } = req.body;
      const updatedUser = await storage.resetUserField(parseInt(req.params.userId), field);
      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Reset field error:", error);
      res.status(500).json({ error: "Failed to reset field" });
    }
  });

  app.post("/api/admin/users/:userId/add-value", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { field, amount } = req.body;
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const updatedUser = await storage.addUserFieldValue(parseInt(req.params.userId), field, String(amount));
      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Add value error:", error);
      res.status(500).json({ error: "Failed to add value" });
    }
  });

  app.patch("/api/admin/users/:userId/details", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { username, mobileNumber, password } = req.body;
      const updatedUser = await storage.updateUserDetails(parseInt(req.params.userId), { username, mobileNumber, password });
      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user details error:", error);
      res.status(500).json({ error: "Failed to update user details" });
    }
  });

  app.patch("/api/admin/users/:userId/bank", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { bankName, accountNumber, accountHolderName, branchName } = req.body;
      const updatedUser = await storage.updateUserBankDetails(parseInt(req.params.userId), { bankName, accountNumber, accountHolderName, branchName });
      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update bank details error:", error);
      res.status(500).json({ error: "Failed to update bank details" });
    }
  });

  app.post("/api/admin/users/:userId/restrict", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { adsLimit, deposit, commission, pendingAmount } = req.body;

      if (!adsLimit || adsLimit <= 0) return res.status(400).json({ error: "Invalid ads limit" });
      if (!deposit || parseFloat(deposit) <= 0) return res.status(400).json({ error: "Invalid deposit" });
      if (!commission || parseFloat(commission) <= 0) return res.status(400).json({ error: "Invalid commission" });

      const updatedUser = await storage.setUserRestriction(parseInt(req.params.userId), adsLimit, deposit, commission, pendingAmount);
      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Set restriction error:", error);
      res.status(500).json({ error: "Failed to set restriction" });
    }
  });

  app.post("/api/admin/users/:userId/unrestrict", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const updatedUser = await storage.removeUserRestriction(parseInt(req.params.userId));
      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Remove restriction error:", error);
      res.status(500).json({ error: "Failed to remove restriction" });
    }
  });

  app.post("/api/admin/users/:userId/toggle-admin", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { isAdmin } = req.body;
      const updatedUser = await storage.updateUser(parseInt(req.params.userId), { isAdmin: isAdmin ? 1 : 0 });
      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Toggle admin error:", error);
      res.status(500).json({ error: "Failed to update admin status" });
    }
  });

  // ========================================
  // SETTINGS API (IN-MEMORY)
  // ========================================
  
  // Contact Settings
  app.get("/api/admin/settings/contact", async (req, res) => {
    try {
      res.json(settingsStore.contact.map(s => ({ type: s.type, data: s.data || s })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact settings" });
    }
  });

  app.post("/api/admin/settings/contact", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) return res.status(403).json({ error: "Admin access required" });

      const { type, items, data } = req.body;
      if (items) {
        for (const item of items) {
          const idx = settingsStore.contact.findIndex(s => s.type === (item.type || type));
          if (idx >= 0) settingsStore.contact[idx] = { type: item.type || type, data: item };
          else settingsStore.contact.push({ type: item.type || type, data: item });
        }
      } else {
        const idx = settingsStore.contact.findIndex(s => s.type === type);
        if (idx >= 0) settingsStore.contact[idx] = { type, data };
        else settingsStore.contact.push({ type, data });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save contact settings" });
    }
  });

  // Pages Settings
  app.get("/api/admin/settings/pages", async (req, res) => {
    try {
      res.json(settingsStore.pages.map(s => ({ type: s.type, ...s.data })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.post("/api/admin/settings/pages", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) return res.status(403).json({ error: "Admin access required" });

      const { type, title, content, isActive, data } = req.body;
      const idx = settingsStore.pages.findIndex(s => s.type === type);
      const pageData = { type, data: { title, content, isActive, ...data } };
      if (idx >= 0) settingsStore.pages[idx] = pageData;
      else settingsStore.pages.push(pageData);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save page" });
    }
  });

  // Content Settings
  app.get("/api/admin/settings/content", async (req, res) => {
    try {
      res.json(settingsStore.content.map(s => ({ type: s.type, data: s.data })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content settings" });
    }
  });

  app.post("/api/admin/settings/content", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) return res.status(403).json({ error: "Admin access required" });

      const { type, data } = req.body;
      const idx = settingsStore.content.findIndex(s => s.type === type);
      if (idx >= 0) settingsStore.content[idx] = { type, data };
      else settingsStore.content.push({ type, data });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save content" });
    }
  });

  // Theme Settings
  app.get("/api/admin/settings/theme", async (req, res) => {
    try {
      res.json(settingsStore.theme.map(s => ({ type: s.type, data: s.data })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch theme settings" });
    }
  });

  app.post("/api/admin/settings/theme", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) return res.status(403).json({ error: "Admin access required" });

      const { type, data } = req.body;
      const idx = settingsStore.theme.findIndex(s => s.type === (type || "theme"));
      if (idx >= 0) settingsStore.theme[idx] = { type: type || "theme", data };
      else settingsStore.theme.push({ type: type || "theme", data });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save theme" });
    }
  });

  // Branding Settings
  app.get("/api/admin/settings/branding", async (req, res) => {
    try {
      res.json(settingsStore.branding.map(s => ({ type: s.type, data: s.data })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch branding settings" });
    }
  });

  app.post("/api/admin/settings/branding", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) return res.status(403).json({ error: "Admin access required" });

      const { type, data } = req.body;
      const idx = settingsStore.branding.findIndex(s => s.type === (type || "branding"));
      if (idx >= 0) settingsStore.branding[idx] = { type: type || "branding", data };
      else settingsStore.branding.push({ type: type || "branding", data });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save branding" });
    }
  });

  // ========================================
  // SLIDESHOW SETTINGS
  // ========================================
  
  app.get("/api/admin/settings/slideshow", async (req, res) => {
    try {
      res.json(settingsStore.slideshow);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slideshow" });
    }
  });

  app.get("/api/slideshow", async (req, res) => {
    try {
      res.json(settingsStore.slideshow.filter(s => s.isActive !== false));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slideshow" });
    }
  });

  app.post("/api/admin/settings/slideshow", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) return res.status(403).json({ error: "Admin access required" });

      const slide = { ...req.body, id: Date.now().toString() };
      settingsStore.slideshow.push(slide);
      res.json({ success: true, slide });
    } catch (error) {
      res.status(500).json({ error: "Failed to save slideshow" });
    }
  });

  app.put("/api/admin/settings/slideshow/:id", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) return res.status(403).json({ error: "Admin access required" });

      const idx = settingsStore.slideshow.findIndex(s => s.id === req.params.id);
      if (idx < 0) return res.status(404).json({ error: "Slide not found" });
      
      settingsStore.slideshow[idx] = { ...settingsStore.slideshow[idx], ...req.body };
      res.json({ success: true, slide: settingsStore.slideshow[idx] });
    } catch (error) {
      res.status(500).json({ error: "Failed to update slideshow" });
    }
  });

  app.delete("/api/admin/settings/slideshow/:id", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.isAdmin !== 1) return res.status(403).json({ error: "Admin access required" });

      settingsStore.slideshow = settingsStore.slideshow.filter(s => s.id !== req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete slideshow" });
    }
  });

  // ========================================
  // PUBLIC SETTINGS API
  // ========================================
  
  app.get("/api/public/settings", async (req, res) => {
    try {
      res.json({
        contact: settingsStore.contact.map(s => ({ type: s.type, data: s.data || s })),
        pages: settingsStore.pages.map(s => ({ type: s.type, ...s.data })),
        content: settingsStore.content.map(s => ({ type: s.type, data: s.data })),
        theme: settingsStore.theme.map(s => ({ type: s.type, data: s.data })),
        branding: settingsStore.branding.map(s => ({ type: s.type, data: s.data })),
        slideshow: settingsStore.slideshow.filter(s => s.isActive !== false),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const themeData = settingsStore.theme.find(t => t.type === "theme");
      res.json(themeData?.data || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // ========================================
  // REGISTER PREMIUM ROUTES & CREATE SERVER
  // ========================================
  
  registerPremiumRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
