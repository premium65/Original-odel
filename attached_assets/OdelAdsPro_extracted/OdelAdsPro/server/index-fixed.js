import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";

// Load .env file FIRST
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'odel-ads-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Load environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/odeladspro';

console.log("Loaded MONGO_URL:", MONGO_URL);

// Connect to MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✔ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("OdelAdsPro Server Running");
});

// Import Routes
import authRoutes from "./routes/auth.js";
import { adminRoutes } from "./routes/admin-fixed.js";
import adsRoutes from "./routes/ads-fixed.js";
import { withdrawalRoutes } from "./routes/withdrawals-fixed.js";
import userRoutes from "./routes/users-fixed.js";
import ratingRoutes from "./routes/ratings-fixed.js";

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ads", adsRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ratings", ratingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
