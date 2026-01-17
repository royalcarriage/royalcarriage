/**
 * User Management Cloud Functions for Royal Carriage Platform
 * Handles user CRUD operations, role assignments, and permissions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  Role,
  Roles,
  Permission,
  Permissions,
  User,
  getPermissionsForRole,
  RoleHierarchy,
} from "./rbac/permissions";
import {
  verifyAuthAndGetUser,
  hasPermission,
  canAccessOrganization,
  canAssignRole,
  PermissionDeniedError,
  OrganizationAccessError,
  AuthenticationError,
} from "./rbac/guards";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

// ============================================
// Types and Interfaces
// ============================================

interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  role: Role;
  organizationId: string;
}

interface UpdateUserRequest {
  uid: string;
  displayName?: string;
  email?: string;
  isActive?: boolean;
}

interface AssignRoleRequest {
  uid: string;
  role: Role;
}

interface GetUsersByOrganizationRequest {
  organizationId: string;
  includeInactive?: boolean;
}

interface GetUserPermissionsRequest {
  uid: string;
}

interface DeleteUserRequest {
  uid: string;
}

interface UserResponse {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Convert Firestore user document to response format
 */
function userToResponse(user: User): UserResponse {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    role: user.role,
    organizationId: user.organizationId,
    isActive: user.isActive,
    createdAt:
      user.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt:
      user.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

/**
 * Validate role string
 */
function isValidRole(role: string): role is Role {
  return Object.values(Roles).includes(role as Role);
}

/**
 * Get user from Firestore
 */
async function getUser(uid: string): Promise<User | null> {
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) {
    return null;
  }
  return { uid, ...userDoc.data() } as User;
}

// ============================================
// Cloud Functions
// ============================================

/**
 * Create a new user
 * Required permission: USERS_CREATE
 */
export const createUser = functions.https.onCall(
  async (data: CreateUserRequest, context) => {
    try {
      // Verify authentication
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      // Check permission to create users
      if (!hasPermission(requestingUser, Permissions.USERS_CREATE)) {
        throw new PermissionDeniedError(
          "User does not have permission to create users",
          Permissions.USERS_CREATE,
          requestingUser.role,
        );
      }

      // Validate input
      if (
        !data.email ||
        !data.password ||
        !data.displayName ||
        !data.role ||
        !data.organizationId
      ) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Missing required fields: email, password, displayName, role, organizationId",
        );
      }

      // Validate role
      if (!isValidRole(data.role)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          `Invalid role: ${data.role}. Valid roles are: ${Object.values(Roles).join(", ")}`,
        );
      }

      // Check organization access
      if (!canAccessOrganization(requestingUser, data.organizationId)) {
        throw new OrganizationAccessError(
          "Cannot create users in other organizations",
          requestingUser.organizationId,
          data.organizationId,
        );
      }

      // Check if can assign the requested role
      if (!canAssignRole(requestingUser, data.role)) {
        throw new PermissionDeniedError(
          `Cannot assign role '${data.role}'. Can only assign roles lower than your own.`,
          Permissions.USERS_ASSIGN_ROLES,
          requestingUser.role,
        );
      }

      // Verify organization exists
      const orgDoc = await db
        .collection("organizations")
        .doc(data.organizationId)
        .get();
      if (!orgDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Organization not found",
        );
      }

      // Create Firebase Auth user
      const userRecord = await auth.createUser({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      });

      // Create Firestore user document
      const now = admin.firestore.Timestamp.now();
      const userData: Omit<User, "uid"> = {
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        organizationId: data.organizationId,
        createdAt: now,
        updatedAt: now,
        isActive: true,
      };

      await db.collection("users").doc(userRecord.uid).set(userData);

      // Set custom claims for role
      await auth.setCustomUserClaims(userRecord.uid, {
        role: data.role,
        organizationId: data.organizationId,
      });

      const createdUser: User = { uid: userRecord.uid, ...userData };

      return {
        success: true,
        user: userToResponse(createdUser),
      };
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof OrganizationAccessError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof AuthenticationError) {
        throw new functions.https.HttpsError("unauthenticated", error.message);
      }
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Error creating user:", error);
      throw new functions.https.HttpsError("internal", "Failed to create user");
    }
  },
);

/**
 * Update an existing user
 * Required permission: USERS_UPDATE
 */
