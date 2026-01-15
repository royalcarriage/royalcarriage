/**
 * Security middleware and configuration
 */

import { type Express, type Request, type Response, type NextFunction } from 'express';

/**
 * Configure security headers
 */
export function setupSecurityHeaders(app: Express) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy (development vs production)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net;"
      );
    }

    // Permissions Policy (formerly Feature Policy)
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
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
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Validate session secret
 */
export function validateSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  if (secret.length < 32) {
    console.warn('⚠️  SESSION_SECRET should be at least 32 characters long');
  }

  return secret;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Check if request is from an authenticated admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // TODO: Implement proper authentication check
  // For now, this is a placeholder

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // In production, validate JWT or session here
  next();
}

/**
 * Validate API request origin
 */
export function validateOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://royalcarriagelimoseo.web.app',
    'https://chicagoairportblackcar.com',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
  ];

  // Allow requests without origin (same-origin requests)
  if (!origin) {
    return next();
  }

  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return next();
  }

  return res.status(403).json({ error: 'Forbidden origin' });
}
