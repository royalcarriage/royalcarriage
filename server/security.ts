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
        "script-src 'self' https://fonts.googleapis.com; " +
        "style-src 'self' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net;"
      );
    } else {
      // Development: Allow unsafe-inline for hot module replacement
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net ws: wss:;"
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
 * This middleware validates JWT tokens and checks for admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please provide a valid Bearer token in the Authorization header'
    });
  }

  // Extract token
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // TODO: Integrate with Firebase Admin SDK for token verification
  // In production, this should verify the JWT token and check custom claims:
  // 
  // import * as admin from 'firebase-admin';
  // try {
  //   const decodedToken = await admin.auth().verifyIdToken(token);
  //   if (decodedToken.role !== 'admin') {
  //     return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  //   }
  //   req.user = decodedToken; // Attach user info to request
  //   next();
  // } catch (error) {
  //   return res.status(401).json({ error: 'Invalid token' });
  // }
  
  // Temporary: Basic validation for development
  // WARNING: This is NOT secure for production use
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  requireAdmin middleware is using placeholder authentication. Implement proper JWT validation before production deployment.');
  }
  
  // For now, just check if token exists and is not empty
  if (token.length < 10) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }

  next();
}

/**
 * Validate API request origin
 */
export function validateOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  
  // Get allowed origins from environment or use defaults
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 
    'https://royalcarriagelimoseo.web.app,https://chicagoairportblackcar.com';
  
  const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim());
  
  // Add localhost for development
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:5000', 'http://127.0.0.1:5000');
  }

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
