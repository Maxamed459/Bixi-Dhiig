"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { FormFieldWrapper } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useT } from "@/lib/i18n/context";
import { BLOOD_TYPES, USER_ROLES, adminUserFormSchema, type AdminUserFormValues } from "@/lib/validation";

export const EMPTY_ADMIN_USER_FORM: AdminUserFormValues = {
  display_name: "",
  email: "",
  password: "",
  phone: "",
  role: "USER",
  bloodType: "",
  city: "",
  is_email_verified: true,
  receiveAlerts: true,
  active: true,
  hospitalName: "",
  licenseNumber: "",
  address: "",
};

interface AdminUserFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<AdminUserFormValues>;
  submitting?: boolean;
  onSubmit: (values: AdminUserFormValues) => void;
}

export function AdminUserForm({ mode, defaultValues, submitting, onSubmit }: AdminUserFormProps) {
  const t = useT();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserFormSchema),
    defaultValues: { ...EMPTY_ADMIN_USER_FORM, ...defaultValues },
  });

  const role = useWatch({ control, name: "role" });

  const submit = (values: AdminUserFormValues) => {
    if (mode === "create" && !values.password) {
      setError("password", { message: "validation.passwordRequired" });
      return;
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("users.form.account")}</CardTitle>
          <CardDescription>{t("users.form.accountDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormFieldWrapper label={t("users.form.displayName")} htmlFor="display_name" error={errors.display_name?.message}>
            <Input id="display_name" placeholder={t("users.form.displayNamePlaceholder")} {...register("display_name")} />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("users.form.email")} htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" placeholder={t("users.form.emailPlaceholder")} readOnly={mode === "edit"} {...register("email")} />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("users.form.phone")} htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" type="tel" placeholder={t("users.form.phonePlaceholder")} {...register("phone")} />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("users.form.city")} htmlFor="city" error={errors.city?.message}>
            <Input id="city" placeholder={t("users.form.cityPlaceholder")} {...register("city")} />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("users.form.role")} htmlFor="role" error={errors.role?.message}>
            <NativeSelect id="role" {...register("role")}>
              {USER_ROLES.map((roleOption) => (
                <option key={roleOption} value={roleOption}>{t(`roles.${roleOption}`)}</option>
              ))}
            </NativeSelect>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("users.form.bloodType")} htmlFor="bloodType" error={errors.bloodType?.message}>
            <NativeSelect id="bloodType" {...register("bloodType")}>
              <option value="">{t("common.none")}</option>
              {BLOOD_TYPES.map((bloodType) => (
                <option key={bloodType} value={bloodType}>{t(`bloodType.${bloodType}`)}</option>
              ))}
            </NativeSelect>
          </FormFieldWrapper>

          <FormFieldWrapper
            className="sm:col-span-2"
            label={mode === "create" ? t("users.form.password") : t("users.form.newPassword")}
            htmlFor="password"
            error={errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder={mode === "create" ? t("users.form.passwordPlaceholder") : t("users.form.newPasswordHint")}
              {...register("password")}
            />
          </FormFieldWrapper>
        </CardContent>
      </Card>

      {role === "HOSPITAL" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("users.form.hospital")}</CardTitle>
            <CardDescription>{t("users.form.hospitalDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormFieldWrapper label={t("users.form.hospitalName")} htmlFor="hospitalName" error={errors.hospitalName?.message}>
              <Input id="hospitalName" {...register("hospitalName")} />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("users.form.licenseNumber")} htmlFor="licenseNumber" error={errors.licenseNumber?.message}>
              <Input id="licenseNumber" {...register("licenseNumber")} />
            </FormFieldWrapper>
            <FormFieldWrapper className="sm:col-span-2" label={t("users.form.address")} htmlFor="address" error={errors.address?.message}>
              <Input id="address" {...register("address")} />
            </FormFieldWrapper>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("users.form.settings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-start gap-3 text-sm text-zinc-700">
            <input type="checkbox" className="mt-0.5 rounded border-zinc-300" {...register("is_email_verified")} />
            <span>
              <span className="font-medium text-zinc-900">{t("users.form.verified")}</span>
              <span className="block text-xs text-zinc-500">{t("users.form.verifiedHint")}</span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-zinc-700">
            <input type="checkbox" className="mt-0.5 rounded border-zinc-300" {...register("receiveAlerts")} />
            <span>
              <span className="font-medium text-zinc-900">{t("users.form.receiveAlerts")}</span>
              <span className="block text-xs text-zinc-500">{t("users.form.receiveAlertsHint")}</span>
            </span>
          </label>
          {mode === "edit" && (
            <label className="flex items-start gap-3 text-sm text-zinc-700">
              <input type="checkbox" className="mt-0.5 rounded border-zinc-300" {...register("active")} />
              <span>
                <span className="font-medium text-zinc-900">{t("users.form.active")}</span>
                <span className="block text-xs text-zinc-500">{t("users.form.activeHint")}</span>
              </span>
            </label>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? t("common.saving") : mode === "create" ? t("users.form.create") : t("common.saveChanges")}
      </Button>
    </form>
  );
}
