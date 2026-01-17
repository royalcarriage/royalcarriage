import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../shared/schema";

// Get database URL from environment
const getDatabaseUrl = (): string => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    // For development, use a default local PostgreSQL connection
    console.warn("DATABASE_URL not set, using default local connection");
    return "postgresql://localhost:5432/royalcarriage";
  }

  return dbUrl;
};

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: getDatabaseUrl(),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection on startup
pool.on("connect", () => {
  console.log("✓ Database connection established");
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
  process.exit(-1);
});

// Create Drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export pool for direct queries if needed
export { pool };

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
