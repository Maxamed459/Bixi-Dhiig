"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Droplet, Mail, Lock, Building2, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/lib/validation";
import { useApiError } from "@/hooks/useApiError";
import { useT } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { IconInput, PasswordInput } from "@/components/auth/fields";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const t = useT();
  const apiError = useApiError();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "hospital" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        display_name: values.display_name,
        email: values.email,
        phone: values.phone,
        city: values.city,
        password: values.password,
      });
      toast.success(t("auth.register.success"));
      router.push("/verify-email");
    } catch (error) {
      toast.error(apiError(error, "auth.register.failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/40 backdrop-blur">
      <CardHeader className="items-center space-y-1 text-center">
        <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700">
          <Droplet className="h-5 w-5 text-red-500" />
        </div>
        <CardTitle className="text-xl text-zinc-50">{t("auth.register.title")}</CardTitle>
        <CardDescription className="text-zinc-400">
          {t("auth.register.subtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <GoogleAuthButton label={t("auth.google.signup")} />
        <Divider label={t("common.or")} variant="dark" />
      </CardContent>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-0">
          <AuthFormField label={t("auth.register.displayName")} htmlFor="display_name" error={errors.display_name?.message}>
            <IconInput
              id="display_name"
              placeholder={t("auth.register.displayNamePlaceholder")}
              autoComplete="organization"
              icon={<Building2 className="h-4 w-4" />}
              {...register("display_name")}
            />
          </AuthFormField>

          <AuthFormField label={t("auth.register.email")} htmlFor="email" error={errors.email?.message}>
            <IconInput
              id="email"
              type="email"
              placeholder={t("auth.register.emailPlaceholder")}
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              {...register("email")}
            />
          </AuthFormField>

          <AuthFormField label={t("auth.register.phone")} htmlFor="phone" error={errors.phone?.message}>
            <IconInput
              id="phone"
              type="tel"
              placeholder={t("auth.register.phonePlaceholder")}
              autoComplete="tel"
              icon={<Phone className="h-4 w-4" />}
              {...register("phone")}
            />
            <p className="text-xs text-zinc-500">{t("auth.register.phoneHint")}</p>
          </AuthFormField>

          <AuthFormField label={t("auth.register.city")} htmlFor="city" error={errors.city?.message}>
            <IconInput
              id="city"
              placeholder={t("auth.register.cityPlaceholder")}
              autoComplete="address-level2"
              icon={<MapPin className="h-4 w-4" />}
              {...register("city")}
            />
          </AuthFormField>

          <AuthFormField label={t("auth.register.password")} htmlFor="password" error={errors.password?.message}>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="new-password"
              icon={<Lock className="h-4 w-4" />}
              {...register("password")}
            />
          </AuthFormField>

          <AuthFormField label={t("auth.register.accountType")} htmlFor="role">
            {/* Locked to "hospital" — regular user accounts can't be created from the web. */}
            <Select value="hospital" disabled>
              <SelectTrigger id="role" className="border-zinc-800 bg-zinc-900/60 text-zinc-100 disabled:opacity-70">
                <SelectValue placeholder={t("auth.register.accountTypeHospital")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hospital">{t("auth.register.accountTypeHospital")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">
              {t("auth.register.accountTypeHint")}
            </p>
          </AuthFormField>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.register.submitting") : t("auth.register.submit")}
          </Button>
        </CardContent>
      </form>

      <CardFooter>
        <p className="w-full text-center text-sm text-zinc-500">
          {t("auth.register.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-red-400 hover:text-red-300 hover:underline">
            {t("auth.register.signInLink")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
