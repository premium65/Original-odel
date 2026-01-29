import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import PgSessionFactory from "connect-pg-simple";
import { Pool } from "pg";

import { storage } from "../storage";

/**
 * IMPORTANT:
 * - Render/Reverse proxies need: app.set("trust proxy", 1)
 * - If you run behind HTTPS proxy (Render), secure cookies require trust proxy.
 * - Put SESSION_SECRET in Render Environment Variables.
 */

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // passport adds isAuthenticated()
  if ((req as any).isAuthenticated?.()) return next();
  return res.status(401).json({ message: "Unauthorized" });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    // Fail fast so you don't deploy with a broken auth config
    throw new Error("SESSION_SECRET is missing. Set it in your environment variables.");
  }

  // Postgres-backed session store (uses DATABASE_URL on Render/Neon)
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing. Set it in your environment variables.");
  }

  const PgSession = PgSessionFactory(session);

  // Use a pool so connect-pg-simple can reuse connections
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  });

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        // IMPORTANT: in production on Render, requests are HTTPS via proxy
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(user as any).passwordHash) {
            return done(null, false, { message: "Invalid credentials" });
          }

          const ok = await bcrypt.compare(password, (user as any).passwordHash);
          if (!ok) return done(null, false, { message: "Invalid credentials" });

          return done(null, { id: (user as any).id });
        } catch (err) {
          return done(err as any);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err as any);
    }
  });

  // ===== AUTH ROUTES (User) =====
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = (req.body ?? {}) as any;

      if (!email || !password) {
        return res.status(400).json({ message: "Email + password required" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email already used" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Create user with "pending" by default (matches your admin approval flow)
      const created = await storage.createUser({
        email,
        firstName,
        lastName,
        passwordHash,
        status: "pending",
        milestoneAmount: "25000",
      });

      req.login({ id: (created as any).id }, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        return res.json(created);
      });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ message: "Register failed" });
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ message: "Login error" });
      if (!user) return res.status(401).json({ message: info?.message || "Unauthorized" });

      req.logIn(user, (err2) => {
        if (err2) return res.status(500).json({ message: "Login error" });
        return res.json({ ok: true });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    // passport@0.6 requires callback
    (req as any).logout(() => {
      (req.session as any)?.destroy(() => res.json({ ok: true }));
    });
  });

  app.get("/api/auth/user", isAuthenticated, (req: Request, res: Response) => {
    return res.json(req.user);
  });
}
