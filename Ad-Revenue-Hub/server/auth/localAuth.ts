import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

export function getSession() {
  const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;

  const PgStore = connectPg(session);
  const store = new PgStore({
    conString: process.env.DATABASE_URL,
    // On Render you want this TRUE so sessions table is created if missing
    createTableIfMissing: true,
    tableName: "sessions",
    ttl: sessionTtlMs,
  });

  return session({
    secret: process.env.SESSION_SECRET || "change-me",
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // Render is HTTPS in production
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtlMs,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const [user] = await db.select().from(users).where(eq(users.email, email));
          if (!user || !user.passwordHash) return done(null, false, { message: "Invalid credentials" });

          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return done(null, false, { message: "Invalid credentials" });

          // Only store minimal info in session
          return done(null, { id: user.id });
        } catch (e) {
          return done(e);
        }
      }
    )
  );

  passport.serializeUser((user: any, cb) => cb(null, user.id));
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (!user) return cb(null, false);
      cb(null, user);
    } catch (e) {
      cb(e);
    }
  });

  // Auth APIs
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, firstName, lastName } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Email + password required" });

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) return res.status(409).json({ message: "Email already used" });

    const passwordHash = await bcrypt.hash(password, 10);

    const [created] = await db
      .insert(users)
      .values({
        email,
        firstName,
        lastName,
        passwordHash,
        milestoneAmount: "25000",
        status: "pending",
      })
      .returning();

    // auto-login after register
    req.login({ id: created.id }, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      res.json(created);
    });
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ message: "Login error" });
      if (!user) return res.status(401).json({ message: info?.message || "Unauthorized" });

      req.logIn(user, (e) => {
        if (e) return res.status(500).json({ message: "Login error" });
        return res.json({ ok: true });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      req.session?.destroy(() => res.json({ ok: true }));
    });
  });

  app.get("/api/auth/user", isAuthenticated, (req: any, res) => {
    res.json(req.user); // full user row
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};
