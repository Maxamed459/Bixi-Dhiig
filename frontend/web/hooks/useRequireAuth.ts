"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { DASHBOARD_ROLES, isAllowedRole } from "@/lib/role-guard";
import type { UserRole } from "@/lib/types";

/**
 * Redirects to /login if there's no session, and to /unauthorized (while
 * logging the user out) if the session belongs to a role that isn't allowed
 * on the web dashboard.
 */
export function useRequireAuth(allowedRoles: UserRole[] = DASHBOARD_ROLES) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (!isAllowedRole(user.role, allowedRoles)) {
      toast.error("You don't have permission to access this page.");
      logout({ silent: true });
      router.replace("/unauthorized");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, user, router]);

  const isReady = !isLoading && isAuthenticated && !!user && isAllowedRole(user.role, allowedRoles);

  return { user, isLoading, isReady };
}
