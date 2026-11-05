"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useApiError } from "@/hooks/useApiError";
import { useApproveRequest, useRejectRequest, useRequestsList } from "@/hooks/useBloodRequests";
import { useI18n } from "@/lib/i18n/context";
import { BLOOD_TYPES, URGENCY_LEVELS } from "@/lib/validation";
import type { BloodRequest, RequestFilters, RequestStatus } from "@/lib/blood-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge, UrgencyBadge } from "@/components/requests/badges";
import { RejectDialog } from "@/components/requests/reject-dialog";
import { hasPermission } from "@/lib/permissions";

const STATUSES: RequestStatus[] = ["PENDING", "APPROVED", "REJECTED", "FULFILLED", "CANCELLED"];

export default function RequestsPage() {
  const { user } = useAuth();
  const { t, formatDateTime } = useI18n();
  const apiError = useApiError();
  const isAdmin = user?.role === "ADMIN";
  const canReview = hasPermission(user, "REVIEW_REQUESTS");
  const canCreateRequest = user?.role === "HOSPITAL" || (user?.role === "ADMIN" && user.canRequest === true);

  // Admins land on the approval queue; everyone else sees every visible request.
  const [filters, setFilters] = useState<RequestFilters>({
    status: user?.role === "ADMIN" ? "PENDING" : "",
    bloodType: "",
    urgency: "",
    city: "",
    page: 1,
  });
  const [scope, setScope] = useState<"all" | "mine">("all");
  const [rejecting, setRejecting] = useState<BloodRequest | null>(null);

  const list = useRequestsList(filters, scope);
  const approve = useApproveRequest();
  const reject = useRejectRequest();

  const update = (patch: Partial<RequestFilters>) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const page = list.data?.page ?? filters.page ?? 1;
  const totalPages = list.data?.totalPages ?? 1;

  const onApprove = (id: string) =>
    approve.mutate(id, {
      onSuccess: () => toast.success(t("requests.approvedToast")),
      onError: (e) => toast.error(apiError(e)),
    });

  const onReject = (reason: string) => {
    if (!rejecting) return;
    reject.mutate(
      { id: rejecting.id, reason },
      {
        onSuccess: () => {
          toast.success(t("requests.rejectedToast"));
          setRejecting(null);
        },
        onError: (e) => toast.error(apiError(e)),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t("requests.title")}</h1>
          <p className="text-sm text-zinc-500">{isAdmin ? t("requests.subtitleAdmin") : t("requests.subtitleHospital")}</p>
        </div>
        {canCreateRequest && (
          <Button asChild>
            <Link href="/dashboard/requests/new">
              <Plus className="h-4 w-4" />
              {t("requests.new")}
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
          {!isAdmin && (
            <div className="space-y-1.5">
              <Label htmlFor="f-scope">{t("requests.filters.scope")}</Label>
              <NativeSelect id="f-scope" value={scope} onChange={(e) => { setScope(e.target.value as "all" | "mine"); setFilters((f) => ({ ...f, page: 1 })); }}>
                <option value="all">{t("requests.filters.scopeAll")}</option>
                <option value="mine">{t("requests.filters.scopeMine")}</option>
              </NativeSelect>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="f-status">{t("requests.filters.status")}</Label>
            <NativeSelect id="f-status" value={filters.status} onChange={(e) => update({ status: e.target.value as RequestFilters["status"] })}>
              <option value="">{t("common.all")}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(`status.${s}`)}</option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-blood">{t("requests.filters.bloodType")}</Label>
            <NativeSelect id="f-blood" value={filters.bloodType} onChange={(e) => update({ bloodType: e.target.value as RequestFilters["bloodType"] })}>
              <option value="">{t("common.all")}</option>
              {BLOOD_TYPES.map((b) => (
                <option key={b} value={b}>{t(`bloodType.${b}`)}</option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-urgency">{t("requests.filters.urgency")}</Label>
            <NativeSelect id="f-urgency" value={filters.urgency} onChange={(e) => update({ urgency: e.target.value as RequestFilters["urgency"] })}>
              <option value="">{t("common.all")}</option>
              {URGENCY_LEVELS.map((u) => (
                <option key={u} value={u}>{t(`urgency.${u}`)}</option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-city">{t("requests.filters.city")}</Label>
            <Input id="f-city" value={filters.city} placeholder={t("requests.filters.cityPlaceholder")} onChange={(e) => update({ city: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        {list.isLoading ? (
          <CardContent className="flex justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          </CardContent>
        ) : list.isError ? (
          <CardContent className="p-10 text-center text-sm text-red-600">{t("requests.loadFailed")}</CardContent>
        ) : list.data && list.data.items.length === 0 ? (
          <CardContent className="flex flex-col items-center gap-3 p-10 text-sm text-zinc-500">
            {t("requests.empty")}
            <Button variant="outline" size="sm" onClick={() => setFilters({ status: "", bloodType: "", urgency: "", city: "", page: 1 })}>
              {t("common.clearFilters")}
            </Button>
          </CardContent>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("requests.columns.patient")}</TH>
                <TH>{t("requests.columns.bloodType")}</TH>
                <TH>{t("requests.columns.units")}</TH>
                <TH>{t("requests.columns.urgency")}</TH>
                <TH>{t("requests.columns.hospital")}</TH>
                <TH>{t("requests.columns.status")}</TH>
                <TH>{t("requests.columns.created")}</TH>
                <TH className="text-right">{t("common.actions")}</TH>
              </TR>
            </THead>
            <TBody>
              {list.data?.items.map((r) => (
                <TR key={r.id}>
                  <TD className="font-medium text-zinc-900">
                    <Link href={`/dashboard/requests/${r.id}`} className="hover:underline">{r.patientName}</Link>
                    {r.requester && <p className="text-xs font-normal text-zinc-500">{r.requester.display_name}</p>}
                  </TD>
                  <TD className="font-semibold">{t(`bloodType.${r.bloodType}`)}</TD>
                  <TD>{r.unitsFulfilled}/{r.unitsNeeded}</TD>
                  <TD><UrgencyBadge urgency={r.urgency} /></TD>
                  <TD>{r.hospitalName}<p className="text-xs text-zinc-500">{r.city}</p></TD>
                  <TD><StatusBadge status={r.status} /></TD>
                  <TD className="whitespace-nowrap text-xs text-zinc-500">{formatDateTime(r.createdAt)}</TD>
                  <TD>
                    <div className="flex justify-end gap-2">
                      {isAdmin && canReview && r.status === "PENDING" && (
                        <>
                          <Button size="sm" onClick={() => onApprove(r.id)} disabled={approve.isPending}>
                            {t("requests.approve")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRejecting(r)}>
                            {t("requests.reject")}
                          </Button>
                        </>
                      )}
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/dashboard/requests/${r.id}`}>{t("common.view")}</Link>
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}

        {list.data && list.data.total > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 text-sm text-zinc-500">
            <span>{t("common.totalResults", { count: list.data.total })}</span>
            <div className="flex items-center gap-3">
              <span>{t("common.pageOf", { page, total: totalPages })}</span>
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setFilters((f) => ({ ...f, page: page - 1 }))}>
                {t("common.previous")}
              </Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setFilters((f) => ({ ...f, page: page + 1 }))}>
                {t("common.next")}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <RejectDialog
        key={rejecting?.id ?? "none"}
        open={Boolean(rejecting)}
        loading={reject.isPending}
        onClose={() => setRejecting(null)}
        onConfirm={onReject}
      />
    </div>
  );
}
