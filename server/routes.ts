import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiRoutes } from "./ai/routes";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // User management routes
  app.use("/api/users", usersRoutes);

  // AI routes
  app.use("/api/ai", aiRoutes);

  return httpServer;
}
