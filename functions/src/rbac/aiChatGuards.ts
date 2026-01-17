/**
 * AI Chat Guards for Royal Carriage Platform
 * Filters what data the AI can show/access based on user role
 */

import {
  User,
  Role,
  Permission,
  Permissions,
  roleHasPermission,
} from './permissions';

// Data categories that can be filtered
export type DataCategory =
  | 'vehicles'
  | 'drivers'
  | 'vehicle_assignments'
  | 'vehicle_issues'
  | 'accounting'
  | 'receipts'
  | 'refunds'
  | 'deductions'
  | 'fleet'
  | 'users'
  | 'organization'
  | 'all_organizations';

// Sensitive field types
export type SensitiveFieldCategory =
  | 'financial'
  | 'personal'
  | 'internal'
  | 'administrative';

// Configuration for what each role can access via AI chat
export interface AIChatAccessConfig {
  allowedDataCategories: DataCategory[];
  canViewSensitiveData: boolean;
  sensitiveFieldsAllowed: SensitiveFieldCategory[];
  canQueryCrossOrganization: boolean;
  maxResultsPerQuery: number;
  allowedQueryTypes: string[];
}

// AI Chat access configuration per role
export const AIAccessConfigByRole: Record<Role, AIChatAccessConfig> = {
  dispatcher: {
    allowedDataCategories: [
      'vehicles',
      'drivers',
      'vehicle_assignments',
      'vehicle_issues',
    ],
    canViewSensitiveData: false,
    sensitiveFieldsAllowed: [],
    canQueryCrossOrganization: false,
    maxResultsPerQuery: 50,
    allowedQueryTypes: [
      'list',
      'search',
      'status',
      'availability',
    ],
  },

  accountant: {
    allowedDataCategories: [
      'drivers',
      'accounting',
      'receipts',
      'refunds',
    ],
    canViewSensitiveData: true,
    sensitiveFieldsAllowed: ['financial'],
    canQueryCrossOrganization: false,
    maxResultsPerQuery: 100,
    allowedQueryTypes: [
      'list',
      'search',
      'aggregate',
      'report',
      'export',
    ],
  },

  fleet_manager: {
    allowedDataCategories: [
      'vehicles',
      'drivers',
      'vehicle_assignments',
      'vehicle_issues',
      'fleet',
      'deductions',
    ],
    canViewSensitiveData: true,
    sensitiveFieldsAllowed: ['personal', 'internal'],
    canQueryCrossOrganization: false,
    maxResultsPerQuery: 100,
    allowedQueryTypes: [
      'list',
      'search',
      'status',
      'report',
      'analytics',
    ],
  },

  admin: {
    allowedDataCategories: [
      'vehicles',
      'drivers',
      'vehicle_assignments',
      'vehicle_issues',
      'accounting',
      'receipts',
      'refunds',
      'deductions',
      'fleet',
      'users',
      'organization',
    ],
    canViewSensitiveData: true,
    sensitiveFieldsAllowed: ['financial', 'personal', 'internal', 'administrative'],
    canQueryCrossOrganization: false,
    maxResultsPerQuery: 500,
    allowedQueryTypes: [
      'list',
      'search',
      'aggregate',
      'report',
      'analytics',
      'export',
      'audit',
    ],
  },

  saas_admin: {
    allowedDataCategories: [
      'vehicles',
      'drivers',
      'vehicle_assignments',
      'vehicle_issues',
      'accounting',
      'receipts',
      'refunds',
      'deductions',
      'fleet',
      'users',
      'organization',
      'all_organizations',
    ],
    canViewSensitiveData: true,
    sensitiveFieldsAllowed: ['financial', 'personal', 'internal', 'administrative'],
    canQueryCrossOrganization: true,
    maxResultsPerQuery: 1000,
    allowedQueryTypes: [
      'list',
      'search',
      'aggregate',
      'report',
      'analytics',
      'export',
      'audit',
      'system',
    ],
  },
};

// Fields that should be redacted based on sensitivity level
export const SensitiveFields: Record<SensitiveFieldCategory, string[]> = {
  financial: [
    'salary',
    'bankAccount',
    'accountNumber',
    'routingNumber',
    'ssn',
    'taxId',
    'payRate',
    'commission',
    'bonus',
    'deductionAmount',
    'totalEarnings',
    'netPay',
  ],
  personal: [
    'dateOfBirth',
    'socialSecurityNumber',
    'driverLicense',
    'homeAddress',
    'personalPhone',
    'emergencyContact',
    'medicalInfo',
  ],
  internal: [
    'internalNotes',
    'performanceScore',
    'disciplinaryActions',
    'warnings',
    'terminationReason',
  ],
  administrative: [
    'apiKeys',
    'secretKeys',
    'passwords',
    'tokens',
    'adminNotes',
    'systemConfig',
  ],
};

