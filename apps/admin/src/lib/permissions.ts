/**
 * Role-based Access Control (RBAC) System
 *
 * Defines permissions for different user roles across the admin dashboard.
 */

import type { Role } from "../types";

// Permission types
export type Permission =
  | "view:dashboard"
  | "view:ai-systems"
  | "view:imports"
  | "view:analytics"
  | "view:websites"
  | "view:seo"
  | "view:images"
  | "view:enterprise"
  | "view:workflows"
  | "view:deploy"
  | "view:users"
  | "view:settings"
  | "view:audit"
  | "view:vehicles"
  | "view:drivers"
  | "view:assignments"
  | "view:issues"
  | "view:accounting"
  | "view:receipts"
  | "view:refunds"
  | "view:payroll"
  | "view:deductions"
  | "view:organizations"
  | "edit:content"
  | "edit:settings"
  | "edit:users"
  | "edit:vehicles"
  | "edit:drivers"
  | "edit:fleet"
  | "edit:issues"
  | "edit:deductions"
  | "edit:organizations"
  | "execute:imports"
  | "execute:deploy"
  | "execute:ai-commands"
  | "execute:regeneration"
  | "approve:content"
  | "delete:content"
  | "delete:users"
  | "admin:system"
  | "admin:organizations";

// Role permission mappings
const ROLE_PERMISSIONS: Partial<Record<Role, Permission[]>> = {
  viewer: ["view:dashboard", "view:analytics", "view:websites"],
  // Dispatcher: view vehicles, drivers, assignments, issues
  dispatcher: [
    "view:dashboard",
    "view:vehicles",
    "view:drivers",
    "view:assignments",
    "view:issues",
  ],
  // Accountant: import CSV, view accounting, drivers, receipts, refunds
  accountant: [
    "view:dashboard",
    "view:imports",
    "view:accounting",
    "view:drivers",
    "view:receipts",
    "view:refunds",
    "execute:imports",
  ],
  // Fleet Manager: manage drivers, fleet, issues, deductions
  fleet_manager: [
    "view:dashboard",
    "view:vehicles",
    "view:drivers",
    "view:assignments",
    "view:issues",
    "view:deductions",
    "view:payroll",
    "view:receipts",
    "edit:vehicles",
    "edit:drivers",
    "edit:fleet",
    "edit:issues",
    "edit:deductions",
  ],
  editor: [
    "view:dashboard",
    "view:ai-systems",
    "view:imports",
    "view:analytics",
    "view:websites",
    "view:seo",
    "view:images",
    "view:enterprise",
    "view:workflows",
    "edit:content",
    "execute:ai-commands",
  ],
  // Admin: full access within organization
  admin: [
    "view:dashboard",
    "view:ai-systems",
    "view:imports",
    "view:analytics",
    "view:websites",
    "view:seo",
    "view:images",
    "view:enterprise",
    "view:workflows",
    "view:deploy",
    "view:users",
    "view:settings",
    "view:audit",
    "view:vehicles",
    "view:drivers",
    "view:assignments",
    "view:issues",
    "view:accounting",
    "view:receipts",
    "view:refunds",
    "view:payroll",
    "view:deductions",
    "edit:content",
    "edit:settings",
    "edit:vehicles",
    "edit:drivers",
    "edit:fleet",
    "edit:issues",
    "edit:deductions",
    "execute:imports",
    "execute:deploy",
    "execute:ai-commands",
    "execute:regeneration",
    "approve:content",
    "delete:content",
  ],
  // Superadmin: legacy role, same as admin
  superadmin: [
    "view:dashboard",
    "view:ai-systems",
    "view:imports",
    "view:analytics",
    "view:websites",
    "view:seo",
    "view:images",
    "view:enterprise",
    "view:workflows",
    "view:deploy",
    "view:users",
    "view:settings",
    "view:audit",
    "view:vehicles",
    "view:drivers",
    "view:assignments",
    "view:issues",
    "view:accounting",
    "view:receipts",
    "view:refunds",
    "view:payroll",
    "view:deductions",
    "view:organizations",
    "edit:content",
    "edit:settings",
    "edit:users",
    "edit:vehicles",
    "edit:drivers",
    "edit:fleet",
    "edit:issues",
    "edit:deductions",
    "edit:organizations",
    "execute:imports",
    "execute:deploy",
    "execute:ai-commands",
    "execute:regeneration",
    "approve:content",
    "delete:content",
    "delete:users",
    "admin:system",
    "admin:organizations",
  ],
  // SaaS Admin: view/manage everything across all organizations
  saas_admin: [
    "view:dashboard",
    "view:ai-systems",
    "view:imports",
    "view:analytics",
    "view:websites",
    "view:seo",
    "view:images",
    "view:enterprise",
    "view:workflows",
    "view:deploy",
    "view:users",
    "view:settings",
    "view:audit",
    "view:vehicles",
    "view:drivers",
    "view:assignments",
    "view:issues",
    "view:accounting",
    "view:receipts",
    "view:refunds",
    "view:payroll",
    "view:deductions",
    "view:organizations",
    "edit:content",
    "edit:settings",
    "edit:users",
    "edit:vehicles",
    "edit:drivers",
    "edit:fleet",
    "edit:issues",
    "edit:deductions",
    "edit:organizations",
    "execute:imports",
    "execute:deploy",
    "execute:ai-commands",
    "execute:regeneration",
    "approve:content",
    "delete:content",
    "delete:users",
    "admin:system",
    "admin:organizations",
  ],
};

