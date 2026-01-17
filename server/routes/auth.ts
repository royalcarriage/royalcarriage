import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { passport } from "../auth";
import { storage } from "../storage";
import { insertUserSchema, type User } from "@shared/schema";
import { requireAuth, requireSuperAdmin } from "../security";
import { fromZodError } from "zod-validation-error";

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user with username and password
 */
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: User | false, info: any) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({
        error: "Authentication failed",
        message: info?.message || "Invalid credentials",
      });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ error: "Login failed" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.json({
        message: "Login successful",
        user: userWithoutPassword,
      });
    });
  })(req, res, next);
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post("/logout", requireAuth, (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destruction error:", destroyErr);
      }
      res.json({ message: "Logout successful" });
    });
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", requireAuth, (req: Request, res: Response) => {
  const user = req.user as User;
  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

/**
 * POST /api/auth/register
 * Register new user (super admin only)
 */
router.post(
  "/register",
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({
          error: "Validation failed",
          message: validationError.message,
        });
      }

      const { username, password } = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Create user
      const newUser = await storage.createUser({ username, password });
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  },
);

/**
 * GET /api/auth/check
 * Check if user is authenticated (public endpoint)
 */
router.get("/check", (req: Request, res: Response) => {
  res.json({ authenticated: req.isAuthenticated() });
});

export default router;
