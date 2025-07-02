// server/drizzle.config.mjs
import dotenv from "dotenv";
dotenv.config();

export default {
  // Path to your Drizzle schema file
  schema: "../shared/schema.ts",

  // Where to write migration files
  out: "./migrations",

  // Must be called "dialect"
  dialect: "postgresql",

  // How to connect
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};