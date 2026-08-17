import type { UserRole } from "./types";

/**
 * Only admin and hospital accounts may use the web dashboard.
 * Regular `user` accounts are mobile-app only.
 */
export const DASHBOARD_ROLES: UserRole[] = ["ADMIN", "HOSPITAL"];

export function isAllowedRole(
  role: UserRole | undefined | null,
  allowed: UserRole[] = DASHBOARD_ROLES,
): boolean {
  if (!role) return false;
  return allowed.includes(role);
}
