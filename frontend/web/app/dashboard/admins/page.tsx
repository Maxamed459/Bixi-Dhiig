"use client";

import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccounts } from "@/hooks/useAdmin";
import { useT } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { RoleGate } from "@/components/layout/role-gate";

export default function AdminsPage() {
  const { user } = useAuth();
  const t = useT();
  const list = useAdminAccounts({ page: 1, limit: 100 }, Boolean(user?.isSuperAdmin));

  return (
    <RoleGate roles={["ADMIN"]}>
      {!user?.isSuperAdmin ? <p className="text-sm text-zinc-500">{t("auth.noPermission")}</p> : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div><h1 className="text-2xl font-semibold text-zinc-900">{t("admins.title")}</h1><p className="text-sm text-zinc-500">{t("admins.subtitle")}</p></div>
            <Button asChild><Link href="/dashboard/admins/new"><Plus className="h-4 w-4" />{t("admins.add")}</Link></Button>
          </div>
          <Card>{list.isLoading ? <CardContent className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-red-600" /></CardContent> : list.isError ? <CardContent className="p-10 text-center text-sm text-red-600">{t("admins.loadFailed")}</CardContent> : (
            <Table><THead><TR><TH>{t("users.columns.user")}</TH><TH>{t("users.columns.role")}</TH><TH>{t("admins.permissions")}</TH><TH>{t("users.columns.status")}</TH><TH className="text-right">{t("common.actions")}</TH></TR></THead><TBody>
              {list.data?.items.map((admin) => <TR key={admin.id}><TD><Link className="font-medium text-zinc-900 hover:underline" href={`/dashboard/users/${admin.id}`}>{admin.display_name}</Link><p className="text-xs text-zinc-500">{admin.email}</p></TD><TD><Badge variant="secondary">{admin.isSuperAdmin ? t("admins.superAdmin") : t("roles.ADMIN")}</Badge></TD><TD className="text-sm text-zinc-600">{admin.isSuperAdmin ? t("admins.allPermissions") : admin.permissions.map((permission) => t(`permissions.${permission}`)).join(", ") || t("admins.none")}</TD><TD><Badge variant={admin.active ? "success" : "warning"}>{admin.active ? t("accountStatus.ACTIVE") : t("accountStatus.INACTIVE")}</Badge></TD><TD className="text-right"><Button asChild size="sm" variant="outline"><Link href={`/dashboard/users/${admin.id}`}>{t("common.view")}</Link></Button></TD></TR>)}
            </TBody></Table>
          )}</Card>
        </div>
      )}
    </RoleGate>
  );
}
