/**
 * Organization Management Cloud Functions for Royal Carriage Platform
 * Handles organization CRUD operations and user-organization relationships
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  Role,
  Roles,
  Organization,
  User,
  Permissions,
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

interface CreateOrganizationRequest {
  name: string;
  settings?: Record<string, unknown>;
  adminEmail?: string;
  adminPassword?: string;
  adminDisplayName?: string;
}

interface UpdateOrganizationRequest {
  organizationId: string;
  name?: string;
  settings?: Record<string, unknown>;
  isActive?: boolean;
}

interface DeleteOrganizationRequest {
  organizationId: string;
  hardDelete?: boolean;
}

interface AddUserToOrganizationRequest {
  organizationId: string;
  userId: string;
  role: Role;
}

interface RemoveUserFromOrganizationRequest {
  organizationId: string;
  userId: string;
}

interface GetOrganizationUsersRequest {
  organizationId: string;
  includeInactive?: boolean;
}

interface ListOrganizationsRequest {
  includeInactive?: boolean;
  limit?: number;
  startAfter?: string;
}

interface OrganizationResponse {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings?: Record<string, unknown>;
  userCount?: number;
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
 * Convert Firestore organization document to response format
 */
function organizationToResponse(
  org: Organization,
  userCount?: number,
): OrganizationResponse {
  return {
    id: org.id,
    name: org.name,
    isActive: org.isActive,
    createdAt:
      org.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt:
      org.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    settings: org.settings,
    userCount,
  };
}

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
 * Get organization from Firestore
 */
async function getOrganization(
  organizationId: string,
): Promise<Organization | null> {
  const orgDoc = await db.collection("organizations").doc(organizationId).get();
  if (!orgDoc.exists) {
    return null;
  }
  return { id: orgDoc.id, ...orgDoc.data() } as Organization;
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

/**
 * Count users in an organization
 */
async function countOrganizationUsers(organizationId: string): Promise<number> {
  const snapshot = await db
    .collection("users")
    .where("organizationId", "==", organizationId)
    .where("isActive", "==", true)
    .count()
    .get();
  return snapshot.data().count;
}

/**
 * Validate role string
 */
function isValidRole(role: string): role is Role {
  return Object.values(Roles).includes(role as Role);
}

// ============================================
// Cloud Functions
// ============================================

/**
 * Create a new organization
 * Required permission: SAAS_MANAGE_ORGANIZATIONS (saas_admin only)
 */
export const createOrganization = functions.https.onCall(
  async (data: CreateOrganizationRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      // Only saas_admin can create organizations
      if (
        !hasPermission(requestingUser, Permissions.SAAS_MANAGE_ORGANIZATIONS)
      ) {
        throw new PermissionDeniedError(
          "Only SaaS administrators can create organizations",
          Permissions.SAAS_MANAGE_ORGANIZATIONS,
          requestingUser.role,
        );
      }

      if (!data.name) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Organization name is required",
        );
      }

      // Check if organization name already exists
      const existingOrg = await db
        .collection("organizations")
        .where("name", "==", data.name)
        .limit(1)
        .get();

      if (!existingOrg.empty) {
        throw new functions.https.HttpsError(
          "already-exists",
          "An organization with this name already exists",
        );
      }

      const now = admin.firestore.Timestamp.now();

      // Create organization document
      const orgRef = db.collection("organizations").doc();
      const orgData: Omit<Organization, "id"> = {
        name: data.name,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        settings: data.settings || {},
      };

      await orgRef.set(orgData);

      const createdOrg: Organization = { id: orgRef.id, ...orgData };

      // If admin credentials provided, create the admin user
      let adminUser: UserResponse | null = null;
      if (data.adminEmail && data.adminPassword && data.adminDisplayName) {
        // Create Firebase Auth user
        const userRecord = await auth.createUser({
          email: data.adminEmail,
          password: data.adminPassword,
          displayName: data.adminDisplayName,
        });

        // Create Firestore user document
        const userData: Omit<User, "uid"> = {
          email: data.adminEmail,
          displayName: data.adminDisplayName,
          role: "admin",
          organizationId: orgRef.id,
          createdAt: now,
          updatedAt: now,
          isActive: true,
        };

        await db.collection("users").doc(userRecord.uid).set(userData);

        // Set custom claims
        await auth.setCustomUserClaims(userRecord.uid, {
          role: "admin",
          organizationId: orgRef.id,
        });

        adminUser = userToResponse({ uid: userRecord.uid, ...userData });
      }

      return {
        success: true,
        organization: organizationToResponse(createdOrg),
        adminUser,
      };
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
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
      console.error("Error creating organization:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create organization",
      );
    }
  },
);

