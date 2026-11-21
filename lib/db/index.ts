import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * One pool per server instance. `DATABASE_URL` is the pooled Neon URL in
 * production and a local Postgres in CI; the pool only connects on the first query.
 */
const globalForDb = globalThis as unknown as { dbPool?: Pool };

const pool =
  globalForDb.dbPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

// in dev, hot reloads would open a new pool on every edit
if (process.env.NODE_ENV !== "production") globalForDb.dbPool = pool;

export const db = drizzle(pool, { schema });

export type Db = typeof db;
