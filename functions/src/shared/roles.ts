// Shared role helpers and Firebase sync helpers (optional)
import { UserRole, type UserRoleType } from './schema';

export function roleHierarchy(role: UserRoleType) {
  const map: Record<UserRoleType, number> = {
    [UserRole.USER]: 1,
    [UserRole.ADMIN]: 2,
    [UserRole.SUPER_ADMIN]: 3,
  };
  return map[role] || 0;
}

export function hasAtLeast(role: UserRoleType, minRole: UserRoleType) {
  return roleHierarchy(role) >= roleHierarchy(minRole);
}

// Optional: map DB role to Firebase custom claim
export function firebaseClaimFromRole(role: UserRoleType) {
  // Use numeric level or string role depending on your claim model
  return { role };
}