/**
 * Update an organization
 * Required permission: ORGANIZATION_UPDATE or SAAS_MANAGE_ORGANIZATIONS
 */
export const updateOrganization = functions.https.onCall(
  async (data: UpdateOrganizationRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      if (!data.organizationId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Organization ID is required",
        );
      }

      // Check if user can update this organization
      const isSaasAdmin = hasPermission(
        requestingUser,
        Permissions.SAAS_MANAGE_ORGANIZATIONS,
      );
      const isOrgAdmin =
        hasPermission(requestingUser, Permissions.ORGANIZATION_UPDATE) &&
        requestingUser.organizationId === data.organizationId;

      if (!isSaasAdmin && !isOrgAdmin) {
        throw new PermissionDeniedError(
          "User does not have permission to update this organization",
          Permissions.ORGANIZATION_UPDATE,
          requestingUser.role,
        );
      }

      // Get organization
      const org = await getOrganization(data.organizationId);
      if (!org) {
        throw new functions.https.HttpsError(
          "not-found",
          "Organization not found",
        );
      }

      // Build update object
      const updateData: Record<string, unknown> = {
        updatedAt: admin.firestore.Timestamp.now(),
      };

      if (data.name !== undefined) {
        // Check if new name already exists
        if (data.name !== org.name) {
          const existingOrg = await db
            .collection("organizations")
            .where("name", "==", data.name)
            .limit(1)
            .get();

          if (!existingOrg.empty) {
            throw new functions.https.HttpsError(
              "already-exists",
              "An organization with this name already exists",
            );
          }
        }
        updateData.name = data.name;
      }

      if (data.settings !== undefined) {
        updateData.settings = data.settings;
      }

      // Only saas_admin can change isActive status
      if (data.isActive !== undefined) {
        if (!isSaasAdmin) {
          throw new PermissionDeniedError(
            "Only SaaS administrators can change organization active status",
            Permissions.SAAS_MANAGE_ORGANIZATIONS,
            requestingUser.role,
          );
        }
        updateData.isActive = data.isActive;
      }

      await db
        .collection("organizations")
        .doc(data.organizationId)
        .update(updateData);

      // Get updated organization
      const updatedOrg = await getOrganization(data.organizationId);
      const userCount = await countOrganizationUsers(data.organizationId);

      return {
        success: true,
        organization: updatedOrg
          ? organizationToResponse(updatedOrg, userCount)
          : null,
      };
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
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
      console.error("Error updating organization:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update organization",
      );
    }
  },
);

/**
 * Delete an organization
 * Required permission: SAAS_MANAGE_ORGANIZATIONS (saas_admin only)
 */
export const deleteOrganization = functions.https.onCall(
  async (data: DeleteOrganizationRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      // Only saas_admin can delete organizations
      if (
        !hasPermission(requestingUser, Permissions.SAAS_MANAGE_ORGANIZATIONS)
      ) {
        throw new PermissionDeniedError(
          "Only SaaS administrators can delete organizations",
          Permissions.SAAS_MANAGE_ORGANIZATIONS,
          requestingUser.role,
        );
      }

      if (!data.organizationId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Organization ID is required",
        );
      }

      // Get organization
      const org = await getOrganization(data.organizationId);
      if (!org) {
        throw new functions.https.HttpsError(
          "not-found",
          "Organization not found",
        );
      }

      // Check if organization has users
      const userCount = await countOrganizationUsers(data.organizationId);

      if (userCount > 0 && !data.hardDelete) {
        // Soft delete - just mark as inactive
        await db.collection("organizations").doc(data.organizationId).update({
          isActive: false,
          deletedAt: admin.firestore.Timestamp.now(),
          deletedBy: requestingUser.uid,
          updatedAt: admin.firestore.Timestamp.now(),
        });

        return {
          success: true,
          message: `Organization has been deactivated. ${userCount} users remain associated.`,
          softDeleted: true,
        };
      }

      if (data.hardDelete) {
        // Hard delete - remove organization and deactivate all users
        const batch = db.batch();

        // Get all users in organization
        const usersSnapshot = await db
          .collection("users")
          .where("organizationId", "==", data.organizationId)
          .get();

        // Deactivate all users
        for (const userDoc of usersSnapshot.docs) {
          batch.update(userDoc.ref, {
            isActive: false,
            deletedAt: admin.firestore.Timestamp.now(),
            deletedBy: requestingUser.uid,
          });

          // Disable auth accounts
          try {
            await auth.updateUser(userDoc.id, { disabled: true });
          } catch {
            console.warn(`Failed to disable auth for user ${userDoc.id}`);
          }
        }

        // Delete organization
        batch.delete(db.collection("organizations").doc(data.organizationId));

        await batch.commit();

        return {
          success: true,
          message: `Organization deleted. ${usersSnapshot.size} users have been deactivated.`,
          softDeleted: false,
          usersDeactivated: usersSnapshot.size,
        };
      }

      // No users, safe to delete
      await db.collection("organizations").doc(data.organizationId).delete();

      return {
        success: true,
        message: "Organization has been deleted",
        softDeleted: false,
      };
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
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
      console.error("Error deleting organization:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to delete organization",
      );
    }
  },
);

