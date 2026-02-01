// Referenced from javascript_database integration blueprint
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import fs from "fs";

neonConfig.webSocketConstructor = ws;

// IMPORTANT: For data to persist across deployments, you MUST use an external database.
// Set DATABASE_URL in Replit Secrets pointing to your Neon (or other) PostgreSQL database.
// The local PostgreSQL module and /tmp/replitdb are EPHEMERAL and will be wiped on each deploy!

// Priority order:
// 1. DATABASE_URL from environment/Replit Secrets (PERSISTENT - use this!)
// 2. /tmp/replitdb (EPHEMERAL - only for development, data WILL be lost on redeploy)
let databaseUrl = process.env.DATABASE_URL;

// Only use /tmp/replitdb as fallback if DATABASE_URL is not already set
if (!databaseUrl && fs.existsSync('/tmp/replitdb')) {
  try {
    const replitDbContent = fs.readFileSync('/tmp/replitdb', 'utf8');
    databaseUrl = replitDbContent.trim();
    console.warn('[DB] WARNING: Using ephemeral /tmp/replitdb - data will be LOST on redeploy!');
    console.warn('[DB] To persist data, set DATABASE_URL in Replit Secrets with your Neon database URL.');
  } catch (error) {
    console.warn('[DB] Failed to read /tmp/replitdb');
  }
}

// DATABASE_URL is optional - on Windows/MongoDB-only setup, this can be undefined
let pool: any;
let db: any;

if (databaseUrl) {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
  console.log('[DB] Connected to PostgreSQL database');
} else {
  console.warn('[DB] DATABASE_URL not set - PostgreSQL storage unavailable.');
  console.warn('[DB] To enable persistent storage, add DATABASE_URL to Replit Secrets.');
}

export { pool, db };
