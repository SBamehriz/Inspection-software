// server/src/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";

dotenv.config();

// Create a Postgres pool pointing at your Docker‐mapped port
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Wrap it in Drizzle
export const db = drizzle(pool);
