"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCredentials,
  setUser,
  logout as logoutAction,
} from "@/store/features/authSlice";
import {
  loginRequest,
  registerHospitalRequest,
  verifyRequest,
  resendCodeRequest,
  logoutRequest,
  type RegisterHospitalPayload,
  googleOauth,
} from "@/lib/auth";
import { isAllowedRole } from "@/lib/role-guard";
import { useApiError } from "@/hooks/useApiError";
import { useT } from "@/lib/i18n/context";

/**
 * Same public shape as the old Context-based useAuth() hook, so pages and
 * components (Sidebar, dashboard pages, verify-email, etc.) don't need to
 * change — only the internals moved from React Context to Redux Toolkit.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useT();
  const apiError = useApiError();
  const { user, accessToken, isAuthenticated, status } = useAppSelector(
    (state) => state.auth,
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: loggedInUser, accessToken: token } = await loginRequest(
        email,
        password,
      );

      if (!isAllowedRole(loggedInUser.role)) {
        dispatch(logoutAction());
        toast.error(t("auth.roleNotAllowed"));
        router.push("/unauthorized");
        throw new Error("ROLE_NOT_ALLOWED");
      }

      dispatch(setCredentials({ user: loggedInUser, accessToken: token }));
      return loggedInUser;
    },
    [dispatch, router, t],
  );

  const register = useCallback(
    async (payload: Omit<RegisterHospitalPayload, "role">) => {
      const { user: newUser, accessToken: token } =
        await registerHospitalRequest({
          ...payload,
          role: "hospital",
        });
      dispatch(setCredentials({ user: newUser, accessToken: token }));
      return newUser;
    },
    [dispatch],
  );

  const verify = useCallback(
    async (submittedCode: string) => {
      const verifiedUser = await verifyRequest(submittedCode);
      dispatch(setUser(verifiedUser));
      return verifiedUser;
    },
    [dispatch],
  );

  const googleOAuth = useCallback(async () => {
    const { user, accessToken } = await googleOauth();
    dispatch(
      setCredentials({
        user: user,
        accessToken: accessToken,
      }),
    );
    return user;
  }, [dispatch]);

  const resendCode = useCallback(async () => {
    await resendCodeRequest();
  }, []);

  const logout = useCallback(
    async (options?: { silent?: boolean }) => {
      let serverLogoutSucceeded = !accessToken;

      try {
        if (accessToken) {
          await logoutRequest();
          serverLogoutSucceeded = true;
        }
      } catch (error) {
        if (!options?.silent) {
          toast.error(apiError(error, "auth.logoutFailed"));
        }
      } finally {
        dispatch(logoutAction());
        if (!options?.silent) {
          if (serverLogoutSucceeded) {
            toast.success(t("auth.loggedOut"));
          }
          router.push("/login");
        }
      }
    },
    [accessToken, dispatch, router, t, apiError],
  );

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading: status === "idle" || status === "loading",
    login,
    register,
    verify,
    googleOAuth,
    resendCode,
    logout,
  };
}
