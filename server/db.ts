// Database connection for PostgreSQL (Neon serverless)
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Get DATABASE_URL from environment variables
// Set this in your .env file or hosting platform (Vercel, Railway, Render, etc.)
const databaseUrl = process.env.DATABASE_URL;

let pool: any;
let db: any;

if (databaseUrl) {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
  console.log('[DB] Connected to PostgreSQL database');
} else {
  console.warn('[DB] DATABASE_URL not set - PostgreSQL storage unavailable.');
  console.warn('[DB] Add DATABASE_URL to your .env file or environment variables.');
}

export { pool, db };
