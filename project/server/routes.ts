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
import { mongoStorage } from "./mongoStorage";
import { isMongoConnected } from "./mongoConnection";
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
    userId?: string;
  }
}

// Helper to get numeric userId for PostgreSQL storage
function getNumericUserId(sessionUserId: string | undefined): number | undefined {
  if (!sessionUserId) return undefined;
  const num = Number(sessionUserId);
  return isNaN(num) ? undefined : num;
}

// Helper to get admin user from correct storage
async function getAdminUser(sessionUserId: string | undefined) {
  if (!sessionUserId) return null;
  if (isMongoConnected()) {
    return await mongoStorage.getUser(sessionUserId);
  } else {
    const numId = getNumericUserId(sessionUserId);
    if (!numId) return null;
    return await storage.getUser(numId);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.set('trust proxy', 1);

  app.use(cors({ origin: true, credentials: true }));

  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { secure: true, httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 7 },
  }));

  // ========================================
  // AUTH ENDPOINTS
  // ========================================
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      let existingUsername, existingEmail;
      
      if (isMongoConnected()) {
        existingUsername = await mongoStorage.getUserByUsername(data.username);
        existingEmail = await mongoStorage.getUserByEmail(data.email);
      } else {
        existingUsername = await storage.getUserByUsername(data.username);
        existingEmail = await storage.getUserByEmail(data.email);
      }

      if (existingUsername) return res.status(400).send("Username already exists");
      if (existingEmail) return res.status(400).send("Email already exists");

      const hashedPassword = await hashPassword(data.password);
      
      let user;
      if (isMongoConnected()) {
        user = await mongoStorage.createUser({ ...data, password: hashedPassword } as any);
      } else {
        user = await storage.createUser({ ...data, password: hashedPassword });
      }

      res.json({ success: true, userId: (user as any)._id || (user as any).id });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).send(error.errors[0].message);
      console.error("Registration error:", error);
      res.status(500).send("Registration failed");
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

      let user: any = null;
      if (isMongoConnected()) {
        user = await mongoStorage.getUserByUsername(username);
      } else {
        user = await storage.getUserByUsername(username);
      }

      if (!user) return res.status(401).json({ error: "Invalid username or password" });

      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ error: "Invalid username or password" });

      if (user.status !== "active") {
        if (user.status === "pending") return res.status(403).json({ error: "Your account is pending admin approval" });
        if (user.status === "frozen") return res.status(403).json({ error: "Your account has been suspended" });
        return res.status(403).json({ error: "Account access denied" });
      }

      const userId = user.id || user._id?.toString();
      req.session.userId = String(userId);

      req.session.save((err) => {
        if (err) return res.status(500).json({ error: "Failed to save session" });
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
    if (!req.session.userId) return res.status(401).send("Not authenticated");
    
    const user = await getAdminUser(req.session.userId);
    if (!user) return res.status(404).send("User not found");

    const { password: _, ...userWithoutPassword } = user as any;
    res.json(userWithoutPassword);
  });

  // ========================================
  // RATINGS ENDPOINTS
  // ========================================
  app.post("/api/ratings", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");

      const data = insertRatingSchema.parse(req.body);
      const rating = await storage.createRating({
        ...data,
        oderId: getNumericUserId(req.session.userId)!,
      });

      res.json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).send(error.errors[0].message);
      console.error("Create rating error:", error);
      res.status(500).send("Failed to create rating");
    }
  });

  app.get("/api/ratings/my", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      const ratings = await storage.getUserRatings(getNumericUserId(req.session.userId)!);
      res.json(ratings);
    } catch (error) {
      console.error("Fetch ratings error:", error);
      res.status(500).send("Failed to fetch ratings");
    }
  });

  // ========================================
  // ADS ENDPOINTS
  // ========================================
  app.get("/api/ads", async (req, res) => {
    try {
      const ads = await storage.getAllAds();
      res.json(ads);
    } catch (error) {
      console.error("Fetch ads error:", error);
      res.status(500).send("Failed to fetch ads");
    }
  });

  app.get("/api/ads/click-count", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      
      let count;
      if (isMongoConnected()) {
        count = await mongoStorage.getUserAdClickCount(req.session.userId);
      } else {
        count = await storage.getUserAdClickCount(getNumericUserId(req.session.userId)!);
      }
      res.json({ count });
    } catch (error) {
      console.error("Get ad click count error:", error);
      res.status(500).send("Failed to get ad click count");
    }
  });

  app.post("/api/ads/click", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");

      const { adId } = req.body;
      if (!adId) return res.status(400).send("Ad ID is required");

      const ad = await storage.getAd(adId);
      if (!ad) return res.status(404).send("Ad not found");

      let user: any;
      if (isMongoConnected()) {
        user = await mongoStorage.getUser(req.session.userId);
      } else {
        user = await storage.getUser(getNumericUserId(req.session.userId)!);
      }

      if (!user) return res.status(404).send("User not found");

      // Check restriction
      if (user.restrictionAdsLimit !== null && user.restrictionAdsLimit !== undefined) {
        if (user.restrictedAdsCompleted >= user.restrictionAdsLimit) {
          return res.status(403).json({
            error: "restriction_limit_reached",
            message: `You have reached the maximum of ${user.restrictionAdsLimit} ads.`,
          });
        }

        const commission = user.restrictionCommission || ad.price;
        if (isMongoConnected()) {
          await mongoStorage.addMilestoneReward(req.session.userId, commission);
          await mongoStorage.incrementRestrictedAds(req.session.userId);
          await mongoStorage.incrementAdsCompleted(req.session.userId);
        } else {
          await storage.addMilestoneReward(getNumericUserId(req.session.userId)!, commission);
          await storage.incrementRestrictedAds(getNumericUserId(req.session.userId)!);
          await storage.incrementAdsCompleted(getNumericUserId(req.session.userId)!);
        }

        res.json({
          success: true,
          earnings: commission,
          restricted: true,
          restrictedCount: (user.restrictedAdsCompleted || 0) + 1,
          restrictionLimit: user.restrictionAdsLimit,
        });
      } else {
        // Normal ad click
        if (isMongoConnected()) {
          await mongoStorage.addMilestoneReward(req.session.userId, ad.price);
          await mongoStorage.addMilestoneAmount(req.session.userId, ad.price);
          await mongoStorage.incrementAdsCompleted(req.session.userId);
        } else {
          await storage.addMilestoneReward(getNumericUserId(req.session.userId)!, ad.price);
          await storage.addMilestoneAmount(getNumericUserId(req.session.userId)!, ad.price);
          await storage.incrementAdsCompleted(getNumericUserId(req.session.userId)!);
        }

        res.json({ success: true, earnings: ad.price, restricted: false });
      }
    } catch (error) {
      console.error("Record ad click error:", error);
      res.status(500).send("Failed to record ad click");
    }
  });

  // ========================================
  // ADMIN USER ENDPOINTS - MONGODB FIXED!
  // ========================================
  app.get("/api/admin/users", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      let users;
      if (isMongoConnected()) {
        users = await mongoStorage.getAllUsers();
      } else {
        users = await storage.getAllUsers();
      }

      res.set("Cache-Control", "no-store");
      res.json(users.map(({ password, ...user }: any) => user));
    } catch (error) {
      console.error("Fetch users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/:userId", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      let user;
      if (isMongoConnected()) {
        user = await mongoStorage.getUser(req.params.userId);
      } else {
        user = await storage.getUser(parseInt(req.params.userId));
      }

      if (!user) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = user as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Fetch user error:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/admin/users/:userId/status", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { status } = req.body;
      if (!["pending", "active", "frozen"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      let updatedUser;
      if (isMongoConnected()) {
        updatedUser = await mongoStorage.updateUserStatus(req.params.userId, status);
      } else {
        updatedUser = await storage.updateUserStatus(parseInt(req.params.userId), status);
      }

      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update status error:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // ========================================
  // ADMIN RATINGS
  // ========================================
  app.get("/api/admin/ratings", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const ratings = await storage.getAllRatings();
      res.json(ratings);
    } catch (error) {
      console.error("Fetch ratings error:", error);
      res.status(500).send("Failed to fetch ratings");
    }
  });

  app.delete("/api/admin/ratings/:ratingId", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const ratingId = parseInt(req.params.ratingId);
      await storage.deleteRating(ratingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete rating error:", error);
      res.status(500).send("Failed to delete rating");
    }
  });

  // ========================================
  // WITHDRAWALS
  // ========================================
  app.post("/api/withdrawals", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");

      const { amount } = req.body;
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).send("Invalid amount");
      }

      // Implementation here
      res.json({ success: true, message: "Withdrawal request submitted" });
    } catch (error) {
      console.error("Withdrawal error:", error);
      res.status(500).send("Failed to process withdrawal");
    }
  });

  app.get("/api/withdrawals/my", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      res.json([]);
    } catch (error) {
      console.error("Fetch withdrawals error:", error);
      res.status(500).send("Failed to fetch withdrawals");
    }
  });

  app.get("/api/admin/withdrawals", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      res.json([]);
    } catch (error) {
      console.error("Fetch withdrawals error:", error);
      res.status(500).send("Failed to fetch withdrawals");
    }
  });

  app.get("/api/admin/withdrawals/pending", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      res.json([]);
    } catch (error) {
      console.error("Fetch pending withdrawals error:", error);
      res.status(500).send("Failed to fetch pending withdrawals");
    }
  });

  app.post("/api/admin/withdrawals/:id/approve", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Approve withdrawal error:", error);
      res.status(500).send("Failed to approve withdrawal");
    }
  });

  app.post("/api/admin/withdrawals/:id/reject", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Reject withdrawal error:", error);
      res.status(500).send("Failed to reject withdrawal");
    }
  });

  // ========================================
  // ADMIN DEPOSIT - MONGODB FIXED!
  // ========================================
  app.post("/api/admin/users/:userId/deposit", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { amount } = req.body;
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      let updatedUser;
      if (isMongoConnected()) {
        updatedUser = await mongoStorage.addMilestoneAmount(req.params.userId, String(amount));
      } else {
        updatedUser = await storage.addMilestoneAmount(parseInt(req.params.userId), String(amount));
      }

      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Deposit error:", error);
      res.status(500).json({ error: "Failed to add deposit" });
    }
  });

  // Configure multer for file uploads
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

  // Admin ad management
  app.post("/api/admin/ads", upload.single("image"), async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const adData = insertAdSchema.parse({
        ...req.body,
        imageUrl: req.file ? `/attached_assets/ad_images/${req.file.filename}` : req.body.imageUrl,
      });

      const ad = await storage.createAd(adData);
      res.json(ad);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).send(error.errors[0].message);
      console.error("Create ad error:", error);
      res.status(500).send("Failed to create ad");
    }
  });

  app.put("/api/admin/ads/:id", upload.single("image"), async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const adId = parseInt(req.params.id);
      const updateData: any = { ...req.body };
      
      if (req.file) {
        updateData.imageUrl = `/attached_assets/ad_images/${req.file.filename}`;
      }

      const ad = await storage.updateAd(adId, updateData);
      if (!ad) return res.status(404).send("Ad not found");

      res.json(ad);
    } catch (error) {
      console.error("Update ad error:", error);
      res.status(500).send("Failed to update ad");
    }
  });

  app.delete("/api/admin/ads/:id", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      const adId = parseInt(req.params.id);
      await storage.deleteAd(adId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete ad error:", error);
      res.status(500).send("Failed to delete ad");
    }
  });

  // ========================================
  // PREMIUM MANAGE ENDPOINTS - MONGODB FIXED!
  // ========================================
  app.post("/api/admin/users/:userId/reset", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { field } = req.body;

      let updatedUser;
      if (isMongoConnected()) {
        updatedUser = await mongoStorage.resetUserField(req.params.userId, field);
      } else {
        updatedUser = await storage.resetUserField(parseInt(req.params.userId), field);
      }

      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Reset field error:", error);
      res.status(500).json({ error: "Failed to reset field" });
    }
  });

  app.post("/api/admin/users/:userId/add-value", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { field, amount } = req.body;
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      let updatedUser;
      if (isMongoConnected()) {
        updatedUser = await mongoStorage.addUserFieldValue(req.params.userId, field, String(amount));
      } else {
        updatedUser = await storage.addUserFieldValue(parseInt(req.params.userId), field, String(amount));
      }

      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Add value error:", error);
      res.status(500).json({ error: "Failed to add value" });
    }
  });

  app.patch("/api/admin/users/:userId/details", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { username, mobileNumber, password } = req.body;

      let updatedUser;
      if (isMongoConnected()) {
        updatedUser = await mongoStorage.updateUserDetails(req.params.userId, { username, mobileNumber, password });
      } else {
        updatedUser = await storage.updateUserDetails(parseInt(req.params.userId), { username, mobileNumber, password });
      }

      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user details error:", error);
      res.status(500).json({ error: "Failed to update user details" });
    }
  });

  app.patch("/api/admin/users/:userId/bank", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { bankName, accountNumber, accountHolderName, branchName } = req.body;

      let updatedUser;
      if (isMongoConnected()) {
        updatedUser = await mongoStorage.updateUserBankDetails(req.params.userId, { bankName, accountNumber, accountHolderName, branchName });
      } else {
        updatedUser = await storage.updateUserBankDetails(parseInt(req.params.userId), { bankName, accountNumber, accountHolderName, branchName });
      }

      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update bank details error:", error);
      res.status(500).json({ error: "Failed to update bank details" });
    }
  });

  app.post("/api/admin/users/:userId/restrict", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { adsLimit, deposit, commission, pendingAmount } = req.body;

      if (!adsLimit || adsLimit <= 0) return res.status(400).json({ error: "Invalid ads limit" });
      if (!deposit || parseFloat(deposit) <= 0) return res.status(400).json({ error: "Invalid deposit amount" });
      if (!commission || parseFloat(commission) <= 0) return res.status(400).json({ error: "Invalid commission amount" });

      let updatedUser;
      if (isMongoConnected()) {
        updatedUser = await mongoStorage.setUserRestriction(req.params.userId, adsLimit, deposit, commission, pendingAmount);
      } else {
        updatedUser = await storage.setUserRestriction(parseInt(req.params.userId), adsLimit, deposit, commission, pendingAmount);
      }

      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Set restriction error:", error);
      res.status(500).json({ error: "Failed to set restriction" });
    }
  });

  app.post("/api/admin/users/:userId/unrestrict", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      let updatedUser;
      if (isMongoConnected()) {
        updatedUser = await mongoStorage.removeUserRestriction(req.params.userId);
      } else {
        updatedUser = await storage.removeUserRestriction(parseInt(req.params.userId));
      }

      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Remove restriction error:", error);
      res.status(500).json({ error: "Failed to remove restriction" });
    }
  });

  app.post("/api/admin/users/:userId/toggle-admin", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { isAdmin } = req.body;

      let updatedUser;
      if (isMongoConnected()) {
        updatedUser = await mongoStorage.toggleAdmin(req.params.userId, isAdmin ? 1 : 0);
      } else {
        updatedUser = await storage.updateUser(parseInt(req.params.userId), { isAdmin: isAdmin ? 1 : 0 });
      }

      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = updatedUser as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Toggle admin error:", error);
      res.status(500).json({ error: "Failed to update admin status" });
    }
  });

  // ========================================
  // DEPOSITS MANAGEMENT
  // ========================================
  app.get("/api/admin/deposits", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
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
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { userId, amount } = req.body;
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid user or amount" });
      }

      let user;
      if (isMongoConnected()) {
        user = await mongoStorage.getUser(String(userId));
        if (user) await mongoStorage.addMilestoneAmount(String(userId), String(amount));
      } else {
        user = await storage.getUser(userId);
        if (user) await storage.addMilestoneAmount(userId, String(amount));
      }

      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({ success: true, message: `Added ${amount} to ${(user as any).username}'s balance` });
    } catch (error) {
      console.error("Create deposit error:", error);
      res.status(500).json({ error: "Failed to create deposit" });
    }
  });

  // Commission history
  app.get("/api/admin/commissions", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).send("Not authenticated");
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).send("Admin access required");
      }

      res.json([]);
    } catch (error) {
      console.error("Get commissions error:", error);
      res.status(500).send("Failed to fetch commissions");
    }
  });

  // ========================================
  // SETTINGS API - MONGODB STORAGE
  // ========================================
  
  // Contact Settings
  app.get("/api/admin/settings/contact", async (req, res) => {
    try {
      if (isMongoConnected()) {
        const settings = await mongoStorage.getSettings("contact");
        res.json(settings.map(s => ({ type: s.type, data: s.data })));
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact settings" });
    }
  });

  app.post("/api/admin/settings/contact", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { type, items, data } = req.body;
      if (isMongoConnected()) {
        if (items) {
          for (const item of items) {
            await mongoStorage.saveSettings("contact", item.type || type, item);
          }
        } else {
          await mongoStorage.saveSettings("contact", type, data);
        }
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save contact settings" });
    }
  });

  // Pages Settings
  app.get("/api/admin/settings/pages", async (req, res) => {
    try {
      if (isMongoConnected()) {
        const settings = await mongoStorage.getSettings("pages");
        res.json(settings.map(s => ({ type: s.type, ...s.data })));
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.post("/api/admin/settings/pages", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { type, title, content, isActive, data } = req.body;
      if (isMongoConnected()) {
        await mongoStorage.saveSettings("pages", type, { title, content, isActive, ...data });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save page" });
    }
  });

  // Content Settings
  app.get("/api/admin/settings/content", async (req, res) => {
    try {
      if (isMongoConnected()) {
        const settings = await mongoStorage.getSettings("content");
        res.json(settings.map(s => ({ type: s.type, data: s.data })));
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content settings" });
    }
  });

  app.post("/api/admin/settings/content", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { type, data } = req.body;
      if (isMongoConnected()) {
        await mongoStorage.saveSettings("content", type, data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save content" });
    }
  });

  // Theme Settings
  app.get("/api/admin/settings/theme", async (req, res) => {
    try {
      if (isMongoConnected()) {
        const settings = await mongoStorage.getSettings("theme");
        res.json(settings.map(s => ({ type: s.type, data: s.data })));
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch theme settings" });
    }
  });

  app.post("/api/admin/settings/theme", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { type, data } = req.body;
      if (isMongoConnected()) {
        await mongoStorage.saveSettings("theme", type || "theme", data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save theme" });
    }
  });

  // Branding Settings
  app.get("/api/admin/settings/branding", async (req, res) => {
    try {
      if (isMongoConnected()) {
        const settings = await mongoStorage.getSettings("branding");
        res.json(settings.map(s => ({ type: s.type, data: s.data })));
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch branding settings" });
    }
  });

  app.post("/api/admin/settings/branding", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { type, data } = req.body;
      if (isMongoConnected()) {
        await mongoStorage.saveSettings("branding", type || "branding", data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save branding" });
    }
  });

  // Slideshow Settings
  app.get("/api/admin/settings/slideshow", async (req, res) => {
    try {
      if (isMongoConnected()) {
        const slides = await mongoStorage.getSlideshow();
        res.json(slides);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slideshow" });
    }
  });

  app.get("/api/slideshow", async (req, res) => {
    try {
      if (isMongoConnected()) {
        const slides = await mongoStorage.getSlideshow();
        res.json(slides.filter((s: any) => s.isActive !== false));
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slideshow" });
    }
  });

  app.post("/api/admin/settings/slideshow", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      if (isMongoConnected()) {
        const slide = await mongoStorage.addSlide(req.body);
        res.json({ success: true, slide });
      } else {
        res.json({ success: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to save slideshow" });
    }
  });

  app.put("/api/admin/settings/slideshow/:id", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      if (isMongoConnected()) {
        const slide = await mongoStorage.updateSlide(req.params.id, req.body);
        if (!slide) return res.status(404).json({ error: "Slide not found" });
        res.json({ success: true, slide });
      } else {
        res.json({ success: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update slideshow" });
    }
  });

  app.delete("/api/admin/settings/slideshow/:id", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      
      const currentUser = await getAdminUser(req.session.userId);
      if (!currentUser || (currentUser as any).isAdmin !== 1) {
        return res.status(403).json({ error: "Admin access required" });
      }

      if (isMongoConnected()) {
        await mongoStorage.deleteSlide(req.params.id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete slideshow" });
    }
  });

  // Public settings API
  app.get("/api/public/settings", async (req, res) => {
    try {
      if (isMongoConnected()) {
        const [contact, pages, content, theme, branding] = await Promise.all([
          mongoStorage.getSettings("contact"),
          mongoStorage.getSettings("pages"),
          mongoStorage.getSettings("content"),
          mongoStorage.getSettings("theme"),
          mongoStorage.getSettings("branding"),
        ]);
        const slideshow = await mongoStorage.getSlideshow();
        
        res.json({
          contact: contact.map(s => ({ type: s.type, data: s.data })),
          pages: pages.map(s => ({ type: s.type, ...s.data })),
          content: content.map(s => ({ type: s.type, data: s.data })),
          theme: theme.map(s => ({ type: s.type, data: s.data })),
          branding: branding.map(s => ({ type: s.type, data: s.data })),
          slideshow: slideshow.filter((s: any) => s.isActive !== false),
        });
      } else {
        res.json({ contact: [], pages: [], content: [], theme: [], branding: [], slideshow: [] });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Settings API for dashboard
  app.get("/api/settings", async (req, res) => {
    try {
      if (isMongoConnected()) {
        const theme = await mongoStorage.getSettings("theme");
        const themeData = theme.find(t => t.type === "theme");
        res.json(themeData?.data || {});
      } else {
        res.json({});
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  registerPremiumRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