/**
 * List all organizations (saas_admin only)
 * Required permission: SAAS_VIEW_ALL_ORGANIZATIONS
 */
export const listOrganizations = functions.https.onCall(
  async (data: ListOrganizationsRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      // Only saas_admin can list all organizations
      if (
        !hasPermission(requestingUser, Permissions.SAAS_VIEW_ALL_ORGANIZATIONS)
      ) {
        throw new PermissionDeniedError(
          "Only SaaS administrators can list all organizations",
          Permissions.SAAS_VIEW_ALL_ORGANIZATIONS,
          requestingUser.role,
        );
      }

      const limit = data.limit || 50;

      // Build query
      let query = db.collection("organizations").orderBy("name");

      if (!data.includeInactive) {
        query = query.where("isActive", "==", true);
      }

      if (data.startAfter) {
        const startAfterDoc = await db
          .collection("organizations")
          .doc(data.startAfter)
          .get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      query = query.limit(limit);

      const snapshot = await query.get();

      // Get organizations with user counts
      const organizations: OrganizationResponse[] = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const org = { id: doc.id, ...doc.data() } as Organization;
          const userCount = await countOrganizationUsers(doc.id);
          return organizationToResponse(org, userCount);
        }),
      );

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      return {
        success: true,
        organizations,
        count: organizations.length,
        hasMore: snapshot.docs.length === limit,
        nextCursor: lastDoc?.id || null,
      };
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
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
      console.error("Error listing organizations:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to list organizations",
      );
    }
  },
);

/**
 * Add a user to an organization
 * Required permission: ORGANIZATION_MANAGE_USERS or SAAS_MANAGE_ORGANIZATIONS
 */
export const addUserToOrganization = functions.https.onCall(
  async (data: AddUserToOrganizationRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      if (!data.organizationId || !data.userId || !data.role) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Organization ID, user ID, and role are required",
        );
      }

      // Validate role
      if (!isValidRole(data.role)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          `Invalid role: ${data.role}`,
        );
      }

      // Check permissions
      const isSaasAdmin = hasPermission(
        requestingUser,
        Permissions.SAAS_MANAGE_ORGANIZATIONS,
      );
      const canManageOrgUsers =
        hasPermission(requestingUser, Permissions.ORGANIZATION_MANAGE_USERS) &&
        canAccessOrganization(requestingUser, data.organizationId);

      if (!isSaasAdmin && !canManageOrgUsers) {
        throw new PermissionDeniedError(
          "User does not have permission to add users to this organization",
          Permissions.ORGANIZATION_MANAGE_USERS,
          requestingUser.role,
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

      // Get organization
      const org = await getOrganization(data.organizationId);
      if (!org) {
        throw new functions.https.HttpsError(
          "not-found",
          "Organization not found",
        );
      }

      if (!org.isActive) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Cannot add users to an inactive organization",
        );
      }

      // Get user
      const user = await getUser(data.userId);
      if (!user) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      // Check if user is already in an organization
      if (user.organizationId && user.organizationId !== data.organizationId) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "User is already associated with another organization. Remove them first.",
        );
      }

      // Update user
      const now = admin.firestore.Timestamp.now();
      await db.collection("users").doc(data.userId).update({
        organizationId: data.organizationId,
        role: data.role,
        updatedAt: now,
      });

      // Update custom claims
      await auth.setCustomUserClaims(data.userId, {
        role: data.role,
        organizationId: data.organizationId,
      });

      // Get updated user
      const updatedUser = await getUser(data.userId);

      return {
        success: true,
        user: updatedUser ? userToResponse(updatedUser) : null,
        organization: organizationToResponse(org),
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
      console.error("Error adding user to organization:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to add user to organization",
      );
    }
  },
);

