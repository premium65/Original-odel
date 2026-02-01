import express from "express";
import session from "express-session";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { connectMongoDB } from "./mongodb";
import { registerMongoRoutes } from "./mongoRoutes";
import { createServer as createViteServer } from "vite";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAdmin?: number;
  }
}

async function startServer() {
  // Connect to MongoDB
  await connectMongoDB();
  console.log("MongoDB connected successfully");

  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "odel-ads-secret-key-2025",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api")) {
        console.log(`${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`);
      }
    });
    next();
  });

  // Register MongoDB API routes
  registerMongoRoutes(app);

  // Serve attached_assets folder as static files
  const assetsPath = path.resolve(import.meta.dirname, "..", "attached_assets");
  if (fs.existsSync(assetsPath)) {
    app.use("/attached_assets", express.static(assetsPath));
  }

  // Setup Vite for frontend
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  // Serve frontend for all other routes
  app.use("*", async (req, res, next) => {
    try {
      const clientTemplate = path.resolve(import.meta.dirname, "..", "client", "index.html");
      let template = fs.readFileSync(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${Date.now()}"`
      );
      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  });

  // Start server
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`\n========================================`);
    console.log(`OdelAdsPro Server Running!`);
    console.log(`========================================`);
    console.log(`Local:   http://localhost:${port}`);
    console.log(`Network: http://0.0.0.0:${port}`);
    console.log(`========================================\n`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
