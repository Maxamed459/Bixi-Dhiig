import type { AdminPermission, User } from "./types";

/** Mirrors the backend rule: superadmins implicitly have every permission. */
export function hasPermission(user: User | null | undefined, permission: AdminPermission) {
  if (!user || user.role !== "ADMIN") return false;
  return Boolean(user.isSuperAdmin) || (user.permissions ?? []).includes(permission);
}