/**
 * Check if user has AI chat access
 */
export function canAccessAIChat(user: User): boolean {
  return roleHasPermission(user.role, Permissions.AI_CHAT_ACCESS);
}

/**
 * Get AI access configuration for a user
 */
export function getAIAccessConfig(user: User): AIChatAccessConfig {
  return AIAccessConfigByRole[user.role];
}

/**
 * Check if user can access a specific data category via AI
 */
export function canAIAccessDataCategory(
  user: User,
  category: DataCategory
): boolean {
  const config = getAIAccessConfig(user);
  return config.allowedDataCategories.includes(category);
}

/**
 * Check if user can perform a specific query type via AI
 */
export function canAIPerformQueryType(
  user: User,
  queryType: string
): boolean {
  const config = getAIAccessConfig(user);
  return config.allowedQueryTypes.includes(queryType);
}

/**
 * Get the list of fields to redact for a user
 */
export function getFieldsToRedact(user: User): string[] {
  const config = getAIAccessConfig(user);
  const fieldsToRedact: string[] = [];

  // Collect all sensitive fields that the user cannot see
  for (const [category, fields] of Object.entries(SensitiveFields)) {
    if (!config.sensitiveFieldsAllowed.includes(category as SensitiveFieldCategory)) {
      fieldsToRedact.push(...fields);
    }
  }

  return fieldsToRedact;
}

/**
 * Redact sensitive fields from an object based on user permissions
 */
export function redactSensitiveData<T extends Record<string, unknown>>(
  user: User,
  data: T
): T {
  const fieldsToRedact = getFieldsToRedact(user);
  const redactedData = { ...data };

  for (const field of fieldsToRedact) {
    if (field in redactedData) {
      redactedData[field] = '[REDACTED]' as unknown as T[typeof field];
    }
  }

  return redactedData;
}

/**
 * Redact sensitive fields from an array of objects
 */
export function redactSensitiveDataArray<T extends Record<string, unknown>>(
  user: User,
  dataArray: T[]
): T[] {
  return dataArray.map((item) => redactSensitiveData(user, item));
}

/**
 * Filter query results based on user permissions
 */
export interface AIQueryResult<T> {
  data: T[];
  totalCount: number;
  truncated: boolean;
  allowedFields: string[];
  redactedFields: string[];
}

export function filterAIQueryResults<T extends Record<string, unknown>>(
  user: User,
  results: T[],
  totalCount: number
): AIQueryResult<T> {
  const config = getAIAccessConfig(user);
  const fieldsToRedact = getFieldsToRedact(user);

  // Truncate results if exceeding max
  const truncated = results.length > config.maxResultsPerQuery;
  const limitedResults = results.slice(0, config.maxResultsPerQuery);

  // Redact sensitive data
  const redactedResults = redactSensitiveDataArray(user, limitedResults);

  // Get allowed fields (all fields minus redacted ones)
  const allFields = limitedResults.length > 0 ? Object.keys(limitedResults[0]) : [];
  const allowedFields = allFields.filter((f) => !fieldsToRedact.includes(f));

  return {
    data: redactedResults,
    totalCount,
    truncated,
    allowedFields,
    redactedFields: fieldsToRedact.filter((f) => allFields.includes(f)),
  };
}

/**
 * Build organization filter for AI queries
 */
export interface OrganizationFilter {
  organizationId?: string;
  allowCrossOrg: boolean;
}

export function buildOrganizationFilter(
  user: User,
  requestedOrgId?: string
): OrganizationFilter {
  const config = getAIAccessConfig(user);

  if (config.canQueryCrossOrganization) {
    return {
      organizationId: requestedOrgId, // Can be undefined for all orgs
      allowCrossOrg: true,
    };
  }

  return {
    organizationId: user.organizationId,
    allowCrossOrg: false,
  };
}

/**
 * Validate an AI query request
 */
export interface AIQueryRequest {
  category: DataCategory;
  queryType: string;
  organizationId?: string;
  filters?: Record<string, unknown>;
}

export interface AIQueryValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  modifiedRequest?: AIQueryRequest;
}

