"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useApiError } from "@/hooks/useApiError";
import { useChangePassword, useUpdateProfile } from "@/hooks/useProfile";
import { useI18n } from "@/lib/i18n/context";
import {
  BLOOD_TYPES,
  changePasswordFormSchema,
  profileFormSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormFieldWrapper } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { t, formatDateTime } = useI18n();
  const apiError = useApiError();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: user?.display_name ?? "",
      phone: user?.phone ?? "",
      city: user?.city ?? "",
      bloodType: user?.bloodType ?? "",
      receiveAlerts: user?.receiveAlerts ?? true,
    },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onProfileSubmit = (values: ProfileFormValues) =>
    updateProfile.mutate(
      {
        display_name: values.display_name.trim(),
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
        ...(values.city.trim() ? { city: values.city.trim() } : {}),
        ...(values.bloodType ? { bloodType: values.bloodType } : {}),
        receiveAlerts: values.receiveAlerts,
      },
      {
        onSuccess: () => toast.success(t("profile.updated")),
        onError: (error) => toast.error(apiError(error, "profile.updateFailed")),
      },
    );

  const onPasswordSubmit = (values: ChangePasswordFormValues) =>
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast.success(t("profile.passwordUpdated"));
          passwordForm.reset();
        },
        onError: (error) => toast.error(apiError(error, "profile.passwordFailed")),
      },
    );

  const fields = [
    { label: t("profile.role"), value: user?.role ? t(`roles.${user.role}`) : "—" },
    {
      label: t("profile.verified"),
      value: user?.is_email_verified || user?.isVerified ? t("profile.yes") : t("profile.no"),
    },
    {
      label: t("profile.bloodType"),
      value: user?.bloodType ? t(`bloodType.${user.bloodType}`) : "—",
    },
    { label: t("profile.lastLogin"), value: user?.last_login_at ? formatDateTime(user.last_login_at) : "—" },
    { label: t("profile.joined"), value: user?.createdAt ? formatDateTime(user.createdAt) : "—" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{t("profile.title")}</h1>
        <p className="text-sm text-zinc-500">{t("profile.subtitle")}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          {user?.avater ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avater}
              alt={t("profile.avatarAlt", { name: user?.display_name ?? "" })}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-lg font-semibold text-red-600">
              {initials(user?.display_name ?? "")}
            </div>
          )}
          <div className="min-w-0">
            <CardTitle className="truncate">{user?.display_name}</CardTitle>
            <CardDescription className="truncate">{user?.email}</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {user?.role ? t(`roles.${user.role}`) : ""}
          </Badge>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-zinc-100 border-t border-zinc-100">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3 text-sm">
                <dt className="text-zinc-500">{label}</dt>
                <dd className="font-medium text-zinc-900">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-red-600" />
            {t("profile.editTitle")}
          </CardTitle>
          <CardDescription>{t("profile.editDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldWrapper label={t("profile.displayName")} htmlFor="display_name" error={profileForm.formState.errors.display_name?.message}>
                <Input id="display_name" {...profileForm.register("display_name")} />
              </FormFieldWrapper>
              <FormFieldWrapper label={t("profile.email")} htmlFor="profile-email">
                <Input id="profile-email" value={user?.email ?? ""} disabled readOnly />
              </FormFieldWrapper>
              <FormFieldWrapper label={t("profile.phone")} htmlFor="phone" error={profileForm.formState.errors.phone?.message}>
                <Input id="phone" type="tel" placeholder="+252612345678" {...profileForm.register("phone")} />
              </FormFieldWrapper>
              <FormFieldWrapper label={t("profile.city")} htmlFor="city" error={profileForm.formState.errors.city?.message}>
                <Input id="city" {...profileForm.register("city")} />
              </FormFieldWrapper>
              <FormFieldWrapper label={t("profile.bloodType")} htmlFor="profile-blood" error={profileForm.formState.errors.bloodType?.message}>
                <NativeSelect id="profile-blood" {...profileForm.register("bloodType")}>
                  <option value="">{t("common.none")}</option>
                  {BLOOD_TYPES.map((bloodType) => (
                    <option key={bloodType} value={bloodType}>{t(`bloodType.${bloodType}`)}</option>
                  ))}
                </NativeSelect>
              </FormFieldWrapper>
            </div>

            <label className="flex items-start gap-3 text-sm text-zinc-700">
              <input type="checkbox" className="mt-0.5 rounded border-zinc-300" {...profileForm.register("receiveAlerts")} />
              <span>
                <span className="font-medium text-zinc-900">{t("profile.receiveAlerts")}</span>
                <span className="block text-xs text-zinc-500">{t("profile.receiveAlertsHint")}</span>
              </span>
            </label>

            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-red-600" />
            {t("profile.passwordTitle")}
          </CardTitle>
          <CardDescription>{t("profile.passwordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormFieldWrapper label={t("profile.currentPassword")} htmlFor="currentPassword" error={passwordForm.formState.errors.currentPassword?.message}>
                <Input id="currentPassword" type="password" autoComplete="current-password" {...passwordForm.register("currentPassword")} />
              </FormFieldWrapper>
              <FormFieldWrapper label={t("profile.newPassword")} htmlFor="newPassword" error={passwordForm.formState.errors.newPassword?.message}>
                <Input id="newPassword" type="password" autoComplete="new-password" {...passwordForm.register("newPassword")} />
              </FormFieldWrapper>
              <FormFieldWrapper label={t("profile.confirmPassword")} htmlFor="confirmPassword" error={passwordForm.formState.errors.confirmPassword?.message}>
                <Input id="confirmPassword" type="password" autoComplete="new-password" {...passwordForm.register("confirmPassword")} />
              </FormFieldWrapper>
            </div>
            <Button type="submit" variant="outline" disabled={changePassword.isPending}>
              {changePassword.isPending ? t("common.saving") : t("profile.changePassword")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
