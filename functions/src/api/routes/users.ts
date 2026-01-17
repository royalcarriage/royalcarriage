import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { type User, UserRole } from "../../shared/schema";
import { requireAdmin, requireSuperAdmin } from "../security";
import { syncUserRoleToFirebase } from "../firebase-claims";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID (admin only)
 */
router.get("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const user = await storage.getUser(id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * PUT /api/users/:id/role
 * Update user role (super admin only)
 */
const updateRoleSchema = z.object({
  role: z.enum([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
});

router.put(
  "/:id/role",
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      const result = updateRoleSchema.safeParse(req.body);

      if (!result.success) {
        const validationError = fromZodError(result.error as any);
        res.status(400).json({
          error: "Validation failed",
          message: validationError.message,
        });
        return;
      }

      const { role } = result.data;

      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Prevent users from removing their own super admin role
      const currentUser = req.user as User;
      if (
        currentUser.id === id &&
        currentUser.role === UserRole.SUPER_ADMIN &&
        role !== UserRole.SUPER_ADMIN
      ) {
        res.status(403).json({
          error: "Cannot remove your own super admin role",
        });
        return;
      }

      const updatedUser = await storage.updateUserRole(id, role);

      if (!updatedUser) {
        res.status(500).json({ error: "Failed to update user role" });
        return;
      }

      const { password, ...userWithoutPassword } = updatedUser;
      // attempt to sync role into Firebase custom claims (optional)
      try {
        await syncUserRoleToFirebase(updatedUser.id, role);
      } catch (e) {
        console.warn("Failed to sync firebase claims (non-fatal)");
      }
      res.json({
        message: "User role updated successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  },
);

/**
 * DELETE /api/users/:id
 * Delete user (super admin only)
 */
router.delete(
  "/:id",
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as { id: string };

      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Prevent users from deleting themselves
      const currentUser = req.user as User;
      if (currentUser.id === id) {
        res.status(403).json({
          error: "Cannot delete your own account",
        });
        return;
      }

      const success = await storage.deleteUser(id);

      if (!success) {
        res.status(500).json({ error: "Failed to delete user" });
        return;
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  },
);

/**
 * GET /api/users/stats/summary
 * Get user statistics (admin only)
 */
router.get(
  "/stats/summary",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();

      const stats = {
        total: users.length,
        byRole: {
          [UserRole.USER]: users.filter((u) => u.role === UserRole.USER).length,
          [UserRole.ADMIN]: users.filter((u) => u.role === UserRole.ADMIN)
            .length,
          [UserRole.SUPER_ADMIN]: users.filter(
            (u) => u.role === UserRole.SUPER_ADMIN,
          ).length,
        },
        recentUsers: users
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
          .map(({ password, ...user }) => user),
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user statistics" });
    }
  },
);

export default router;
