"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useApiError } from "@/hooks/useApiError";
import {
  useApproveRequest,
  useBloodRequest,
  useCancelRequest,
  useFulfillRequest,
  useRejectRequest,
  useRequestDonations,
  useUpdateDonation,
} from "@/hooks/useBloodRequests";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { DonationStatusBadge, StatusBadge, UrgencyBadge } from "@/components/requests/badges";
import { LifecycleTimeline } from "@/components/requests/lifecycle-timeline";
import { RejectDialog } from "@/components/requests/reject-dialog";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-zinc-900">{children || "—"}</dd>
    </div>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, formatDateTime } = useI18n();
  const apiError = useApiError();

  const request = useBloodRequest(id);
  const isAdmin = user?.role === "ADMIN";
  const isOwner = Boolean(user && request.data && request.data.requesterId === user.id);
  // The API only lets the requester or an admin read donor responses (403 otherwise).
  const canManage = isAdmin || isOwner;

  const donations = useRequestDonations(id, canManage);
  const approve = useApproveRequest();
  const reject = useRejectRequest();
  const cancel = useCancelRequest();
  const fulfill = useFulfillRequest();
  const updateDonation = useUpdateDonation();
  const [rejecting, setRejecting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);

  if (request.isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin text-red-600" />;
  }

  const r = request.data;
  if (request.isError || !r) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">{t("detail.notFound")}</p>
        <Button asChild variant="outline"><Link href="/dashboard/requests">{t("detail.back")}</Link></Button>
      </div>
    );
  }

  const percent = Math.min(100, Math.round((r.unitsFulfilled / r.unitsNeeded) * 100));
  const canCancel = canManage && (r.status === "PENDING" || r.status === "APPROVED");

  const onDonation = (donationId: string, status: "ACCEPTED" | "DECLINED" | "COMPLETED") =>
    updateDonation.mutate(
      { id: donationId, status },
      {
        onSuccess: () => toast.success(t("detail.donationUpdated")),
        onError: (e) => toast.error(apiError(e, "detail.donationFailed")),
      },
    );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/dashboard/requests" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        {t("detail.back")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {r.patientName} · {t(`bloodType.${r.bloodType}`)}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={r.status} />
            <UrgencyBadge urgency={r.urgency} />
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && r.status === "PENDING" && (
            <>
              <Button
                disabled={approve.isPending}
                onClick={() =>
                  approve.mutate(r.id, {
                    onSuccess: () => toast.success(t("requests.approvedToast")),
                    onError: (e) => toast.error(apiError(e)),
                  })
                }
              >
                {t("requests.approve")}
              </Button>
              <Button variant="outline" onClick={() => setRejecting(true)}>{t("requests.reject")}</Button>
            </>
          )}
          {canCancel && (
            <Button variant="outline" onClick={() => setCancelling(true)}>{t("requests.cancel")}</Button>
          )}
          {isAdmin && r.status === "APPROVED" && (
            <Button variant="outline" onClick={() => setFulfilling(true)}>{t("requests.fulfill")}</Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-zinc-500">{t("detail.progress")}</span>
              <span className="font-medium text-zinc-900">
                {t("detail.progressValue", { done: r.unitsFulfilled, total: r.unitsNeeded })}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-red-600 transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("detail.requester")}>{r.requester?.display_name}</Field>
            <Field label={t("detail.contact")}>{r.contactPhone}</Field>
            <Field label={t("requests.columns.hospital")}>{`${r.hospitalName}, ${r.city}`}</Field>
            <Field label={t("detail.address")}>{r.address}</Field>
            <Field label={t("detail.created")}>{formatDateTime(r.createdAt)}</Field>
            <Field label={t("detail.approvedAt")}>{r.approvedAt ? formatDateTime(r.approvedAt) : null}</Field>
            {r.rejectionReason && <Field label={t("detail.rejectionReason")}>{r.rejectionReason}</Field>}
            <div className="sm:col-span-2"><Field label={t("detail.notes")}>{r.notes}</Field></div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("detail.lifecycle")}</CardTitle>
          <CardDescription>{t("detail.lifecycleDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LifecycleTimeline request={r} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("detail.donors")}</CardTitle>
          <CardDescription>{canManage ? t("detail.donorsDescription") : t("detail.donorsHidden")}</CardDescription>
        </CardHeader>
        {canManage && (
          <CardContent className="p-0">
            {donations.isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-red-600" /></div>
            ) : donations.data && donations.data.length > 0 ? (
              <Table>
                <THead>
                  <TR>
                    <TH>{t("detail.donor")}</TH>
                    <TH>{t("detail.phone")}</TH>
                    <TH>{t("detail.unitsOffered")}</TH>
                    <TH>{t("requests.columns.status")}</TH>
                    <TH>{t("detail.respondedAt")}</TH>
                    <TH className="text-right">{t("common.actions")}</TH>
                  </TR>
                </THead>
                <TBody>
                  {donations.data.map((d) => (
                    <TR key={d.id}>
                      <TD className="font-medium text-zinc-900">{d.donor.display_name}</TD>
                      <TD>{d.donor.phone ?? "—"}</TD>
                      <TD>{d.unitsOffered}</TD>
                      <TD><DonationStatusBadge status={d.status} /></TD>
                      <TD className="whitespace-nowrap text-xs text-zinc-500">{formatDateTime(d.createdAt)}</TD>
                      <TD>
                        <div className="flex justify-end gap-2">
                          {d.status === "PENDING" && (
                            <>
                              <Button size="sm" disabled={updateDonation.isPending} onClick={() => onDonation(d.id, "ACCEPTED")}>
                                {t("detail.accept")}
                              </Button>
                              <Button size="sm" variant="outline" disabled={updateDonation.isPending} onClick={() => onDonation(d.id, "DECLINED")}>
                                {t("detail.decline")}
                              </Button>
                            </>
                          )}
                          {d.status === "ACCEPTED" && (
                            <Button size="sm" disabled={updateDonation.isPending} onClick={() => onDonation(d.id, "COMPLETED")}>
                              {t("detail.complete")}
                            </Button>
                          )}
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            ) : (
              <p className="p-6 pt-0 text-sm text-zinc-500">{t("detail.noDonors")}</p>
            )}
          </CardContent>
        )}
      </Card>

      <RejectDialog
        open={rejecting}
        loading={reject.isPending}
        onClose={() => setRejecting(false)}
        onConfirm={(reason) =>
          reject.mutate(
            { id: r.id, reason },
            {
              onSuccess: () => {
                toast.success(t("requests.rejectedToast"));
                setRejecting(false);
              },
              onError: (e) => toast.error(apiError(e)),
            },
          )
        }
      />

      <Dialog
        open={cancelling}
        onClose={() => setCancelling(false)}
        title={t("requests.cancelTitle")}
        description={t("requests.cancelDescription")}
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelling(false)}>{t("requests.keep")}</Button>
            <Button
              variant="destructive"
              disabled={cancel.isPending}
              onClick={() =>
                cancel.mutate(r.id, {
                  onSuccess: () => {
                    toast.success(t("requests.cancelledToast"));
                    setCancelling(false);
                  },
                  onError: (e) => toast.error(apiError(e)),
                })
              }
            >
              {t("requests.confirmCancel")}
            </Button>
          </>
        }
      />

      <Dialog
        open={fulfilling}
        onClose={() => setFulfilling(false)}
        title={t("requests.fulfillTitle")}
        description={t("requests.fulfillDescription")}
        footer={
          <>
            <Button variant="outline" onClick={() => setFulfilling(false)}>{t("common.cancel")}</Button>
            <Button
              disabled={fulfill.isPending}
              onClick={() =>
                fulfill.mutate(r.id, {
                  onSuccess: () => {
                    toast.success(t("requests.fulfilledToast"));
                    setFulfilling(false);
                  },
                  onError: (e) => toast.error(apiError(e, "requests.fulfillFailed")),
                })
              }
            >
              {t("requests.confirmFulfill")}
            </Button>
          </>
        }
      />
    </div>
  );
}
