export type UserRole = "admin" | "hospital" | "user";

export interface User {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
}

/**
 * Assumption: the backend wraps every response in an envelope shaped like:
 * { success: boolean, message: string, data: T }
 * If your API returns the payload directly (no `data` wrapper), `unwrapResponse`
 * in lib/auth-api.ts already falls back to the raw body, so nothing else needs
 * to change.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}
