/**
 * RBAC Permission Guards for Royal Carriage Platform
 * Functions to check if a user can perform specific actions
 */

import * as admin from 'firebase-admin';
import {
  Permission,
  Permissions,
  Role,
  User,
  roleHasPermission,
  getPermissionsForRole,
  isRoleHigherOrEqual,
  RoleHierarchy,
} from './permissions';

// Error types for permission failures
export class PermissionDeniedError extends Error {
  constructor(
    message: string,
    public readonly requiredPermission?: Permission,
    public readonly userRole?: Role
  ) {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}

export class OrganizationAccessError extends Error {
  constructor(
    message: string,
    public readonly userOrganizationId?: string,
    public readonly targetOrganizationId?: string
  ) {
    super(message);
    this.name = 'OrganizationAccessError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Context for permission checks
export interface PermissionContext {
  user: User;
  targetOrganizationId?: string;
  targetUserId?: string;
  resourceId?: string;
}

// Result of a permission check
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Get user data from Firestore
 */
export async function getUserFromFirestore(uid: string): Promise<User | null> {
  const db = admin.firestore();
  const userDoc = await db.collection('users').doc(uid).get();

  if (!userDoc.exists) {
    return null;
  }

  return { uid, ...userDoc.data() } as User;
}

/**
 * Verify Firebase Auth token and get user
 */
export async function verifyAuthAndGetUser(
  authHeader: string | undefined
): Promise<User> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('No valid authorization header provided');
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await getUserFromFirestore(decodedToken.uid);

    if (!user) {
      throw new AuthenticationError('User not found in database');
    }

    if (!user.isActive) {
      throw new AuthenticationError('User account is deactivated');
    }

    return user;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError('Invalid or expired authentication token');
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User, permission: Permission): boolean {
  return roleHasPermission(user.role, permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * Check if user can access a specific organization
 */
export function canAccessOrganization(
  user: User,
  targetOrganizationId: string
): boolean {
  // SaaS admin can access all organizations
  if (user.role === 'saas_admin') {
    return true;
  }

  // Other users can only access their own organization
  return user.organizationId === targetOrganizationId;
}

/**
 * Check if user can manage another user
 */
export function canManageUser(user: User, targetUser: User): boolean {
  // Cannot manage yourself through this function
  if (user.uid === targetUser.uid) {
    return false;
  }

  // SaaS admin can manage anyone
  if (user.role === 'saas_admin') {
    return true;
  }

  // Must be in the same organization
  if (user.organizationId !== targetUser.organizationId) {
    return false;
  }

  // Must have user management permission
  if (!hasPermission(user, Permissions.USERS_UPDATE)) {
    return false;
  }

  // Can only manage users with lower role hierarchy
  return RoleHierarchy[user.role] > RoleHierarchy[targetUser.role];
}

/**
 * Check if user can assign a role to another user
 */
export function canAssignRole(user: User, targetRole: Role): boolean {
  // Must have role assignment permission
  if (!hasPermission(user, Permissions.USERS_ASSIGN_ROLES)) {
    return false;
  }

  // SaaS admin can assign any role
  if (user.role === 'saas_admin') {
    return true;
  }

  // Cannot assign role equal to or higher than own role
  return RoleHierarchy[user.role] > RoleHierarchy[targetRole];
}

/**
 * Guard function to require a specific permission
 */
export function requirePermission(
  user: User,
  permission: Permission
): PermissionCheckResult {
  if (hasPermission(user, permission)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `User with role '${user.role}' does not have permission '${permission}'`,
  };
}

/**
 * Guard function to require organization access
 */
export function requireOrganizationAccess(
  user: User,
  targetOrganizationId: string
): PermissionCheckResult {
  if (canAccessOrganization(user, targetOrganizationId)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `User cannot access organization '${targetOrganizationId}'`,
  };
}

/**
 * Combined guard for permission and organization access
 */
export function requirePermissionAndOrganizationAccess(
  user: User,
  permission: Permission,
  targetOrganizationId: string
): PermissionCheckResult {
  const permissionCheck = requirePermission(user, permission);
  if (!permissionCheck.allowed) {
    return permissionCheck;
  }

  return requireOrganizationAccess(user, targetOrganizationId);
}

// ============================================
// Resource-Specific Guards
// ============================================

/**
 * Check if user can view vehicles
 */
export function canViewVehicles(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.VEHICLES_VIEW);
}

/**
 * Check if user can manage vehicles
 */
export function canManageVehicles(user: User): PermissionCheckResult {
  if (
    hasAnyPermission(user, [
      Permissions.VEHICLES_MANAGE,
      Permissions.VEHICLES_CREATE,
      Permissions.VEHICLES_UPDATE,
    ])
  ) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'User does not have permission to manage vehicles',
  };
}

/**
 * Check if user can view drivers
 */
export function canViewDrivers(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.DRIVERS_VIEW);
}

/**
 * Check if user can manage drivers
 */
export function canManageDrivers(user: User): PermissionCheckResult {
  if (
    hasAnyPermission(user, [
      Permissions.DRIVERS_MANAGE,
      Permissions.DRIVERS_CREATE,
      Permissions.DRIVERS_UPDATE,
    ])
  ) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'User does not have permission to manage drivers',
  };
}

