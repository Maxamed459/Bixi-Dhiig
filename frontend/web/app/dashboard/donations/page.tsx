"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminDonations, adminKeys } from "@/hooks/useAdmin";
import { useUpdateDonation } from "@/hooks/useBloodRequests";
import { useApiError } from "@/hooks/useApiError";
import { useI18n } from "@/lib/i18n/context";
import { BLOOD_TYPES } from "@/lib/validation";
import type { AdminDonationFilters } from "@/lib/admin";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { DonationStatusBadge, StatusBadge } from "@/components/requests/badges";

const STATUSES = ["PENDING", "ACCEPTED", "COMPLETED", "DECLINED", "CANCELLED"] as const;

const EMPTY_FILTERS: AdminDonationFilters = {
  status: "",
  bloodType: "",
  city: "",
  search: "",
  page: 1,
};

export default function AdminDonationsPage() {
  const { t, formatDateTime } = useI18n();
  const apiError = useApiError();
  const client = useQueryClient();
  const [filters, setFilters] = useState<AdminDonationFilters>(EMPTY_FILTERS);
  const list = useAdminDonations({ ...filters, limit: 10 });
  const updateDonation = useUpdateDonation();

  const update = (patch: Partial<AdminDonationFilters>) =>
    setFilters((current) => ({ ...current, ...patch, page: 1 }));

  const page = list.data?.page ?? filters.page ?? 1;
  const totalPages = list.data?.totalPages ?? 1;

  const onDonation = (id: string, status: "ACCEPTED" | "DECLINED" | "COMPLETED") =>
    updateDonation.mutate(
      { id, status },
      {
        onSuccess: () => {
          void client.invalidateQueries({ queryKey: adminKeys.all });
          toast.success(t("detail.donationUpdated"));
        },
        onError: (error) => toast.error(apiError(error, "detail.donationFailed")),
      },
    );

  return (
    <RoleGate roles={["ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t("donations.title")}</h1>
          <p className="text-sm text-zinc-500">{t("donations.subtitle")}</p>
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="donation-search">{t("donations.filters.search")}</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="donation-search"
                  className="pl-9"
                  value={filters.search}
                  placeholder={t("donations.filters.searchPlaceholder")}
                  onChange={(event) => update({ search: event.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="donation-status">{t("donations.filters.status")}</Label>
              <NativeSelect
                id="donation-status"
                value={filters.status}
                onChange={(event) => update({ status: event.target.value as AdminDonationFilters["status"] })}
              >
                <option value="">{t("common.all")}</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{t(`donationStatus.${status}`)}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="donation-blood">{t("donations.filters.bloodType")}</Label>
              <NativeSelect
                id="donation-blood"
                value={filters.bloodType}
                onChange={(event) => update({ bloodType: event.target.value as AdminDonationFilters["bloodType"] })}
              >
                <option value="">{t("common.all")}</option>
                {BLOOD_TYPES.map((bloodType) => (
                  <option key={bloodType} value={bloodType}>{t(`bloodType.${bloodType}`)}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="donation-city">{t("donations.filters.city")}</Label>
              <Input
                id="donation-city"
                value={filters.city}
                placeholder={t("donations.filters.cityPlaceholder")}
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
            <CardContent className="p-10 text-center text-sm text-red-600">{t("donations.loadFailed")}</CardContent>
          ) : list.data && list.data.items.length === 0 ? (
            <CardContent className="p-10 text-center text-sm text-zinc-500">{t("donations.empty")}</CardContent>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>{t("donations.columns.donor")}</TH>
                  <TH>{t("donations.columns.request")}</TH>
                  <TH>{t("donations.columns.bloodType")}</TH>
                  <TH>{t("donations.columns.units")}</TH>
                  <TH>{t("donations.columns.status")}</TH>
                  <TH>{t("donations.columns.confirmedBy")}</TH>
                  <TH>{t("donations.columns.created")}</TH>
                  <TH className="text-right">{t("common.actions")}</TH>
                </TR>
              </THead>
              <TBody>
                {list.data?.items.map((donation) => (
                  <TR key={donation.id}>
                    <TD>
                      <Link href={`/dashboard/users/${donation.donor.id}`} className="font-medium text-zinc-900 hover:underline">
                        {donation.donor.display_name}
                      </Link>
                      <p className="text-xs text-zinc-500">{donation.donor.phone ?? donation.donor.email}</p>
                    </TD>
                    <TD>
                      <Link href={`/dashboard/requests/${donation.bloodRequest.id}`} className="font-medium text-zinc-900 hover:underline">
                        {donation.bloodRequest.patientName}
                      </Link>
                      <p className="text-xs text-zinc-500">{donation.bloodRequest.hospitalName}, {donation.bloodRequest.city}</p>
                    </TD>
                    <TD className="font-semibold">{t(`bloodType.${donation.bloodRequest.bloodType}`)}</TD>
                    <TD>{donation.unitsOffered}</TD>
                    <TD><DonationStatusBadge status={donation.status} /></TD>
                    <TD className="text-xs text-zinc-500">{donation.confirmedBy?.display_name ?? "—"}</TD>
                    <TD className="whitespace-nowrap text-xs text-zinc-500">{formatDateTime(donation.createdAt)}</TD>
                    <TD>
                      <div className="flex justify-end gap-2">
                        {donation.status === "PENDING" && (
                          <>
                            <Button size="sm" disabled={updateDonation.isPending} onClick={() => onDonation(donation.id, "ACCEPTED")}>
                              {t("detail.accept")}
                            </Button>
                            <Button size="sm" variant="outline" disabled={updateDonation.isPending} onClick={() => onDonation(donation.id, "DECLINED")}>
                              {t("detail.decline")}
                            </Button>
                          </>
                        )}
                        {donation.status === "ACCEPTED" && (
                          <Button size="sm" disabled={updateDonation.isPending} onClick={() => onDonation(donation.id, "COMPLETED")}>
                            {t("detail.complete")}
                          </Button>
                        )}
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/dashboard/requests/${donation.bloodRequest.id}`}>
                            <StatusBadge status={donation.bloodRequest.status} />
                          </Link>
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
