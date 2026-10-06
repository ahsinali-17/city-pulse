import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env.local for standard Next.js secrets
dotenv.config({ path: ".env.local" });
// Fallback to .env if .env.local doesn't have the variable
dotenv.config({ path: ".env" });

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
