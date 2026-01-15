import { Router, type Request, type Response } from 'express';
import { storage } from '../storage';
import { type User, UserRole, type UserRoleType } from '@shared/schema';
import { requireAdmin, requireSuperAdmin } from '../security';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const router = Router();

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID (admin only)
 */
router.get('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await storage.getUser(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PUT /api/users/:id/role
 * Update user role (super admin only)
 */
const updateRoleSchema = z.object({
  role: z.enum([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
});

router.put('/:id/role', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = updateRoleSchema.safeParse(req.body);

    if (!result.success) {
      const validationError = fromZodError(result.error);
      return res.status(400).json({
        error: 'Validation failed',
        message: validationError.message,
      });
    }

    const { role } = result.data;

    // Check if user exists
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent users from removing their own super admin role
    const currentUser = req.user as User;
    if (currentUser.id === id && currentUser.role === UserRole.SUPER_ADMIN && role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        error: 'Cannot remove your own super admin role',
      });
    }

    const updatedUser = await storage.updateUserRole(id, role);

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update user role' });
    }

    const { password, ...userWithoutPassword } = updatedUser;
    res.json({
      message: 'User role updated successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user (super admin only)
 */
router.delete('/:id', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent users from deleting themselves
    const currentUser = req.user as User;
    if (currentUser.id === id) {
      return res.status(403).json({
        error: 'Cannot delete your own account',
      });
    }

    const success = await storage.deleteUser(id);

    if (!success) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * GET /api/users/stats/summary
 * Get user statistics (admin only)
 */
router.get('/stats/summary', requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();

    const stats = {
      total: users.length,
      byRole: {
        [UserRole.USER]: users.filter(u => u.role === UserRole.USER).length,
        [UserRole.ADMIN]: users.filter(u => u.role === UserRole.ADMIN).length,
        [UserRole.SUPER_ADMIN]: users.filter(u => u.role === UserRole.SUPER_ADMIN).length,
      },
      recentUsers: users
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(({ password, ...user }) => user),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

export default router;
