/**
 * RBAC Permissions for Royal Carriage Platform
 * Defines all roles and their associated permissions
 */

// Define all possible permissions in the system
export const Permissions = {
  // Vehicle permissions
  VEHICLES_VIEW: "vehicles:view",
  VEHICLES_CREATE: "vehicles:create",
  VEHICLES_UPDATE: "vehicles:update",
  VEHICLES_DELETE: "vehicles:delete",
  VEHICLES_MANAGE: "vehicles:manage",

  // Driver permissions
  DRIVERS_VIEW: "drivers:view",
  DRIVERS_CREATE: "drivers:create",
  DRIVERS_UPDATE: "drivers:update",
  DRIVERS_DELETE: "drivers:delete",
  DRIVERS_MANAGE: "drivers:manage",
  DRIVERS_PROFILES_MANAGE: "drivers:profiles:manage",

  // Vehicle assignment permissions
  VEHICLE_ASSIGNMENTS_VIEW: "vehicle_assignments:view",
  VEHICLE_ASSIGNMENTS_CREATE: "vehicle_assignments:create",
  VEHICLE_ASSIGNMENTS_UPDATE: "vehicle_assignments:update",
  VEHICLE_ASSIGNMENTS_DELETE: "vehicle_assignments:delete",

  // Vehicle issues/status permissions
  VEHICLE_ISSUES_VIEW: "vehicle_issues:view",
  VEHICLE_ISSUES_CREATE: "vehicle_issues:create",
  VEHICLE_ISSUES_UPDATE: "vehicle_issues:update",
  VEHICLE_ISSUES_DELETE: "vehicle_issues:delete",
  VEHICLE_ISSUES_REPORT: "vehicle_issues:report",

  // Fleet management permissions
  FLEET_VIEW: "fleet:view",
  FLEET_MANAGE: "fleet:manage",

  // Accounting permissions
  ACCOUNTING_VIEW: "accounting:view",
  ACCOUNTING_IMPORT_CSV: "accounting:import_csv",
  ACCOUNTING_EXPORT: "accounting:export",

  // Receipt permissions
  RECEIPTS_VIEW: "receipts:view",
  RECEIPTS_UPLOAD: "receipts:upload",
  RECEIPTS_DELETE: "receipts:delete",

  // Refund permissions
  REFUNDS_VIEW: "refunds:view",
  REFUNDS_REPORT: "refunds:report",
  REFUNDS_APPROVE: "refunds:approve",

  // Deduction permissions
  DEDUCTIONS_VIEW: "deductions:view",
  DEDUCTIONS_CREATE: "deductions:create",
  DEDUCTIONS_UPDATE: "deductions:update",
  DEDUCTIONS_DELETE: "deductions:delete",

  // Organization permissions
  ORGANIZATION_VIEW: "organization:view",
  ORGANIZATION_UPDATE: "organization:update",
  ORGANIZATION_MANAGE_USERS: "organization:manage_users",

  // User management permissions
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  USERS_ASSIGN_ROLES: "users:assign_roles",

  // SaaS Admin permissions
  SAAS_VIEW_ALL_ORGANIZATIONS: "saas:view_all_organizations",
  SAAS_MANAGE_ORGANIZATIONS: "saas:manage_organizations",
  SAAS_VIEW_ALL_DATA: "saas:view_all_data",

  // AI Chat permissions
  AI_CHAT_ACCESS: "ai_chat:access",
  AI_CHAT_VIEW_SENSITIVE_DATA: "ai_chat:view_sensitive_data",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

// Define all roles in the system
export type Role =
  | "dispatcher"
  | "accountant"
  | "fleet_manager"
  | "admin"
  | "saas_admin";

export const Roles: Record<Role, Role> = {
  dispatcher: "dispatcher",
  accountant: "accountant",
  fleet_manager: "fleet_manager",
  admin: "admin",
  saas_admin: "saas_admin",
} as const;

// Role hierarchy - higher roles inherit permissions from lower roles
export const RoleHierarchy: Record<Role, number> = {
  dispatcher: 1,
  accountant: 1,
  fleet_manager: 2,
  admin: 3,
  saas_admin: 4,
};

// Define permissions for each role
export const RolePermissions: Record<Role, Permission[]> = {
  dispatcher: [
    Permissions.VEHICLES_VIEW,
    Permissions.DRIVERS_VIEW,
    Permissions.VEHICLE_ASSIGNMENTS_VIEW,
    Permissions.VEHICLE_ISSUES_VIEW,
    Permissions.AI_CHAT_ACCESS,
  ],

  accountant: [
    Permissions.ACCOUNTING_VIEW,
    Permissions.ACCOUNTING_IMPORT_CSV,
    Permissions.ACCOUNTING_EXPORT,
    Permissions.DRIVERS_VIEW,
    Permissions.RECEIPTS_VIEW,
    Permissions.RECEIPTS_UPLOAD,
    Permissions.REFUNDS_VIEW,
    Permissions.REFUNDS_REPORT,
    Permissions.AI_CHAT_ACCESS,
  ],

  fleet_manager: [
    Permissions.VEHICLES_VIEW,
    Permissions.VEHICLES_CREATE,
    Permissions.VEHICLES_UPDATE,
    Permissions.DRIVERS_VIEW,
    Permissions.DRIVERS_CREATE,
    Permissions.DRIVERS_UPDATE,
    Permissions.DRIVERS_MANAGE,
    Permissions.DRIVERS_PROFILES_MANAGE,
    Permissions.VEHICLE_ASSIGNMENTS_VIEW,
    Permissions.VEHICLE_ASSIGNMENTS_CREATE,
    Permissions.VEHICLE_ASSIGNMENTS_UPDATE,
    Permissions.VEHICLE_ISSUES_VIEW,
    Permissions.VEHICLE_ISSUES_CREATE,
    Permissions.VEHICLE_ISSUES_UPDATE,
    Permissions.VEHICLE_ISSUES_REPORT,
    Permissions.FLEET_VIEW,
    Permissions.FLEET_MANAGE,
    Permissions.DEDUCTIONS_VIEW,
    Permissions.DEDUCTIONS_CREATE,
    Permissions.DEDUCTIONS_UPDATE,
    Permissions.AI_CHAT_ACCESS,
  ],

  admin: [
    // All vehicle permissions
    Permissions.VEHICLES_VIEW,
    Permissions.VEHICLES_CREATE,
    Permissions.VEHICLES_UPDATE,
    Permissions.VEHICLES_DELETE,
    Permissions.VEHICLES_MANAGE,
    // All driver permissions
    Permissions.DRIVERS_VIEW,
    Permissions.DRIVERS_CREATE,
    Permissions.DRIVERS_UPDATE,
    Permissions.DRIVERS_DELETE,
    Permissions.DRIVERS_MANAGE,
    Permissions.DRIVERS_PROFILES_MANAGE,
    // All vehicle assignment permissions
    Permissions.VEHICLE_ASSIGNMENTS_VIEW,
    Permissions.VEHICLE_ASSIGNMENTS_CREATE,
    Permissions.VEHICLE_ASSIGNMENTS_UPDATE,
    Permissions.VEHICLE_ASSIGNMENTS_DELETE,
    // All vehicle issues permissions
    Permissions.VEHICLE_ISSUES_VIEW,
    Permissions.VEHICLE_ISSUES_CREATE,
    Permissions.VEHICLE_ISSUES_UPDATE,
    Permissions.VEHICLE_ISSUES_DELETE,
    Permissions.VEHICLE_ISSUES_REPORT,
    // All fleet permissions
    Permissions.FLEET_VIEW,
    Permissions.FLEET_MANAGE,
    // All accounting permissions
    Permissions.ACCOUNTING_VIEW,
    Permissions.ACCOUNTING_IMPORT_CSV,
    Permissions.ACCOUNTING_EXPORT,
    // All receipt permissions
    Permissions.RECEIPTS_VIEW,
    Permissions.RECEIPTS_UPLOAD,
    Permissions.RECEIPTS_DELETE,
    // All refund permissions
    Permissions.REFUNDS_VIEW,
    Permissions.REFUNDS_REPORT,
    Permissions.REFUNDS_APPROVE,
    // All deduction permissions
    Permissions.DEDUCTIONS_VIEW,
    Permissions.DEDUCTIONS_CREATE,
    Permissions.DEDUCTIONS_UPDATE,
    Permissions.DEDUCTIONS_DELETE,
    // Organization permissions
    Permissions.ORGANIZATION_VIEW,
    Permissions.ORGANIZATION_UPDATE,
    Permissions.ORGANIZATION_MANAGE_USERS,
    // User management within organization
    Permissions.USERS_VIEW,
    Permissions.USERS_CREATE,
    Permissions.USERS_UPDATE,
    Permissions.USERS_DELETE,
    Permissions.USERS_ASSIGN_ROLES,
    // AI Chat permissions
    Permissions.AI_CHAT_ACCESS,
    Permissions.AI_CHAT_VIEW_SENSITIVE_DATA,
  ],

  saas_admin: [
    // All vehicle permissions
    Permissions.VEHICLES_VIEW,
    Permissions.VEHICLES_CREATE,
    Permissions.VEHICLES_UPDATE,
    Permissions.VEHICLES_DELETE,
    Permissions.VEHICLES_MANAGE,
    // All driver permissions
    Permissions.DRIVERS_VIEW,
    Permissions.DRIVERS_CREATE,
    Permissions.DRIVERS_UPDATE,
    Permissions.DRIVERS_DELETE,
    Permissions.DRIVERS_MANAGE,
    Permissions.DRIVERS_PROFILES_MANAGE,
    // All vehicle assignment permissions
    Permissions.VEHICLE_ASSIGNMENTS_VIEW,
    Permissions.VEHICLE_ASSIGNMENTS_CREATE,
    Permissions.VEHICLE_ASSIGNMENTS_UPDATE,
    Permissions.VEHICLE_ASSIGNMENTS_DELETE,
    // All vehicle issues permissions
    Permissions.VEHICLE_ISSUES_VIEW,
    Permissions.VEHICLE_ISSUES_CREATE,
    Permissions.VEHICLE_ISSUES_UPDATE,
    Permissions.VEHICLE_ISSUES_DELETE,
    Permissions.VEHICLE_ISSUES_REPORT,
    // All fleet permissions
    Permissions.FLEET_VIEW,
    Permissions.FLEET_MANAGE,
    // All accounting permissions
    Permissions.ACCOUNTING_VIEW,
    Permissions.ACCOUNTING_IMPORT_CSV,
    Permissions.ACCOUNTING_EXPORT,
    // All receipt permissions
    Permissions.RECEIPTS_VIEW,
    Permissions.RECEIPTS_UPLOAD,
    Permissions.RECEIPTS_DELETE,
    // All refund permissions
    Permissions.REFUNDS_VIEW,
    Permissions.REFUNDS_REPORT,
    Permissions.REFUNDS_APPROVE,
    // All deduction permissions
    Permissions.DEDUCTIONS_VIEW,
    Permissions.DEDUCTIONS_CREATE,
    Permissions.DEDUCTIONS_UPDATE,
    Permissions.DEDUCTIONS_DELETE,
    // Organization permissions
    Permissions.ORGANIZATION_VIEW,
    Permissions.ORGANIZATION_UPDATE,
    Permissions.ORGANIZATION_MANAGE_USERS,
    // User management
    Permissions.USERS_VIEW,
    Permissions.USERS_CREATE,
    Permissions.USERS_UPDATE,
    Permissions.USERS_DELETE,
    Permissions.USERS_ASSIGN_ROLES,
    // AI Chat permissions
    Permissions.AI_CHAT_ACCESS,
    Permissions.AI_CHAT_VIEW_SENSITIVE_DATA,
    // SaaS-specific permissions
    Permissions.SAAS_VIEW_ALL_ORGANIZATIONS,
    Permissions.SAAS_MANAGE_ORGANIZATIONS,
    Permissions.SAAS_VIEW_ALL_DATA,
  ],
};

// User interface for type checking
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
  organizationId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  isActive: boolean;
}

