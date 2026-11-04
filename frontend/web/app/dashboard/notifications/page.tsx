"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useNotificationLogs } from "@/hooks/useAdmin";
import { useI18n } from "@/lib/i18n/context";
import type { NotificationLogFilters } from "@/lib/admin";
import { RoleGate } from "@/components/layout/role-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

const EMPTY_FILTERS: NotificationLogFilters = {
  channel: "",
  status: "",
  event: "",
  search: "",
  page: 1,
};

export default function NotificationsPage() {
  const { t, formatDateTime } = useI18n();
  const [filters, setFilters] = useState<NotificationLogFilters>(EMPTY_FILTERS);
  const list = useNotificationLogs({ ...filters, limit: 20 });

  const update = (patch: Partial<NotificationLogFilters>) =>
    setFilters((current) => ({ ...current, ...patch, page: 1 }));

  const page = list.data?.page ?? filters.page ?? 1;
  const totalPages = list.data?.totalPages ?? 1;

  return (
    <RoleGate roles={["ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t("notifications.title")}</h1>
          <p className="text-sm text-zinc-500">{t("notifications.subtitle")}</p>
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notification-search">{t("notifications.filters.search")}</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="notification-search"
                  className="pl-9"
                  value={filters.search}
                  placeholder={t("notifications.filters.searchPlaceholder")}
                  onChange={(event) => update({ search: event.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notification-channel">{t("notifications.filters.channel")}</Label>
              <NativeSelect
                id="notification-channel"
                value={filters.channel}
                onChange={(event) => update({ channel: event.target.value as NotificationLogFilters["channel"] })}
              >
                <option value="">{t("common.all")}</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="EMAIL">Email</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notification-status">{t("notifications.filters.status")}</Label>
              <NativeSelect
                id="notification-status"
                value={filters.status}
                onChange={(event) => update({ status: event.target.value as NotificationLogFilters["status"] })}
              >
                <option value="">{t("common.all")}</option>
                <option value="SENT">{t("notifications.status.SENT")}</option>
                <option value="FAILED">{t("notifications.status.FAILED")}</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notification-event">{t("notifications.filters.event")}</Label>
              <Input
                id="notification-event"
                value={filters.event}
                placeholder={t("notifications.filters.eventPlaceholder")}
                onChange={(event) => update({ event: event.target.value })}
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
            <CardContent className="p-10 text-center text-sm text-red-600">{t("notifications.loadFailed")}</CardContent>
          ) : list.data && list.data.items.length === 0 ? (
            <CardContent className="p-10 text-center text-sm text-zinc-500">{t("notifications.empty")}</CardContent>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>{t("notifications.columns.created")}</TH>
                  <TH>{t("notifications.columns.event")}</TH>
                  <TH>{t("notifications.columns.channel")}</TH>
                  <TH>{t("notifications.columns.target")}</TH>
                  <TH>{t("notifications.columns.status")}</TH>
                  <TH>{t("notifications.columns.error")}</TH>
                </TR>
              </THead>
              <TBody>
                {list.data?.items.map((log) => (
                  <TR key={log.id}>
                    <TD className="whitespace-nowrap text-xs text-zinc-500">{formatDateTime(log.createdAt)}</TD>
                    <TD className="font-medium text-zinc-900">{log.event.replaceAll("_", " ")}</TD>
                    <TD><Badge variant="outline">{log.channel}</Badge></TD>
                    <TD className="max-w-[220px] truncate text-xs text-zinc-600">{log.target}</TD>
                    <TD>
                      {log.status === "SENT" ? (
                        <Badge variant="success">{t("notifications.status.SENT")}</Badge>
                      ) : (
                        <Badge variant="danger">{t("notifications.status.FAILED")}</Badge>
                      )}
                    </TD>
                    <TD className="max-w-[260px] truncate text-xs text-zinc-500" title={log.error ?? undefined}>
                      {log.error ?? "—"}
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
