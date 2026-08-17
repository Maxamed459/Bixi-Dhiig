"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getAuthState,
  setAuthState,
  clearAuthState,
  subscribeAuthState,
} from "@/lib/auth-store";
import { refreshAccessToken } from "@/lib/api-client";
import {
  loginRequest,
  registerRequest,
  verifyRequest,
  resendCodeRequest,
  type RegisterPayload,
} from "@/lib/auth-api";
import { isAllowedRole } from "@/lib/role-guard";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: Omit<RegisterPayload, "role">) => Promise<User>;
  verify: (submittedCode: string) => Promise<User>;
  resendCode: () => Promise<void>;
  logout: (options?: { silent?: boolean }) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const emptyState = { user: null, accessToken: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const authState = useSyncExternalStore(subscribeAuthState, getAuthState, () => emptyState);
  const [isLoading, setIsLoading] = useState(true);

  // On first mount, try to silently restore a session using the HttpOnly
  // refresh-token cookie. This is what makes a page reload keep the user
  // signed in even though the access token only lives in memory.
  useEffect(() => {
    let active = true;

    refreshAccessToken().finally(() => {
      if (active) setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(
    (options?: { silent?: boolean }) => {
      clearAuthState();
      if (!options?.silent) {
        router.push("/login");
      }
    },
    [router],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { user, accessToken } = await loginRequest(email, password);

      if (!isAllowedRole(user.role)) {
        clearAuthState();
        toast.error("This account doesn't have access to the web dashboard. Please use the mobile app.");
        router.push("/unauthorized");
        throw new Error("ROLE_NOT_ALLOWED");
      }

      setAuthState({ user, accessToken });
      return user;
    },
    [router],
  );

  const register = useCallback(async (payload: Omit<RegisterPayload, "role">) => {
    const { user, accessToken } = await registerRequest({ ...payload, role: "hospital" });
    setAuthState({ user, accessToken });
    return user;
  }, []);

  const verify = useCallback(async (submittedCode: string) => {
    const { user } = await verifyRequest(submittedCode);
    setAuthState({ user });
    return user;
  }, []);

  const resendCode = useCallback(async () => {
    await resendCodeRequest();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: authState.user,
      accessToken: authState.accessToken,
      isLoading,
      isAuthenticated: Boolean(authState.accessToken && authState.user),
      login,
      register,
      verify,
      resendCode,
      logout,
    }),
    [authState, isLoading, login, register, verify, resendCode, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
