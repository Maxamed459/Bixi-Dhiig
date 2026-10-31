"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { verifySchema, type VerifyFormValues } from "@/lib/validation";
import { useApiError } from "@/hooks/useApiError";
import { useT } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { isAllowedRole } from "@/lib/role-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "@/components/ui/form-field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailPage() {
  const router = useRouter();
  const t = useT();
  const apiError = useApiError();
  const { verify, resendCode, isAuthenticated, isLoading, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Verifying requires the access token issued at register/login time. If
  // there's no session in memory (e.g. the user refreshed this page and the
  // backend doesn't return `user` from /auth/refresh-token before the account
  // is verified), send them back to sign in.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.info(t("auth.verify.signInAgain"));
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (values: VerifyFormValues) => {
    setIsSubmitting(true);
    try {
      const verifiedUser = await verify(values.submittedCode);
      toast.success(t("auth.verify.success"));

      if (isAllowedRole(verifiedUser.role)) {
        router.push("/dashboard");
      } else {
        router.push("/unauthorized");
      }
    } catch (error) {
      toast.error(apiError(error, "auth.verify.failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendCode();
      toast.success(t("auth.verify.resent"));
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      toast.error(apiError(error, "auth.verify.resendFailed"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative flex flex-1 items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white">
            <MailCheck className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">{t("auth.verify.title")}</CardTitle>
          <CardDescription>
            {user?.email
              ? t("auth.verify.subtitleWithEmail", { email: user.email })
              : t("auth.verify.subtitle")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormFieldWrapper
              label={t("auth.verify.code")}
              htmlFor="submittedCode"
              error={errors.submittedCode?.message}
            >
              <Input
                id="submittedCode"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                className="text-center text-lg tracking-[0.5em]"
                {...register("submittedCode")}
              />
            </FormFieldWrapper>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("auth.verify.submitting") : t("auth.verify.submit")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={isResending || cooldown > 0}
              onClick={handleResend}
            >
              {cooldown > 0
                ? t("auth.verify.resendIn", { seconds: cooldown })
                : isResending
                  ? t("auth.verify.resending")
                  : t("auth.verify.resend")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
