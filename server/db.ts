// Referenced from javascript_database integration blueprint
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import fs from "fs";

neonConfig.webSocketConstructor = ws;

// For production deployments, Replit stores DATABASE_URL in /tmp/replitdb
// For development, it's in process.env.DATABASE_URL
let databaseUrl = process.env.DATABASE_URL;

// Check if running in production deployment
if (fs.existsSync('/tmp/replitdb')) {
  try {
    const replitDbContent = fs.readFileSync('/tmp/replitdb', 'utf8');
    databaseUrl = replitDbContent.trim();
  } catch (error) {
    console.warn('Failed to read /tmp/replitdb, falling back to DATABASE_URL env var');
  }
}

// DATABASE_URL is optional - on Windows/MongoDB-only setup, this can be undefined
let pool: any;
let db: any;

if (databaseUrl) {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
} else {
  console.warn('DATABASE_URL not set - PostgreSQL storage unavailable. Using MongoDB only.');
}

export { pool, db };
