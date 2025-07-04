// server/drizzle.config.mjs
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  // Path to your Drizzle schema file
  schema: "../shared/schema.ts",

  // Where to write migration files
  out: "./migrations",

  // Database dialect
  dialect: "postgresql",

  // Connection details (a full Postgres URL or split into host/user/password, etc.)
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
