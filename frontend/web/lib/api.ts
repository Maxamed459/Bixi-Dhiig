import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { store } from "@/store/store";
import { setCredentials, setAccessToken, logout } from "@/store/features/authSlice";
import type { User } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/**
 * Main API client. `withCredentials: true` is required so the browser sends
 * the backend's HttpOnly refresh-token cookie on every request (needed for
 * POST /auth/refresh-token to work).
 */
// The backend is mobile-first: it treats every request as the mobile app (refresh
// token in the JSON body, no cookie) unless this header says otherwise. The web
// dashboard must always identify itself so it gets the HttpOnly refresh cookie.
const COMMON_HEADERS = {
  "Content-Type": "application/json",
  "X-Client-Type": "web",
};

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: COMMON_HEADERS,
});

// Separate client (no interceptors) used only for the refresh call itself,
// so a failed refresh can never trigger another refresh attempt.
const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: COMMON_HEADERS,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.accessToken;
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
 * Calls POST /auth/refresh-token (cookie-based) to get a new access token,
 * writing the result straight into the Redux store. Assumption: the endpoint
 * returns { accessToken, user } (top level or wrapped in `data`) so a page
 * reload — or a redirect back from Google OAuth — can restore both the
 * session and the role, since there is no separate GET /auth/me endpoint.
 * If your backend only returns `accessToken`, the app still works, but
 * `user` won't be restored until the next login/verify call.
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
          store.dispatch(logout());
          return null;
        }

        if (user) {
          store.dispatch(setCredentials({ user, accessToken }));
        } else {
          store.dispatch(setAccessToken(accessToken));
        }

        return accessToken;
      })
      .catch(() => {
        store.dispatch(logout());
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
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh-token") ||
      url.includes("/auth/register");

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
