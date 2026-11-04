import type { AdminPermission, Role } from "../generated/prisma/enums.js";

export const ADMIN_PERMISSIONS: AdminPermission[] = [
  "MANAGE_USERS",
  "REVIEW_REQUESTS",
  "MANAGE_DONATIONS",
  "VIEW_NOTIFICATIONS",
];

export interface PermissionActor {
  role: Role;
  isSuperAdmin?: boolean | null;
  permissions?: AdminPermission[] | null;
}

/** Superadmins implicitly have every permission. */
export const hasPermission = (
  user: PermissionActor | undefined | null,
  permission: AdminPermission,
): boolean => {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  return (user.permissions ?? []).includes(permission);
};

export const hasAnyPermission = (
  user: PermissionActor | undefined | null,
  permissions: AdminPermission[],
): boolean => permissions.some((permission) => hasPermission(user, permission));
