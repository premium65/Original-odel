import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.static(path.join(__dirname, "../client/dist")));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || "odel-ads-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/odeladspro";

console.log("Connecting to:", MONGO_URL);

mongoose.connect(MONGO_URL)
  .then(() => console.log("✔ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Import all routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin-fixed.js";
import adsRoutes from "./routes/ads-fixed.js";
import withdrawalRoutes from "./routes/withdrawals-fixed.js";
import ratingRoutes from "./routes/ratings-fixed.js";
import userRoutes from "./routes/users-fixed.js";

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ads", adsRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server running" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Server running on http://0.0.0.0:${PORT}`);
});
