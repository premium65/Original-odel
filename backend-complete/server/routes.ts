import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRatingSchema, insertAdSchema } from "@shared/schema";
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
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );

  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration request received:", JSON.stringify(req.body));
      const data = insertUserSchema.parse(req.body);
      console.log("Parsed registration data:", data);

      // Check if username or email already exists
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

      // Hash password and create user
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

      // CRITICAL: Only allow active users to login
      if (user.status !== "active") {
        if (user.status === "pending") {
          return res.status(403).send("Your account is pending admin approval");
        } else if (user.status === "frozen") {
          return res.status(403).send("Your account has been suspended");
        }
        return res.status(403).send("Account access denied");
      }

      // Set session
      req.session.userId = user.id;

      // Return user info (without password)
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

  // Rating endpoints
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

      // Verify target user exists
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
      
      // If user is authenticated, include their click history
      if (req.session.userId) {
        const userClicks = await storage.getUserAdClicks(req.session.userId);
        
        // Create a map of ad ID to last click time
        const clickMap = new Map<number, Date>();
        userClicks.forEach(click => {
          const existing = clickMap.get(click.adId);
          if (!existing || new Date(click.clickedAt) > existing) {
            clickMap.set(click.adId, new Date(click.clickedAt));
          }
        });
        
        // Add lastClickedAt to each ad
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

      // Get user to check for restrictions
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Check if user has an active restriction
      if (user.restrictionAdsLimit !== null && user.restrictionAdsLimit !== undefined) {
        // Check if user has reached the restriction limit BEFORE processing
        if (user.restrictedAdsCompleted >= user.restrictionAdsLimit) {
          return res.status(403).json({ 
            error: "restriction_limit_reached",
            message: `You have reached the maximum of ${user.restrictionAdsLimit} ads allowed under restriction.`
          });
        }

        // Record click
        const click = await storage.recordAdClick(req.session.userId, adId);
        
        // Increment restricted ads counter AFTER successful click
        await storage.incrementRestrictedAds(req.session.userId);
        
        // Under restriction: commission goes to Milestone Reward only
        const commission = user.restrictionCommission || ad.price;
        await storage.addMilestoneReward(req.session.userId, commission);
        
        // Update ongoing milestone (reduce pending amount)
        const currentOngoing = parseFloat(user.ongoingMilestone || "0");
        const commissionValue = parseFloat(commission);
        const newOngoing = Math.max(0, currentOngoing - commissionValue);
        await storage.resetUserField(req.session.userId, "ongoingMilestone");
        if (newOngoing > 0) {
          await storage.addUserFieldValue(req.session.userId, "ongoingMilestone", newOngoing.toFixed(2));
        }
        
        // Increment total ads completed counter
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
        // Record click
        const click = await storage.recordAdClick(req.session.userId, adId);
        
        // Add commission to milestone reward (total ad earnings tracker)
        await storage.addMilestoneReward(req.session.userId, ad.price);
        
        // Add commission to milestone amount (withdrawable balance)
        await storage.addMilestoneAmount(req.session.userId, ad.price);
        
        // Increment total ads completed counter
        await storage.incrementAdsCompleted(req.session.userId);
        
        // Get total clicks to check if this is the first ad
        const totalClicks = await storage.getUserAdClickCount(req.session.userId);
        
        // Reset destination amount to 0 after first ad
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

  // Admin endpoints
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
      
      // Disable caching to ensure fresh data after mutations
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      
      // Remove passwords from response
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

  // Ratings endpoints
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

  // Withdrawal endpoints
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

  // Admin withdrawal endpoints
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

  // Admin deposit endpoint
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

  // Configure multer for file uploads
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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

  // Admin ad management endpoints
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

      // If new image is uploaded, delete old one and use new one
      if (req.file) {
        // Delete old image
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

      // Delete the image file if it exists
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

  // Premium management endpoints
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

      // Reset the specified field to 0
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

  // Set user restriction
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

  // Remove user restriction
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
