import type { Express } from "express";
import { aiRoutes } from "./ai/routes";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import importsRoutes from "./routes/imports";
import initializationRoutes from "./routes/initialization";

export async function registerRoutes(app: Express) {
  // put application routes here
  // prefix all routes with /api

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // User management routes
  app.use("/api/users", usersRoutes);

  // AI routes
  app.use("/api/ai", aiRoutes);

  // Import routes (CSV imports for Moovs and Ads)
  app.use("/api/imports", importsRoutes);

  // Initialization routes (Phase 4)
  app.use("/api/init", initializationRoutes);
}