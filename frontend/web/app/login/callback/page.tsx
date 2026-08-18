"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { refreshAccessToken } from "@/lib/api";
import { isAllowedRole } from "@/lib/role-guard";
import { useAppDispatch } from "@/store/hooks";
import { store } from "@/store/store";
import {
  logout as logoutAction,
  setStatus,
} from "@/store/features/authSlice";

export default function LoginCallbackPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;

    async function completeGoogleLogin() {
      dispatch(setStatus("loading"));

      const accessToken = await refreshAccessToken();
      if (!isMounted) return;

      const { user } = store.getState().auth;

      if (!accessToken || !user) {
        dispatch(logoutAction());
        toast.error("Google sign-in could not restore your session.");
        router.replace("/login?error=google_auth_failed");
        return;
      }

      if (!isAllowedRole(user.role)) {
        dispatch(logoutAction());
        toast.error(
          "This account does not have access to the web dashboard. Please use the mobile app.",
        );
        router.replace("/unauthorized");
        return;
      }

      toast.success(`Welcome, ${user.display_name}`);
      router.replace("/dashboard");
    }

    void completeGoogleLogin();

    return () => {
      isMounted = false;
    };
  }, [dispatch, router]);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">
            Completing Google sign-in
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Please wait while we open your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