export const updateUser = functions.https.onCall(
  async (data: UpdateUserRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      // Check permission
      if (!hasPermission(requestingUser, Permissions.USERS_UPDATE)) {
        throw new PermissionDeniedError(
          "User does not have permission to update users",
          Permissions.USERS_UPDATE,
          requestingUser.role,
        );
      }

      if (!data.uid) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "User ID is required",
        );
      }

      // Get target user
      const targetUser = await getUser(data.uid);
      if (!targetUser) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      // Check organization access
      if (!canAccessOrganization(requestingUser, targetUser.organizationId)) {
        throw new OrganizationAccessError(
          "Cannot update users in other organizations",
          requestingUser.organizationId,
          targetUser.organizationId,
        );
      }

      // Cannot update users with equal or higher role (unless updating self)
      if (
        requestingUser.uid !== data.uid &&
        RoleHierarchy[requestingUser.role] <= RoleHierarchy[targetUser.role]
      ) {
        throw new PermissionDeniedError(
          "Cannot update users with equal or higher role",
          Permissions.USERS_UPDATE,
          requestingUser.role,
        );
      }

      // Build update object
      const updateData: Record<string, unknown> = {
        updatedAt: admin.firestore.Timestamp.now(),
      };

      if (data.displayName !== undefined) {
        updateData.displayName = data.displayName;
      }

      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }

      // Update Firestore
      await db.collection("users").doc(data.uid).update(updateData);

      // Update Auth if needed
      const authUpdate: admin.auth.UpdateRequest = {};
      if (data.displayName !== undefined) {
        authUpdate.displayName = data.displayName;
      }
      if (data.email !== undefined) {
        authUpdate.email = data.email;
        updateData.email = data.email;
        await db
          .collection("users")
          .doc(data.uid)
          .update({ email: data.email });
      }
      if (data.isActive === false) {
        authUpdate.disabled = true;
      } else if (data.isActive === true) {
        authUpdate.disabled = false;
      }

      if (Object.keys(authUpdate).length > 0) {
        await auth.updateUser(data.uid, authUpdate);
      }

      // Get updated user
      const updatedUser = await getUser(data.uid);

      return {
        success: true,
        user: updatedUser ? userToResponse(updatedUser) : null,
      };
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof OrganizationAccessError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof AuthenticationError) {
        throw new functions.https.HttpsError("unauthenticated", error.message);
      }
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Error updating user:", error);
      throw new functions.https.HttpsError("internal", "Failed to update user");
    }
  },
);

/**
 * Delete a user
 * Required permission: USERS_DELETE
 */
export const deleteUser = functions.https.onCall(
  async (data: DeleteUserRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      // Check permission
      if (!hasPermission(requestingUser, Permissions.USERS_DELETE)) {
        throw new PermissionDeniedError(
          "User does not have permission to delete users",
          Permissions.USERS_DELETE,
          requestingUser.role,
        );
      }

      if (!data.uid) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "User ID is required",
        );
      }

      // Cannot delete self
      if (requestingUser.uid === data.uid) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Cannot delete your own account",
        );
      }

      // Get target user
      const targetUser = await getUser(data.uid);
      if (!targetUser) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      // Check organization access
      if (!canAccessOrganization(requestingUser, targetUser.organizationId)) {
        throw new OrganizationAccessError(
          "Cannot delete users in other organizations",
          requestingUser.organizationId,
          targetUser.organizationId,
        );
      }

      // Cannot delete users with equal or higher role
      if (
        RoleHierarchy[requestingUser.role] <= RoleHierarchy[targetUser.role]
      ) {
        throw new PermissionDeniedError(
          "Cannot delete users with equal or higher role",
          Permissions.USERS_DELETE,
          requestingUser.role,
        );
      }

      // Soft delete - mark as inactive instead of actually deleting
      await db.collection("users").doc(data.uid).update({
        isActive: false,
        deletedAt: admin.firestore.Timestamp.now(),
        deletedBy: requestingUser.uid,
        updatedAt: admin.firestore.Timestamp.now(),
      });

      // Disable auth account
      await auth.updateUser(data.uid, { disabled: true });

      return {
        success: true,
        message: "User has been deactivated",
      };
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof OrganizationAccessError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof AuthenticationError) {
        throw new functions.https.HttpsError("unauthenticated", error.message);
      }
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Error deleting user:", error);
      throw new functions.https.HttpsError("internal", "Failed to delete user");
    }
  },
);

/**
 * Assign or update a user's role
 * Required permission: USERS_ASSIGN_ROLES
 */
