import { Request, Response, NextFunction } from 'express';

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // per IP per window

const map = new Map<string, { count: number; reset: number }>();

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = map.get(ip) || { count: 0, reset: now + WINDOW_MS };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + WINDOW_MS;
  }
  entry.count += 1;
  map.set(ip, entry);
  res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - entry.count)));
  res.setHeader('X-RateLimit-Reset', String(Math.floor(entry.reset / 1000)));
  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
}
