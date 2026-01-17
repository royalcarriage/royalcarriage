/**
 * RBAC Module Exports for Royal Carriage Platform
 * Consolidates all RBAC-related exports for easy importing
 */

// Export all permissions and role definitions
export {
  Permissions,
  Permission,
  Roles,
  Role,
  RoleHierarchy,
  RolePermissions,
  User,
  Organization,
  getPermissionsForRole,
  roleHasPermission,
  isRoleHigherOrEqual,
  getAssignableRoles,
  getAssignableRolesForAdmin,
  PermissionGroups,
} from './permissions';

// Export all guards and permission checking functions
export {
  // Error types
  PermissionDeniedError,
  OrganizationAccessError,
  AuthenticationError,
  // Context and result types
  PermissionContext,
  PermissionCheckResult,
  // User/auth functions
  getUserFromFirestore,
  verifyAuthAndGetUser,
  validateUserExists,
  validateUserActionPermission,
  // Permission checking functions
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessOrganization,
  canManageUser,
  canAssignRole,
  // Guard functions
  requirePermission,
  requireOrganizationAccess,
  requirePermissionAndOrganizationAccess,
  // Resource-specific guards
  canViewVehicles,
  canManageVehicles,
  canViewDrivers,
  canManageDrivers,
  canViewVehicleAssignments,
  canViewVehicleIssues,
  canReportVehicleIssues,
  canViewAccounting,
  canImportAccountingCSV,
  canViewReceipts,
  canUploadReceipts,
  canReportRefunds,
  canCreateDeductions,
  canManageFleet,
  canManageOrganizationUsers,
  canViewAllOrganizations,
  canManageOrganizations,
  // Higher-order guards
  withPermission,
  withOrganizationAccess,
  getUserPermissions,
} from './guards';

// Export all AI chat guards
export {
  // Types
  DataCategory,
  SensitiveFieldCategory,
  AIChatAccessConfig,
  AIQueryRequest,
  AIQueryValidationResult,
  AIQueryResult,
  OrganizationFilter,
  SafeQueryConfig,
  // Configuration
  AIAccessConfigByRole,
  SensitiveFields,
  // Functions
  canAccessAIChat,
  getAIAccessConfig,
  canAIAccessDataCategory,
  canAIPerformQueryType,
  getFieldsToRedact,
  redactSensitiveData,
  redactSensitiveDataArray,
  filterAIQueryResults,
  buildOrganizationFilter,
  validateAIQueryRequest,
  generateAISystemPromptForRole,
  shouldShowField,
  getAvailableDataCategories,
  getAvailableQueryTypes,
  buildSafeQueryParams,
} from './aiChatGuards';