/**
 * Remove a user from an organization
 * Required permission: ORGANIZATION_MANAGE_USERS or SAAS_MANAGE_ORGANIZATIONS
 */
export const removeUserFromOrganization = functions.https.onCall(
  async (data: RemoveUserFromOrganizationRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      if (!data.organizationId || !data.userId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Organization ID and user ID are required",
        );
      }

      // Check permissions
      const isSaasAdmin = hasPermission(
        requestingUser,
        Permissions.SAAS_MANAGE_ORGANIZATIONS,
      );
      const canManageOrgUsers =
        hasPermission(requestingUser, Permissions.ORGANIZATION_MANAGE_USERS) &&
        canAccessOrganization(requestingUser, data.organizationId);

      if (!isSaasAdmin && !canManageOrgUsers) {
        throw new PermissionDeniedError(
          "User does not have permission to remove users from this organization",
          Permissions.ORGANIZATION_MANAGE_USERS,
          requestingUser.role,
        );
      }

      // Cannot remove yourself
      if (requestingUser.uid === data.userId) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Cannot remove yourself from the organization",
        );
      }

      // Get user
      const user = await getUser(data.userId);
      if (!user) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      // Verify user is in this organization
      if (user.organizationId !== data.organizationId) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "User is not in this organization",
        );
      }

      // Cannot remove users with equal or higher role
      if (RoleHierarchy[requestingUser.role] <= RoleHierarchy[user.role]) {
        throw new PermissionDeniedError(
          "Cannot remove users with equal or higher role",
          Permissions.ORGANIZATION_MANAGE_USERS,
          requestingUser.role,
        );
      }

      // Deactivate user (soft remove)
      const now = admin.firestore.Timestamp.now();
      await db.collection("users").doc(data.userId).update({
        isActive: false,
        removedFromOrgAt: now,
        removedBy: requestingUser.uid,
        updatedAt: now,
      });

      // Disable auth account
      await auth.updateUser(data.userId, { disabled: true });

      return {
        success: true,
        message: "User has been removed from the organization",
        userId: data.userId,
        organizationId: data.organizationId,
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
      console.error("Error removing user from organization:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to remove user from organization",
      );
    }
  },
);

/**
 * Get all users in an organization
 * Required permission: USERS_VIEW with organization access
 */
export const getOrganizationUsers = functions.https.onCall(
  async (data: GetOrganizationUsersRequest, context) => {
    try {
      if (!context.auth) {
        throw new AuthenticationError("Authentication required");
      }

      const requestingUser = await verifyAuthAndGetUser(
        `Bearer ${context.auth.token}`,
      );

      if (!data.organizationId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Organization ID is required",
        );
      }

      // Check organization access
      if (!canAccessOrganization(requestingUser, data.organizationId)) {
        throw new OrganizationAccessError(
          "Cannot access users in this organization",
          requestingUser.organizationId,
          data.organizationId,
        );
      }

      // Check permission
      if (!hasPermission(requestingUser, Permissions.USERS_VIEW)) {
        throw new PermissionDeniedError(
          "User does not have permission to view users",
          Permissions.USERS_VIEW,
          requestingUser.role,
        );
      }

      // Get organization
      const org = await getOrganization(data.organizationId);
      if (!org) {
        throw new functions.https.HttpsError(
          "not-found",
          "Organization not found",
        );
      }

      // Build query
      let query = db
        .collection("users")
        .where("organizationId", "==", data.organizationId);

      if (!data.includeInactive) {
        query = query.where("isActive", "==", true);
      }

      const snapshot = await query.get();

      const users: UserResponse[] = snapshot.docs.map((doc) => {
        const userData = { uid: doc.id, ...doc.data() } as User;
        return userToResponse(userData);
      });

      // Sort by role hierarchy and then by name
      users.sort((a, b) => {
        const roleCompare = RoleHierarchy[b.role] - RoleHierarchy[a.role];
        if (roleCompare !== 0) return roleCompare;
        return (a.displayName || "").localeCompare(b.displayName || "");
      });

      return {
        success: true,
        organization: organizationToResponse(org),
        users,
        count: users.length,
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
      console.error("Error getting organization users:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to get organization users",
      );
    }
  },
);
