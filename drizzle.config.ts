import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL || "postgresql://localhost:5432/royalcarriage",
  },
  verbose: true,
  strict: true,
});
