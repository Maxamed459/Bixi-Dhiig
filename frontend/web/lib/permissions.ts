import type { AdminPermission, User } from "./types";

type PermissionUser = Pick<User, "isSuperAdmin" | "permissions"> | null | undefined;

/** Superadmins implicitly hold every permission. */
export function hasPermission(
  user: PermissionUser,
  permission: AdminPermission,
): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  return (user.permissions ?? []).includes(permission);
}

export function hasAnyPermission(
  user: PermissionUser,
  permissions: AdminPermission[],
): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}
