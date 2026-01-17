/**
 * Security middleware and configuration
 */

import {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { type User, UserRole, type UserRoleType } from "../shared/schema";

/**
 * Configure security headers
 */
export function setupSecurityHeaders(app: Express) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");

    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Enable XSS protection
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // Referrer policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Content Security Policy (development vs production)
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' https://fonts.gstatic.com; " +
          "img-src 'self' data: https:; " +
          "connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net;",
      );
    }

    // Permissions Policy (formerly Feature Policy)
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()",
    );

    next();
  });
}

/**
 * Rate limiting configuration for API endpoints
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Validate session secret
 */
export function validateSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  if (secret.length < 32) {
    console.warn("⚠️  SESSION_SECRET should be at least 32 characters long");
  }

  return secret;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim();
}

/**
 * Check if user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

/**
 * Check if request is from an authenticated admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const user = req.user as User;
  const allowedRoles: UserRoleType[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

  if (!allowedRoles.includes(user.role)) {
    res
      .status(403)
      .json({ error: "Insufficient permissions. Admin access required." });
    return;
  }

  next();
}

/**
 * Check if request is from a super admin
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const user = req.user as User;

  if (user.role !== UserRole.SUPER_ADMIN) {
    res
      .status(403)
      .json({
        error: "Insufficient permissions. Super admin access required.",
      });
    return;
  }

  next();
}

/**
 * Flexible role-based access control
 * Checks if user has at least the specified role level
 */
export function requireRole(minRole: UserRoleType) {
  const roleHierarchy: Record<UserRoleType, number> = {
    [UserRole.USER]: 1,
    [UserRole.ADMIN]: 2,
    [UserRole.SUPER_ADMIN]: 3,
  };

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const user = req.user as User;
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[minRole] || 0;

    if (userLevel < requiredLevel) {
      res.status(403).json({
        error: "Insufficient permissions",
        required: minRole,
        current: user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Validate API request origin
 */
export function validateOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://royalcarriagelimoseo.web.app",
    "https://chicagoairportblackcar.com",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
  ];

  // Allow requests without origin (same-origin requests)
  if (!origin) {
    return next();
  }

  if (process.env.NODE_ENV === "development") {
    return next();
  }

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    return next();
  }

  res.status(403).json({ error: "Forbidden origin" });
}
