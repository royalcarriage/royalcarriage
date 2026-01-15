import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Simple RBAC middleware: checks `x-api-user` header or `authorization` bearer token stub.
// In production, replace with Firebase Auth token verification.
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const apiUser = req.header('x-api-user');
    if (apiUser) {
      const user = await storage.getUserByUsername(apiUser as string);
      if (user && user.role === 'admin') return next();
    }

    // Fallback: allow if `authorization` header contains `Bearer admin` (dev only)
    const auth = req.header('authorization') || '';
    if (auth.trim() === 'Bearer admin') return next();

    return res.status(403).json({ error: 'Forbidden: admin role required' });
  } catch (err) {
    console.error('RBAC check failed', err);
    return res.status(500).json({ error: 'RBAC check failed' });
  }
}