// Page to permission mapping
export const PAGE_PERMISSIONS: Record<string, Permission> = {
  overview: "view:dashboard",
  "ai-command-center": "view:ai-systems",
  "ai-chat": "view:ai-systems",
  "ai-analytics": "view:ai-systems",
  "content-pipeline": "view:ai-systems",
  "imports-moovs": "view:imports",
  "imports-ads": "view:imports",
  "data-import": "view:imports",
  roi: "view:analytics",
  "site-health": "view:websites",
  "money-pages": "view:websites",
  fleet: "view:websites",
  cities: "view:websites",
  blog: "view:websites",
  "seo-queue": "view:seo",
  "seo-drafts": "view:seo",
  "seo-gate-reports": "view:seo",
  "seo-publish": "view:seo",
  "images-library": "view:images",
  "images-missing": "view:images",
  locations: "view:enterprise",
  services: "view:enterprise",
  "fleet-management": "view:enterprise",
  "content-approval": "view:workflows",
  "feedback-alerts": "view:workflows",
  "deploy-logs": "view:deploy",
  users: "view:users",
  settings: "view:settings",
  "self-audit": "view:audit",
};

// Action to permission mapping
export const ACTION_PERMISSIONS: Record<string, Permission> = {
  importMoovs: "execute:imports",
  importAds: "execute:imports",
  runGate: "execute:regeneration",
  deploy: "execute:deploy",
  approveContent: "approve:content",
  rejectContent: "approve:content",
  deleteContent: "delete:content",
  editSettings: "edit:settings",
  editUsers: "edit:users",
  deleteUsers: "delete:users",
  executeTerminal: "execute:ai-commands",
  regenerateContent: "execute:regeneration",
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return (ROLE_PERMISSIONS[role] || []).includes(permission) ?? false;
}

/**
 * Check if a role can access a specific page
 */
export function canAccessPage(role: Role, pageId: string): boolean {
  const requiredPermission = PAGE_PERMISSIONS[pageId];
  if (!requiredPermission) return true; // If no permission defined, allow access
  return hasPermission(role, requiredPermission);
}

/**
 * Check if a role can perform a specific action
 */
export function canPerformAction(role: Role, action: string): boolean {
  const requiredPermission = ACTION_PERMISSIONS[action];
  if (!requiredPermission) return false; // If no permission defined, deny by default
  return hasPermission(role, requiredPermission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role is at least a certain level
 */
export function isAtLeastRole(currentRole: Role, requiredRole: Role): boolean {
  // Role hierarchy: lower index = lower privilege
  const roleHierarchy: Role[] = [
    "viewer",
    "dispatcher",
    "accountant",
    "editor",
    "fleet_manager",
    "admin",
    "superadmin",
    "saas_admin",
  ];
  const currentIndex = roleHierarchy.indexOf(currentRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole);
  // If role not found in hierarchy, default to lowest
  if (currentIndex === -1) return false;
  if (requiredIndex === -1) return true;
  return currentIndex >= requiredIndex;
}

/**
 * Filter navigation items based on role
 */
export function filterNavByRole<T extends { id: string; children?: T[] }>(
  items: T[],
  role: Role,
): T[] {
  return items
    .filter((item) => {
      // Check if this item has children
      if (item.children && item.children.length > 0) {
        // Filter children and keep parent if any children are accessible
        const accessibleChildren = filterNavByRole(item.children, role);
        return accessibleChildren.length > 0;
      }
      // For leaf items, check permission
      return canAccessPage(role, item.id);
    })
    .map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterNavByRole(item.children, role),
        };
      }
      return item;
    });
}

/**
 * Access control wrapper component props
 */
export interface AccessControlProps {
  role: Role;
  requiredPermission?: Permission;
  requiredRole?: Role;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Format role for display
 */
export function formatRole(role: Role): string {
  const labels: Partial<Record<Role, string>> = {
    viewer: "Viewer",
    dispatcher: "Dispatcher",
    accountant: "Accountant",
    editor: "Editor",
    fleet_manager: "Fleet Manager",
    admin: "Admin",
    superadmin: "Super Admin",
    saas_admin: "SaaS Admin",
  };
  return labels[role] || role;
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: Role): string {
  const colors: Partial<Record<Role, string>> = {
    viewer: "bg-slate-100 text-slate-700",
    dispatcher: "bg-cyan-100 text-cyan-700",
    accountant: "bg-green-100 text-green-700",
    editor: "bg-blue-100 text-blue-700",
    fleet_manager: "bg-orange-100 text-orange-700",
    admin: "bg-amber-100 text-amber-700",
    superadmin: "bg-purple-100 text-purple-700",
    saas_admin: "bg-rose-100 text-rose-700",
  };
  return colors[role] || "bg-slate-100 text-slate-700";
}
