"use client";

import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n/context";
import { hasPermission } from "@/lib/permissions";
import type { AdminPermission } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export function PermissionGate({ permission, children }: { permission: AdminPermission; children: React.ReactNode }) {
  const { user } = useAuth();
  const t = useT();

  if (hasPermission(user, permission)) return <>{children}</>;

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600"><ShieldAlert className="h-6 w-6" /></div>
        <h2 className="text-lg font-semibold text-zinc-900">{t("auth.unauthorized.title")}</h2>
        <p className="max-w-md text-sm text-zinc-500">{t("auth.noPermission")}</p>
      </CardContent>
    </Card>
  );
}
