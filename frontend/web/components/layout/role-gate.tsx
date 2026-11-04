"use client";

import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import type { UserRole } from "@/lib/types";

/** Renders its children only when the signed-in user has one of `roles`. */
export function RoleGate({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { user } = useAuth();
  const t = useT();

  if (user && roles.includes(user.role)) {
    return <>{children}</>;
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">{t("auth.unauthorized.title")}</h2>
        <p className="max-w-md text-sm text-zinc-500">{t("auth.noPermission")}</p>
      </CardContent>
    </Card>
  );
}
