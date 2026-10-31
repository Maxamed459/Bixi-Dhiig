"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Droplet, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/lib/validation";
import { useApiError } from "@/hooks/useApiError";
import { useT } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { IconInput, PasswordInput } from "@/components/auth/fields";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const t = useT();
  const apiError = useApiError();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(values.email, values.password);
      toast.success(t("auth.login.welcome", { name: loggedInUser.display_name }));
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error && error.message === "ROLE_NOT_ALLOWED") {
        // login() already showed a toast and redirected to /unauthorized
        return;
      }
      toast.error(apiError(error, "auth.login.failed"));
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
        <CardTitle className="text-xl text-zinc-50">{t("auth.login.title")}</CardTitle>
        <CardDescription className="text-zinc-400">
          {t("auth.login.subtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <GoogleAuthButton label={t("auth.google.continue")} className="text-md" />
        <Divider label={t("common.or")} variant="dark" />
      </CardContent>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-0">
          <AuthFormField
            label={t("auth.login.email")}
            htmlFor="email"
            error={errors.email?.message}
          >
            <IconInput
              id="email"
              type="email"
              placeholder={t("auth.login.emailPlaceholder")}
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              {...register("email")}
            />
          </AuthFormField>

          <AuthFormField
            label={t("auth.login.password")}
            htmlFor="password"
            error={errors.password?.message}
          >
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              icon={<Lock className="h-4 w-4" />}
              {...register("password")}
            />
          </AuthFormField>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </CardContent>
      </form>

      <CardFooter>
        <p className="w-full text-center text-sm text-zinc-500">
          {t("auth.login.noAccount")}{" "}
          <Link
            href="/register"
            className="font-medium text-red-400 hover:text-red-300 hover:underline"
          >
            {t("auth.login.registerLink")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
