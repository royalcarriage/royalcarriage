import { Router, type Request, type Response, type NextFunction } from 'express';
import { passport } from '../auth';
import { storage } from '../storage';
import { insertUserSchema, type User, UserRole } from '../../shared/schema';
import { requireAuth, requireSuperAdmin } from '../security';
import { fromZodError } from 'zod-validation-error';
import * as admin from 'firebase-admin';

const router = Router();

/**
 * POST /api/auth/google
 * Authenticate with Google ID Token
 */
router.post('/google', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    // Check if user exists in our DB by UID
    let user = await storage.getUser(uid);

    if (!user) {
      // Fallback: check by email in case of ID mismatch during migration
      user = await storage.getUserByUsername(email);
      
      if (!user) {
        // Create new user using the Firebase UID as the document ID
        const dummyPassword = Math.random().toString(36).slice(-8);
        
        try {
          user = await storage.createUser({
            username: email,
            password: dummyPassword,
          }, uid);

          // SET ADMIN ROLE FOR SPECIFIED EMAIL
          if (email === 'info@royalcarriagelimo.com') {
            user = await storage.updateUserRole(uid, UserRole.SUPER_ADMIN);
          }
        } catch (e) {
          console.error("Error creating user from Google Auth:", e);
          res.status(500).json({ error: 'Failed to create user account' });
          return;
        }
      }
    } else {
        // User exists by UID, ensure admin status if email matches
        if (email === 'info@royalcarriagelimo.com' && user.role !== UserRole.SUPER_ADMIN) {
            user = await storage.updateUserRole(uid, UserRole.SUPER_ADMIN);
        }
    }

    // Log the user in (establish session)
    if (user) {
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("Session login error:", loginErr);
            res.status(500).json({ error: 'Login failed' });
            return;
          }

          const { password, ...userWithoutPassword } = user!;
          res.json({
            message: 'Login successful',
            user: userWithoutPassword,
          });
        });
        return;
    } else {
        res.status(404).json({ error: 'User not found' });
        return;
    }
  } catch (error) {
    console.error('Google auth verification failed:', error);
    res.status(401).json({ error: 'Invalid ID token' });
    return;
  }
});

/**
 * POST /api/auth/login
 * Authenticate user with username and password
 */
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (err: any, user: User | false, info: any) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: info?.message || 'Invalid credentials',
      });
      return;
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        res.status(500).json({ error: 'Login failed' });
        return;
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
      });
    });
  })(req, res, next);
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', requireAuth, (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
      return;
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Session destruction error:', destroyErr);
      }
      res.json({ message: 'Logout successful' });
    });
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user as User;
  if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
  }
  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

/**
 * POST /api/auth/register
 * Register new user (super admin only)
 */
router.post('/register', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const result = insertUserSchema.safeParse(req.body);

    if (!result.success) {
      const validationError = fromZodError(result.error as any);
      res.status(400).json({
        error: 'Validation failed',
        message: validationError.message,
      });
      return;
    }

    const { username, password } = result.data;

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    // Create user
    const newUser = await storage.createUser({ username, password });
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * GET /api/auth/check
 * Check if user is authenticated (public endpoint)
 */
router.get('/check', (req: Request, res: Response) => {
  res.json({ authenticated: req.isAuthenticated() });
});

export default router;