export function validateAIQueryRequest(
  user: User,
  request: AIQueryRequest
): AIQueryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config = getAIAccessConfig(user);

  // Check AI chat access
  if (!canAccessAIChat(user)) {
    errors.push('User does not have AI chat access');
    return { valid: false, errors, warnings };
  }

  // Check data category access
  if (!canAIAccessDataCategory(user, request.category)) {
    errors.push(`User cannot access data category: ${request.category}`);
  }

  // Check query type access
  if (!canAIPerformQueryType(user, request.queryType)) {
    errors.push(`User cannot perform query type: ${request.queryType}`);
  }

  // Check organization access
  if (request.organizationId && !config.canQueryCrossOrganization) {
    if (request.organizationId !== user.organizationId) {
      errors.push('User cannot query data from other organizations');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Build modified request with proper organization filter
  const orgFilter = buildOrganizationFilter(user, request.organizationId);
  const modifiedRequest: AIQueryRequest = {
    ...request,
    organizationId: orgFilter.organizationId || user.organizationId,
  };

  // Add warnings for potential issues
  if (request.queryType === 'export' && !config.canViewSensitiveData) {
    warnings.push('Some sensitive fields will be redacted from export');
  }

  return {
    valid: true,
    errors,
    warnings,
    modifiedRequest,
  };
}

/**
 * Generate AI system prompt additions based on user role
 */
export function generateAISystemPromptForRole(user: User): string {
  const config = getAIAccessConfig(user);
  const fieldsToRedact = getFieldsToRedact(user);

  let prompt = `User Role: ${user.role}\n`;
  prompt += `Organization ID: ${user.organizationId}\n\n`;

  prompt += 'DATA ACCESS RESTRICTIONS:\n';
  prompt += `- Allowed data categories: ${config.allowedDataCategories.join(', ')}\n`;
  prompt += `- Allowed query types: ${config.allowedQueryTypes.join(', ')}\n`;
  prompt += `- Maximum results per query: ${config.maxResultsPerQuery}\n`;
  prompt += `- Cross-organization queries: ${config.canQueryCrossOrganization ? 'ALLOWED' : 'NOT ALLOWED'}\n`;

  if (fieldsToRedact.length > 0) {
    prompt += `\nREDACTED FIELDS (do not display or discuss):\n`;
    prompt += fieldsToRedact.map((f) => `- ${f}`).join('\n');
  }

  prompt += '\n\nIMPORTANT: Only provide information that the user is authorized to access based on their role.';

  return prompt;
}

/**
 * Check if a specific field should be shown to the user
 */
export function shouldShowField(user: User, fieldName: string): boolean {
  const fieldsToRedact = getFieldsToRedact(user);
  return !fieldsToRedact.includes(fieldName);
}

/**
 * Get data categories available to user for AI suggestions
 */
export function getAvailableDataCategories(user: User): DataCategory[] {
  const config = getAIAccessConfig(user);
  return config.allowedDataCategories;
}

/**
 * Get query types available to user for AI suggestions
 */
export function getAvailableQueryTypes(user: User): string[] {
  const config = getAIAccessConfig(user);
  return config.allowedQueryTypes;
}

/**
 * Build a safe Firestore query based on user permissions
 */
export interface SafeQueryConfig {
  collection: string;
  organizationIdField: string;
  additionalFilters?: Array<{
    field: string;
    operator: FirebaseFirestore.WhereFilterOp;
    value: unknown;
  }>;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
}

export function buildSafeQueryParams(
  user: User,
  config: SafeQueryConfig
): SafeQueryConfig {
  const accessConfig = getAIAccessConfig(user);

  // Ensure organization filter is applied for non-saas_admin
  const filters = config.additionalFilters || [];

  if (!accessConfig.canQueryCrossOrganization) {
    // Add organization filter if not already present
    const hasOrgFilter = filters.some(
      (f) => f.field === config.organizationIdField
    );

    if (!hasOrgFilter) {
      filters.push({
        field: config.organizationIdField,
        operator: '==',
        value: user.organizationId,
      });
    }
  }

  // Apply result limit
  const maxLimit = accessConfig.maxResultsPerQuery;
  const requestedLimit = config.limit || maxLimit;
  const effectiveLimit = Math.min(requestedLimit, maxLimit);

  return {
    ...config,
    additionalFilters: filters,
    limit: effectiveLimit,
  };
}

// Export types and interfaces
export type {
  AIChatAccessConfig,
  AIQueryRequest,
  AIQueryValidationResult,
  OrganizationFilter,
  SafeQueryConfig,
};
