"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useApiError } from "@/hooks/useApiError";
import { useCreateRequest } from "@/hooks/useBloodRequests";
import { useT } from "@/lib/i18n/context";
import { BLOOD_TYPES, URGENCY_LEVELS, createRequestSchema, type CreateRequestFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { FormFieldWrapper } from "@/components/ui/form-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function NewRequestPage() {
  const router = useRouter();
  const t = useT();
  const apiError = useApiError();
  const { user } = useAuth();
  const create = useCreateRequest();

  // Only hospitals create requests (they auto-approve). Admins just review them.
  const isAdmin = user?.role === "ADMIN";
  useEffect(() => {
    if (isAdmin) router.replace("/dashboard/requests");
  }, [isAdmin, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      urgency: "NORMAL",
      unitsNeeded: 1,
      hospitalName: user?.display_name ?? "",
      city: user?.city ?? "",
      contactPhone: user?.phone ?? "",
    },
  });

  const onSubmit = (values: CreateRequestFormValues) =>
    create.mutate(values, {
      onSuccess: (request) => {
        toast.success(t("newRequest.created"));
        router.push(`/dashboard/requests/${request.id}`);
      },
      onError: (error) => toast.error(apiError(error, "newRequest.failed")),
    });

  if (isAdmin) {
    return <p className="text-sm text-zinc-500">{t("newRequest.adminNotice")}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{t("newRequest.title")}</h1>
        <p className="text-sm text-zinc-500">{t("newRequest.subtitle")}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="sr-only">{t("newRequest.title")}</CardTitle>
            <CardDescription className="sr-only">{t("newRequest.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormFieldWrapper className="sm:col-span-2" label={t("newRequest.patientName")} htmlFor="patientName" error={errors.patientName?.message}>
              <Input id="patientName" placeholder={t("newRequest.patientNamePlaceholder")} {...register("patientName")} />
            </FormFieldWrapper>

            <FormFieldWrapper label={t("newRequest.bloodType")} htmlFor="bloodType" error={errors.bloodType?.message}>
              <NativeSelect id="bloodType" defaultValue="" {...register("bloodType")}>
                <option value="" disabled>—</option>
                {BLOOD_TYPES.map((b) => (
                  <option key={b} value={b}>{t(`bloodType.${b}`)}</option>
                ))}
              </NativeSelect>
            </FormFieldWrapper>

            <FormFieldWrapper label={t("newRequest.unitsNeeded")} htmlFor="unitsNeeded" error={errors.unitsNeeded?.message}>
              <Input id="unitsNeeded" type="number" min={1} max={20} {...register("unitsNeeded", { valueAsNumber: true })} />
            </FormFieldWrapper>

            <FormFieldWrapper label={t("newRequest.urgency")} htmlFor="urgency" error={errors.urgency?.message}>
              <NativeSelect id="urgency" {...register("urgency")}>
                {URGENCY_LEVELS.map((u) => (
                  <option key={u} value={u}>{t(`urgency.${u}`)}</option>
                ))}
              </NativeSelect>
            </FormFieldWrapper>

            <FormFieldWrapper label={t("newRequest.contactPhone")} htmlFor="contactPhone" error={errors.contactPhone?.message}>
              <Input id="contactPhone" type="tel" placeholder={t("newRequest.contactPhonePlaceholder")} {...register("contactPhone")} />
            </FormFieldWrapper>

            <FormFieldWrapper label={t("newRequest.hospitalName")} htmlFor="hospitalName" error={errors.hospitalName?.message}>
              <Input id="hospitalName" {...register("hospitalName")} />
            </FormFieldWrapper>

            <FormFieldWrapper label={t("newRequest.city")} htmlFor="city" error={errors.city?.message}>
              <Input id="city" {...register("city")} />
            </FormFieldWrapper>

            <FormFieldWrapper className="sm:col-span-2" label={`${t("newRequest.address")} ${t("common.optional")}`} htmlFor="address" error={errors.address?.message}>
              <Input id="address" placeholder={t("newRequest.addressPlaceholder")} {...register("address")} />
            </FormFieldWrapper>

            <FormFieldWrapper className="sm:col-span-2" label={`${t("newRequest.notes")} ${t("common.optional")}`} htmlFor="notes" error={errors.notes?.message}>
              <Textarea id="notes" placeholder={t("newRequest.notesPlaceholder")} {...register("notes")} />
            </FormFieldWrapper>

            <div className="sm:col-span-2">
              <Button type="submit" className="w-full" disabled={create.isPending}>
                {create.isPending ? t("newRequest.submitting") : t("newRequest.submit")}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
