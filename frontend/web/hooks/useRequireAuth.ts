"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as logoutAction } from "@/store/features/authSlice";
import { DASHBOARD_ROLES, isAllowedRole } from "@/lib/role-guard";
import type { UserRole } from "@/lib/types";

/**
 * Redirects to /login if there's no session, and to /unauthorized (while
 * logging the user out) if the session belongs to a role that isn't allowed
 * on the web dashboard. Reads auth state straight from the Redux store.
 */
export function useRequireAuth(allowedRoles: UserRole[] = DASHBOARD_ROLES) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useT();
  const { user, isAuthenticated, status } = useAppSelector((state) => state.auth);
  const isLoading = status === "idle" || status === "loading";

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (!isAllowedRole(user.role, allowedRoles)) {
      toast.error(t("auth.noPermission"));
      dispatch(logoutAction());
      router.replace("/unauthorized");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, user, router, dispatch]);

  const isReady = !isLoading && isAuthenticated && !!user && isAllowedRole(user.role, allowedRoles);

  return { user, isLoading, isReady };
}
