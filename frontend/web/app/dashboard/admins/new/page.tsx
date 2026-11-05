"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useApiError } from "@/hooks/useApiError";
import { useCreateAdminAccount } from "@/hooks/useAdmin";
import { useT } from "@/lib/i18n/context";
import type { CreateAdminUserInput } from "@/lib/admin";
import type { AdminUserFormValues } from "@/lib/validation";
import { AdminUserForm } from "@/components/users/admin-user-form";
import { RoleGate } from "@/components/layout/role-gate";

export default function NewAdminPage() {
  const { user } = useAuth(); const t = useT(); const router = useRouter(); const apiError = useApiError(); const create = useCreateAdminAccount();
  const onSubmit = (values: AdminUserFormValues) => {
    const payload: CreateAdminUserInput = { display_name: values.display_name.trim(), email: values.email.trim(), password: values.password, role: "ADMIN", permissions: values.permissions, isSuperAdmin: values.isSuperAdmin, canDonate: values.canDonate, canRequest: values.canRequest, is_email_verified: values.is_email_verified, receiveAlerts: values.receiveAlerts, ...(values.phone.trim() ? { phone: values.phone.trim() } : {}) };
    create.mutate(payload, { onSuccess: (admin) => { toast.success(t("admins.createdToast")); router.push(`/dashboard/users/${admin.id}`); }, onError: (error) => toast.error(apiError(error, "users.saveFailed")) });
  };
  return <RoleGate roles={["ADMIN"]}><>{!user?.isSuperAdmin ? <p className="text-sm text-zinc-500">{t("auth.noPermission")}</p> : <div className="mx-auto max-w-3xl space-y-6"><Link href="/dashboard/admins" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"><ArrowLeft className="h-4 w-4" />{t("admins.back")}</Link><div><h1 className="text-2xl font-semibold text-zinc-900">{t("admins.createTitle")}</h1><p className="text-sm text-zinc-500">{t("admins.createSubtitle")}</p></div><AdminUserForm mode="create" adminMode submitting={create.isPending} onSubmit={onSubmit} /></div>}</></RoleGate>;
}
