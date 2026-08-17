import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setAuthState, clearAuthState } from "./auth-store";
import type { User } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

/**
 * Main API client. `withCredentials: true` is required so the browser sends
 * the backend's HttpOnly refresh-token cookie on every request (needed for
 * POST /auth/refresh-token to work).
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Separate client (no interceptors) used only for the refresh call itself,
// so a failed refresh can never trigger another refresh attempt.
const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

interface RefreshResponseData {
  accessToken?: string;
  user?: User;
  data?: { accessToken?: string; user?: User };
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Calls POST /auth/refresh-token (cookie-based) to get a new access token.
 * Assumption: the endpoint returns { accessToken, user } (either at the top
 * level or wrapped in `data`) so a page refresh can silently restore both the
 * session and the user's role, since there is no separate GET /auth/me
 * endpoint available. If your backend only returns `accessToken`, the app
 * will still work, but `user` won't be restored until the next login/verify
 * call — add a `/auth/me` endpoint if you want that fixed.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<RefreshResponseData>("/auth/refresh-token")
      .then((res) => {
        const body = res.data;
        const accessToken = body?.data?.accessToken ?? body?.accessToken ?? null;
        const user = body?.data?.user ?? body?.user;

        if (!accessToken) {
          clearAuthState();
          return null;
        }

        setAuthState({ accessToken, ...(user ? { user } : {}) });
        return accessToken;
      })
      .catch(() => {
        clearAuthState();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const url = originalRequest?.url ?? "";
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/refresh-token") || url.includes("/auth/register");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);
