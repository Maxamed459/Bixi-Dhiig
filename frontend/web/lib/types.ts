import type { BloodType } from "./blood-requests";

export type UserRole = "ADMIN" | "HOSPITAL" | "USER";

export const ADMIN_PERMISSIONS = [
  "MANAGE_USERS",
  "REVIEW_REQUESTS",
  "MANAGE_DONATIONS",
  "VIEW_NOTIFICATIONS",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export interface User {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  isSuperAdmin?: boolean;
  permissions?: AdminPermission[];
  canDonate?: boolean;
  canRequest?: boolean;
  avater?: string | null;
  phone?: string | null;
  city?: string | null;
  bloodType?: BloodType | null;
  receiveAlerts?: boolean;
  isVerified?: boolean;
  is_email_verified?: boolean;
  active?: boolean;
  is_deleted?: boolean;
  last_login_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
}

/**
 * Assumption: the backend wraps every response in an envelope shaped like:
 * { success: boolean, message: string, data: T }
 * If your API returns the payload directly (no `data` wrapper), `unwrap()`
 * in lib/auth.ts already falls back to the raw body, so nothing else needs
 * to change.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