/**
 * Check if user can view vehicle assignments
 */
export function canViewVehicleAssignments(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.VEHICLE_ASSIGNMENTS_VIEW);
}

/**
 * Check if user can view vehicle issues
 */
export function canViewVehicleIssues(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.VEHICLE_ISSUES_VIEW);
}

/**
 * Check if user can report vehicle issues
 */
export function canReportVehicleIssues(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.VEHICLE_ISSUES_REPORT);
}

/**
 * Check if user can view accounting data
 */
export function canViewAccounting(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.ACCOUNTING_VIEW);
}

/**
 * Check if user can import CSV for accounting
 */
export function canImportAccountingCSV(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.ACCOUNTING_IMPORT_CSV);
}

/**
 * Check if user can view receipts
 */
export function canViewReceipts(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.RECEIPTS_VIEW);
}

/**
 * Check if user can upload receipts
 */
export function canUploadReceipts(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.RECEIPTS_UPLOAD);
}

/**
 * Check if user can report refunds
 */
export function canReportRefunds(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.REFUNDS_REPORT);
}

/**
 * Check if user can create deductions
 */
export function canCreateDeductions(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.DEDUCTIONS_CREATE);
}

/**
 * Check if user can manage fleet
 */
export function canManageFleet(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.FLEET_MANAGE);
}

/**
 * Check if user can manage organization users
 */
export function canManageOrganizationUsers(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.ORGANIZATION_MANAGE_USERS);
}

/**
 * Check if user can view all organizations (SaaS admin only)
 */
export function canViewAllOrganizations(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.SAAS_VIEW_ALL_ORGANIZATIONS);
}

/**
 * Check if user can manage organizations (SaaS admin only)
 */
export function canManageOrganizations(user: User): PermissionCheckResult {
  return requirePermission(user, Permissions.SAAS_MANAGE_ORGANIZATIONS);
}

// ============================================
// Middleware-style Guards for Cloud Functions
// ============================================

/**
 * Higher-order function to wrap a Cloud Function with permission check
 */
export function withPermission<T>(
  permission: Permission,
  handler: (user: User, data: T) => Promise<unknown>
): (authHeader: string | undefined, data: T) => Promise<unknown> {
  return async (authHeader: string | undefined, data: T) => {
    const user = await verifyAuthAndGetUser(authHeader);

    const check = requirePermission(user, permission);
    if (!check.allowed) {
      throw new PermissionDeniedError(check.reason || 'Permission denied', permission, user.role);
    }

    return handler(user, data);
  };
}

/**
 * Higher-order function to wrap a Cloud Function with organization access check
 */
export function withOrganizationAccess<T extends { organizationId: string }>(
  permission: Permission,
  handler: (user: User, data: T) => Promise<unknown>
): (authHeader: string | undefined, data: T) => Promise<unknown> {
  return async (authHeader: string | undefined, data: T) => {
    const user = await verifyAuthAndGetUser(authHeader);

    const check = requirePermissionAndOrganizationAccess(
      user,
      permission,
      data.organizationId
    );

    if (!check.allowed) {
      throw new PermissionDeniedError(check.reason || 'Permission denied', permission, user.role);
    }

    return handler(user, data);
  };
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: User): Permission[] {
  return getPermissionsForRole(user.role);
}

/**
 * Validate that a user exists and is active
 */
export async function validateUserExists(uid: string): Promise<User> {
  const user = await getUserFromFirestore(uid);

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  if (!user.isActive) {
    throw new AuthenticationError('User account is deactivated');
  }

  return user;
}

/**
 * Check if the requesting user can perform an action on target user
 */
export async function validateUserActionPermission(
  requestingUser: User,
  targetUserId: string,
  requiredPermission: Permission
): Promise<User> {
  // Check if requesting user has the required permission
  if (!hasPermission(requestingUser, requiredPermission)) {
    throw new PermissionDeniedError(
      `User does not have permission: ${requiredPermission}`,
      requiredPermission,
      requestingUser.role
    );
  }

  // Get target user
  const targetUser = await getUserFromFirestore(targetUserId);

  if (!targetUser) {
    throw new Error('Target user not found');
  }

  // Check organization access
  if (!canAccessOrganization(requestingUser, targetUser.organizationId)) {
    throw new OrganizationAccessError(
      'Cannot access users from other organizations',
      requestingUser.organizationId,
      targetUser.organizationId
    );
  }

  // Check if can manage this user (role hierarchy)
  if (
    requestingUser.uid !== targetUserId &&
    !isRoleHigherOrEqual(requestingUser.role, targetUser.role)
  ) {
    throw new PermissionDeniedError(
      'Cannot manage users with equal or higher role',
      requiredPermission,
      requestingUser.role
    );
  }

  return targetUser;
}

export {
  Role,
  User,
  Permission,
  Permissions,
  getPermissionsForRole,
  isRoleHigherOrEqual,
};
