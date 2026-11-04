"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { useCreateAdminUser } from "@/hooks/useAdmin";
import { useT } from "@/lib/i18n/context";
import type { CreateAdminUserInput } from "@/lib/admin";
import type { AdminUserFormValues } from "@/lib/validation";
import { AdminUserForm } from "@/components/users/admin-user-form";
import { RoleGate } from "@/components/layout/role-gate";

export default function NewUserPage() {
  const router = useRouter();
  const t = useT();
  const apiError = useApiError();
  const create = useCreateAdminUser();

  const onSubmit = (values: AdminUserFormValues) => {
    const payload: CreateAdminUserInput = {
      display_name: values.display_name.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role,
      is_email_verified: values.is_email_verified,
      receiveAlerts: values.receiveAlerts,
      ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
      ...(values.bloodType ? { bloodType: values.bloodType } : {}),
      ...(values.city.trim() ? { city: values.city.trim() } : {}),
      ...(values.role === "HOSPITAL"
        ? {
            hospitalName: values.hospitalName.trim() || values.display_name.trim(),
            ...(values.licenseNumber.trim() ? { licenseNumber: values.licenseNumber.trim() } : {}),
            ...(values.address.trim() ? { address: values.address.trim() } : {}),
          }
        : {}),
    };

    create.mutate(payload, {
      onSuccess: (user) => {
        toast.success(t("users.createdToast"));
        router.push(`/dashboard/users/${user.id}`);
      },
      onError: (error) => toast.error(apiError(error, "users.saveFailed")),
    });
  };

  return (
    <RoleGate roles={["ADMIN"]}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/dashboard/users" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
          {t("users.back")}
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t("users.createTitle")}</h1>
          <p className="text-sm text-zinc-500">{t("users.createSubtitle")}</p>
        </div>
        <AdminUserForm mode="create" submitting={create.isPending} onSubmit={onSubmit} />
      </div>
    </RoleGate>
  );
}