export const assignRole = functions.https.onCall(
  async (data: AssignRoleRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      // Check permission
      if (!hasPermission(requestingUser, Permissions.USERS_ASSIGN_ROLES)) {
        throw new PermissionDeniedError(
          "User does not have permission to assign roles",
          Permissions.USERS_ASSIGN_ROLES,
          requestingUser.role,
        );
      }

      if (!data.uid || !data.role) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "User ID and role are required",
        );
      }

      // Validate role
      if (!isValidRole(data.role)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          `Invalid role: ${data.role}`,
        );
      }

      // Cannot change own role
      if (requestingUser.uid === data.uid) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Cannot change your own role",
        );
      }

      // Get target user
      const targetUser = await getUser(data.uid);
      if (!targetUser) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      // Check organization access
      if (!canAccessOrganization(requestingUser, targetUser.organizationId)) {
        throw new OrganizationAccessError(
          "Cannot modify users in other organizations",
          requestingUser.organizationId,
          targetUser.organizationId,
        );
      }

      // Check if can assign the new role
      if (!canAssignRole(requestingUser, data.role)) {
        throw new PermissionDeniedError(
          `Cannot assign role '${data.role}'. Can only assign roles lower than your own.`,
          Permissions.USERS_ASSIGN_ROLES,
          requestingUser.role,
        );
      }

      // Cannot modify users with equal or higher role
      if (
        RoleHierarchy[requestingUser.role] <= RoleHierarchy[targetUser.role]
      ) {
        throw new PermissionDeniedError(
          "Cannot modify role of users with equal or higher role",
          Permissions.USERS_ASSIGN_ROLES,
          requestingUser.role,
        );
      }

      // Update role in Firestore
      await db.collection("users").doc(data.uid).update({
        role: data.role,
        updatedAt: admin.firestore.Timestamp.now(),
      });

      // Update custom claims
      await auth.setCustomUserClaims(data.uid, {
        role: data.role,
        organizationId: targetUser.organizationId,
      });

      // Get updated user
      const updatedUser = await getUser(data.uid);

      return {
        success: true,
        user: updatedUser ? userToResponse(updatedUser) : null,
        previousRole: targetUser.role,
        newRole: data.role,
      };
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof OrganizationAccessError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof AuthenticationError) {
        throw new functions.https.HttpsError("unauthenticated", error.message);
      }
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Error assigning role:", error);
      throw new functions.https.HttpsError("internal", "Failed to assign role");
    }
  },
);

/**
 * Alias for assignRole for updating user role
 */
export const updateUserRole = assignRole;

/**
 * Get all users in an organization
 * Required permission: USERS_VIEW
 */
export const getUsersByOrganization = functions.https.onCall(
  async (data: GetUsersByOrganizationRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      // Check permission
      if (!hasPermission(requestingUser, Permissions.USERS_VIEW)) {
        throw new PermissionDeniedError(
          "User does not have permission to view users",
          Permissions.USERS_VIEW,
          requestingUser.role,
        );
      }

      const organizationId =
        data.organizationId || requestingUser.organizationId;

      // Check organization access
      if (!canAccessOrganization(requestingUser, organizationId)) {
        throw new OrganizationAccessError(
          "Cannot view users in other organizations",
          requestingUser.organizationId,
          organizationId,
        );
      }

      // Build query
      let query = db
        .collection("users")
        .where("organizationId", "==", organizationId);

      if (!data.includeInactive) {
        query = query.where("isActive", "==", true);
      }

      const snapshot = await query.get();

      const users: UserResponse[] = snapshot.docs.map((doc) => {
        const userData = { uid: doc.id, ...doc.data() } as User;
        return userToResponse(userData);
      });

      return {
        success: true,
        users,
        count: users.length,
        organizationId,
      };
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof OrganizationAccessError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof AuthenticationError) {
        throw new functions.https.HttpsError("unauthenticated", error.message);
      }
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Error getting users:", error);
      throw new functions.https.HttpsError("internal", "Failed to get users");
    }
  },
);

/**
 * Get permissions for a specific user
 * Users can view their own permissions, admins can view others'
 */
export const getUserPermissions = functions.https.onCall(
  async (data: GetUserPermissionsRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      const targetUid = data.uid || requestingUser.uid;

      // If viewing someone else's permissions, need USERS_VIEW permission
      if (targetUid !== requestingUser.uid) {
        if (!hasPermission(requestingUser, Permissions.USERS_VIEW)) {
          throw new PermissionDeniedError(
            "User does not have permission to view other users' permissions",
            Permissions.USERS_VIEW,
            requestingUser.role,
          );
        }

        // Get target user
        const targetUser = await getUser(targetUid);
        if (!targetUser) {
          throw new functions.https.HttpsError("not-found", "User not found");
        }

        // Check organization access
        if (!canAccessOrganization(requestingUser, targetUser.organizationId)) {
          throw new OrganizationAccessError(
            "Cannot view users in other organizations",
            requestingUser.organizationId,
            targetUser.organizationId,
          );
        }

        const permissions = getPermissionsForRole(targetUser.role);

        return {
          success: true,
          uid: targetUid,
          role: targetUser.role,
          permissions,
          permissionCount: permissions.length,
        };
      }

      // Viewing own permissions
      const permissions = getPermissionsForRole(requestingUser.role);

      return {
        success: true,
        uid: requestingUser.uid,
        role: requestingUser.role,
        permissions,
        permissionCount: permissions.length,
      };
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof OrganizationAccessError) {
        throw new functions.https.HttpsError(
          "permission-denied",
          error.message,
        );
      }
      if (error instanceof AuthenticationError) {
        throw new functions.https.HttpsError("unauthenticated", error.message);
      }
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Error getting permissions:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to get permissions",
      );
    }
  },
);
