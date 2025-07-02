// server/drizzle.config.mjs
import dotenv from "dotenv";
dotenv.config();

export default {
  // Path to your Drizzle schema file
  schema: "./src/schema.ts",

  // Where to write migration files
  out: "./migrations",

  // Must be called "dialect"
  dialect: "pg",

  // How to connect
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};