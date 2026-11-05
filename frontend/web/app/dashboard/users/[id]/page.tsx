"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { useAdminUser, useDeleteAdminAccount, useDeleteAdminUser, useUpdateAdminAccount, useUpdateAdminUser } from "@/hooks/useAdmin";
import { useI18n } from "@/lib/i18n/context";
import type { AdminUserDetail, UpdateAdminUserInput } from "@/lib/admin";
import type { AdminUserFormValues } from "@/lib/validation";
import { AdminUserForm } from "@/components/users/admin-user-form";
import { RoleGate } from "@/components/layout/role-gate";
import { PermissionGate } from "@/components/layout/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { DonationStatusBadge, StatusBadge } from "@/components/requests/badges";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="shrink-0 text-zinc-500">{label}</dt>
      <dd className="text-right font-medium text-zinc-900">{value || "—"}</dd>
    </div>
  );
}

function AccountBadge({ user }: { user: AdminUserDetail }) {
  const { t } = useI18n();
  if (user.is_deleted) return <Badge variant="danger">{t("accountStatus.DELETED")}</Badge>;
  if (!user.active) return <Badge variant="warning">{t("accountStatus.INACTIVE")}</Badge>;
  return <Badge variant="success">{t("accountStatus.ACTIVE")}</Badge>;
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, formatDateTime } = useI18n();
  const apiError = useApiError();

  const userQuery = useAdminUser(id);
  const update = useUpdateAdminUser(id);
  const updateAccount = useUpdateAdminAccount(id);
  const remove = useDeleteAdminUser();
  const removeAccount = useDeleteAdminAccount();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (userQuery.isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin text-red-600" />;
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">{t("users.notFound")}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/users">{t("users.back")}</Link>
        </Button>
      </div>
    );
  }

  const user = userQuery.data;

  const defaultValues: Partial<AdminUserFormValues> = {
    display_name: user.display_name,
    email: user.email,
    password: "",
    phone: user.phone ?? "",
    role: user.role,
    bloodType: user.bloodType ?? "",
    city: user.city ?? "",
    is_email_verified: user.is_email_verified,
    receiveAlerts: user.receiveAlerts,
    active: user.active,
    hospitalName: user.hospital?.name ?? "",
    licenseNumber: user.hospital?.licenseNumber ?? "",
    address: user.hospital?.address ?? "",
    permissions: user.permissions,
    isSuperAdmin: user.isSuperAdmin,
    canDonate: user.canDonate,
    canRequest: user.canRequest,
  };

  const onSubmit = (values: AdminUserFormValues) => {
    const payload: UpdateAdminUserInput = {
      display_name: values.display_name.trim(),
      role: values.role,
      phone: values.phone.trim() || null,
      city: values.city.trim() || null,
      bloodType: values.bloodType || null,
      is_email_verified: values.is_email_verified,
      receiveAlerts: values.receiveAlerts,
      active: values.active,
      ...(user.role === "ADMIN" ? { permissions: values.permissions, isSuperAdmin: values.isSuperAdmin, canDonate: values.canDonate, canRequest: values.canRequest } : {}),
      ...(values.password ? { password: values.password } : {}),
      ...(values.role === "HOSPITAL"
        ? {
            hospitalName: values.hospitalName.trim() || values.display_name.trim(),
            licenseNumber: values.licenseNumber.trim() || null,
            address: values.address.trim() || null,
          }
        : {}),
    };

    (user.role === "ADMIN" ? updateAccount : update).mutate(payload, {
      onSuccess: () => toast.success(t("users.updatedToast")),
      onError: (error) => toast.error(apiError(error, "users.saveFailed")),
    });
  };

  const onDelete = () =>
    (user.role === "ADMIN" ? removeAccount : remove).mutate(user.id, {
      onSuccess: () => {
        toast.success(t("users.deletedToast"));
        router.push("/dashboard/users");
      },
      onError: (error) => toast.error(apiError(error, "users.deleteFailed")),
    });

  return (
    <RoleGate roles={["ADMIN"]}>
      <PermissionGate permission="MANAGE_USERS">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/dashboard/users" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
          {t("users.back")}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{user.display_name}</h1>
            <p className="text-sm text-zinc-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{t(`roles.${user.role}`)}</Badge>
              <AccountBadge user={user} />
              {user.is_email_verified ? (
                <Badge variant="success">{t("users.verified")}</Badge>
              ) : (
                <Badge variant="warning">{t("users.unverified")}</Badge>
              )}
            </div>
          </div>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)} disabled={remove.isPending || removeAccount.isPending}>
            <Trash2 className="h-4 w-4" />
            {t("users.delete")}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("users.detail.activity")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t("users.detail.requests")} value={user._count?.bloodRequests ?? 0} />
              <InfoRow label={t("users.detail.donations")} value={user._count?.donations ?? 0} />
              <InfoRow label={t("users.detail.lastLogin")} value={user.last_login_at ? formatDateTime(user.last_login_at) : null} />
              <InfoRow label={t("users.detail.joined")} value={formatDateTime(user.createdAt)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("users.detail.contact")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t("users.form.phone")} value={user.phone} />
              <InfoRow label={t("users.form.city")} value={user.city} />
              <InfoRow label={t("users.form.bloodType")} value={user.bloodType ? t(`bloodType.${user.bloodType}`) : null} />
              <InfoRow label={t("users.detail.alerts")} value={user.receiveAlerts ? t("common.enabled") : t("common.disabled")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("users.detail.signIn")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {user.oauthAccounts.length === 0 ? (
                <p className="py-2 text-sm text-zinc-500">{t("users.detail.noProviders")}</p>
              ) : (
                user.oauthAccounts.map((account) => (
                  <InfoRow
                    key={`${account.provider}-${account.providerUserId ?? "password"}`}
                    label={account.provider ?? "—"}
                    value={formatDateTime(account.createdAt)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {user.hospital && (
          <Card>
            <CardHeader>
              <CardTitle>{t("users.form.hospital")}</CardTitle>
              <CardDescription>{t("users.detail.hospitalDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow label={t("users.form.hospitalName")} value={user.hospital.name} />
              <InfoRow label={t("users.form.licenseNumber")} value={user.hospital.licenseNumber} />
              <InfoRow label={t("users.form.address")} value={user.hospital.address} />
              <InfoRow label={t("users.form.city")} value={user.hospital.city} />
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">{t("users.detail.editTitle")}</h2>
          <AdminUserForm key={user.id} mode="edit" adminMode={user.role === "ADMIN"} defaultValues={defaultValues} submitting={update.isPending || updateAccount.isPending} onSubmit={onSubmit} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("users.detail.recentRequests")}</CardTitle>
            <CardDescription>{t("users.detail.recentRequestsDescription")}</CardDescription>
          </CardHeader>
          {user.bloodRequests.length === 0 ? (
            <CardContent className="pt-0 text-sm text-zinc-500">{t("users.detail.noRequests")}</CardContent>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>{t("requests.columns.patient")}</TH>
                  <TH>{t("requests.columns.bloodType")}</TH>
                  <TH>{t("requests.columns.units")}</TH>
                  <TH>{t("requests.columns.status")}</TH>
                  <TH>{t("requests.columns.created")}</TH>
                </TR>
              </THead>
              <TBody>
                {user.bloodRequests.map((request) => (
                  <TR key={request.id}>
                    <TD>
                      <Link href={`/dashboard/requests/${request.id}`} className="font-medium text-zinc-900 hover:underline">
                        {request.patientName}
                      </Link>
                    </TD>
                    <TD>{t(`bloodType.${request.bloodType}`)}</TD>
                    <TD>{request.unitsFulfilled}/{request.unitsNeeded}</TD>
                    <TD><StatusBadge status={request.status} /></TD>
                    <TD className="whitespace-nowrap text-xs text-zinc-500">{formatDateTime(request.createdAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("users.detail.recentDonations")}</CardTitle>
            <CardDescription>{t("users.detail.recentDonationsDescription")}</CardDescription>
          </CardHeader>
          {user.donations.length === 0 ? (
            <CardContent className="pt-0 text-sm text-zinc-500">{t("users.detail.noDonations")}</CardContent>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>{t("requests.columns.patient")}</TH>
                  <TH>{t("requests.columns.bloodType")}</TH>
                  <TH>{t("detail.unitsOffered")}</TH>
                  <TH>{t("requests.columns.status")}</TH>
                  <TH>{t("detail.respondedAt")}</TH>
                </TR>
              </THead>
              <TBody>
                {user.donations.map((donation) => (
                  <TR key={donation.id}>
                    <TD>
                      <Link href={`/dashboard/requests/${donation.bloodRequest.id}`} className="font-medium text-zinc-900 hover:underline">
                        {donation.bloodRequest.patientName}
                      </Link>
                    </TD>
                    <TD>{t(`bloodType.${donation.bloodRequest.bloodType}`)}</TD>
                    <TD>{donation.unitsOffered}</TD>
                    <TD><DonationStatusBadge status={donation.status} /></TD>
                    <TD className="whitespace-nowrap text-xs text-zinc-500">{formatDateTime(donation.createdAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>

        <Dialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          title={t("users.deleteTitle")}
          description={t("users.deleteDescription", { name: user.display_name })}
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={remove.isPending || removeAccount.isPending}>
                {t("common.cancel")}
              </Button>
              <Button variant="destructive" onClick={onDelete} disabled={remove.isPending || removeAccount.isPending}>
                {t("users.confirmDelete")}
              </Button>
            </>
          }
        />
      </div>
      </PermissionGate>
    </RoleGate>
  );
}
