import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL is handled automatically via DATABASE_URL connection string parameters
  // For Neon and other managed PostgreSQL services, the connection string includes ?sslmode=require
});

export const db = drizzle(pool, { schema });
