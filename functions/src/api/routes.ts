import type { Express } from "express";
import { aiRoutes } from "./ai/routes";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";

export async function registerRoutes(app: Express) {
  // put application routes here
  // prefix all routes with /api

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // User management routes
  app.use("/api/users", usersRoutes);

  // AI routes
  app.use("/api/ai", aiRoutes);
}