// Organization interface
export interface Organization {
  id: string;
  name: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  isActive: boolean;
  settings?: Record<string, unknown>;
}

// Helper function to get permissions for a role
export function getPermissionsForRole(role: Role): Permission[] {
  return RolePermissions[role] || [];
}

// Helper function to check if a role has a specific permission
export function roleHasPermission(role: Role, permission: Permission): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

// Helper function to check if one role is higher than another
export function isRoleHigherOrEqual(role: Role, targetRole: Role): boolean {
  return RoleHierarchy[role] >= RoleHierarchy[targetRole];
}

// Helper function to get all roles a user can assign (roles lower than their own)
export function getAssignableRoles(userRole: Role): Role[] {
  const userLevel = RoleHierarchy[userRole];
  return Object.entries(RoleHierarchy)
    .filter(([, level]) => level < userLevel)
    .map(([role]) => role as Role);
}

// For admin, they can assign all roles except saas_admin
export function getAssignableRolesForAdmin(): Role[] {
  return ["dispatcher", "accountant", "fleet_manager", "admin"];
}

// Export permission groups for easier reference
export const PermissionGroups = {
  VEHICLES: [
    Permissions.VEHICLES_VIEW,
    Permissions.VEHICLES_CREATE,
    Permissions.VEHICLES_UPDATE,
    Permissions.VEHICLES_DELETE,
    Permissions.VEHICLES_MANAGE,
  ],
  DRIVERS: [
    Permissions.DRIVERS_VIEW,
    Permissions.DRIVERS_CREATE,
    Permissions.DRIVERS_UPDATE,
    Permissions.DRIVERS_DELETE,
    Permissions.DRIVERS_MANAGE,
    Permissions.DRIVERS_PROFILES_MANAGE,
  ],
  ACCOUNTING: [
    Permissions.ACCOUNTING_VIEW,
    Permissions.ACCOUNTING_IMPORT_CSV,
    Permissions.ACCOUNTING_EXPORT,
  ],
  FLEET: [Permissions.FLEET_VIEW, Permissions.FLEET_MANAGE],
  ORGANIZATION: [
    Permissions.ORGANIZATION_VIEW,
    Permissions.ORGANIZATION_UPDATE,
    Permissions.ORGANIZATION_MANAGE_USERS,
  ],
  SAAS: [
    Permissions.SAAS_VIEW_ALL_ORGANIZATIONS,
    Permissions.SAAS_MANAGE_ORGANIZATIONS,
    Permissions.SAAS_VIEW_ALL_DATA,
  ],
} as const;
