"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminUsers } from "@/hooks/useAdmin";
import { useI18n } from "@/lib/i18n/context";
import { BLOOD_TYPES, USER_ROLES } from "@/lib/validation";
import type { AdminUser, AdminUserFilters } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { RoleGate } from "@/components/layout/role-gate";

function AccountBadge({ user }: { user: AdminUser }) {
  const { t } = useI18n();
  if (user.is_deleted) return <Badge variant="danger">{t("accountStatus.DELETED")}</Badge>;
  if (!user.active) return <Badge variant="warning">{t("accountStatus.INACTIVE")}</Badge>;
  return <Badge variant="success">{t("accountStatus.ACTIVE")}</Badge>;
}

const EMPTY_FILTERS: AdminUserFilters = {
  search: "",
  role: "",
  status: "",
  bloodType: "",
  city: "",
  page: 1,
};

export default function UsersPage() {
  const { user } = useAuth();
  const { t, formatDateTime } = useI18n();
  const isAdmin = user?.role === "ADMIN";
  const [filters, setFilters] = useState<AdminUserFilters>(EMPTY_FILTERS);

  const list = useAdminUsers({ ...filters, limit: 10 }, isAdmin);

  const update = (patch: Partial<AdminUserFilters>) =>
    setFilters((current) => ({ ...current, ...patch, page: 1 }));

  const page = list.data?.page ?? filters.page ?? 1;
  const totalPages = list.data?.totalPages ?? 1;

  return (
    <RoleGate roles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{t("users.title")}</h1>
            <p className="text-sm text-zinc-500">{t("users.subtitle")}</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/users/new">
              <Plus className="h-4 w-4" />
              {t("users.add")}
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="user-search">{t("users.filters.search")}</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="user-search"
                  className="pl-9"
                  value={filters.search}
                  placeholder={t("users.filters.searchPlaceholder")}
                  onChange={(event) => update({ search: event.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-role">{t("users.filters.role")}</Label>
              <NativeSelect
                id="user-role"
                value={filters.role}
                onChange={(event) => update({ role: event.target.value as AdminUserFilters["role"] })}
              >
                <option value="">{t("common.all")}</option>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>{t(`roles.${role}`)}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-status">{t("users.filters.status")}</Label>
              <NativeSelect
                id="user-status"
                value={filters.status}
                onChange={(event) => update({ status: event.target.value as AdminUserFilters["status"] })}
              >
                <option value="">{t("common.all")}</option>
                <option value="ACTIVE">{t("accountStatus.ACTIVE")}</option>
                <option value="INACTIVE">{t("accountStatus.INACTIVE")}</option>
                <option value="DELETED">{t("accountStatus.DELETED")}</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-blood">{t("users.filters.bloodType")}</Label>
              <NativeSelect
                id="user-blood"
                value={filters.bloodType}
                onChange={(event) => update({ bloodType: event.target.value as AdminUserFilters["bloodType"] })}
              >
                <option value="">{t("common.all")}</option>
                {BLOOD_TYPES.map((bloodType) => (
                  <option key={bloodType} value={bloodType}>{t(`bloodType.${bloodType}`)}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-city">{t("users.filters.city")}</Label>
              <Input
                id="user-city"
                value={filters.city}
                placeholder={t("users.filters.cityPlaceholder")}
                onChange={(event) => update({ city: event.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={() => setFilters(EMPTY_FILTERS)}>
                {t("common.clearFilters")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          {list.isLoading ? (
            <CardContent className="flex justify-center p-10">
              <Loader2 className="h-6 w-6 animate-spin text-red-600" />
            </CardContent>
          ) : list.isError ? (
            <CardContent className="p-10 text-center text-sm text-red-600">{t("users.loadFailed")}</CardContent>
          ) : list.data && list.data.items.length === 0 ? (
            <CardContent className="flex flex-col items-center gap-3 p-10 text-sm text-zinc-500">
              {t("users.empty")}
              <Button variant="outline" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
                {t("common.clearFilters")}
              </Button>
            </CardContent>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>{t("users.columns.user")}</TH>
                  <TH>{t("users.columns.role")}</TH>
                  <TH>{t("users.columns.bloodType")}</TH>
                  <TH>{t("users.columns.city")}</TH>
                  <TH>{t("users.columns.status")}</TH>
                  <TH>{t("users.columns.activity")}</TH>
                  <TH>{t("users.columns.created")}</TH>
                  <TH className="text-right">{t("common.actions")}</TH>
                </TR>
              </THead>
              <TBody>
                {list.data?.items.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <Link href={`/dashboard/users/${row.id}`} className="font-medium text-zinc-900 hover:underline">
                        {row.display_name}
                      </Link>
                      <p className="text-xs text-zinc-500">{row.email}</p>
                      {row.phone && <p className="text-xs text-zinc-400">{row.phone}</p>}
                    </TD>
                    <TD><Badge variant="secondary">{t(`roles.${row.role}`)}</Badge></TD>
                    <TD>{row.bloodType ? t(`bloodType.${row.bloodType}`) : "—"}</TD>
                    <TD>{row.city ?? "—"}</TD>
                    <TD><AccountBadge user={row} /></TD>
                    <TD>
                      <span className="text-xs text-zinc-500">
                        {t("users.activitySummary", {
                          requests: row._count?.bloodRequests ?? 0,
                          donations: row._count?.donations ?? 0,
                        })}
                      </span>
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-zinc-500">{formatDateTime(row.createdAt)}</TD>
                    <TD>
                      <div className="flex justify-end">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/users/${row.id}`}>{t("common.view")}</Link>
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}

          {list.data && list.data.total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 text-sm text-zinc-500">
              <span>{t("common.totalResults", { count: list.data.total })}</span>
              <div className="flex items-center gap-3">
                <span>{t("common.pageOf", { page, total: totalPages })}</span>
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setFilters((current) => ({ ...current, page: page - 1 }))}>
                  {t("common.previous")}
                </Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setFilters((current) => ({ ...current, page: page + 1 }))}>
                  {t("common.next")}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </RoleGate>
  );
}
