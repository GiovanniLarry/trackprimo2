import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is not set");
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
