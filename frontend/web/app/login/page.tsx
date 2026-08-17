"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isAllowedRole } from "@/lib/role-guard";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // If a valid, allowed session already exists (e.g. restored on reload, or
  // just came back from Google OAuth), skip the login form entirely.
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && isAllowedRole(user.role)) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
