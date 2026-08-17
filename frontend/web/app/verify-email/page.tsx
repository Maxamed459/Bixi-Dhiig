"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { verifySchema, type VerifyFormValues } from "@/lib/validation";
import { getErrorMessage } from "@/lib/get-error-message";
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
      toast.info("Please sign in or register again to verify your account.");
      router.replace("/login");
    }
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
      toast.success("Email verified successfully.");

      if (isAllowedRole(verifiedUser.role)) {
        router.push("/dashboard");
      } else {
        router.push("/unauthorized");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid or expired code. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendCode();
      toast.success("A new verification code has been sent to your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to resend the code. Please try again shortly."));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white">
            <MailCheck className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">Verify your email</CardTitle>
          <CardDescription>
            {user?.email
              ? `Enter the code we sent to ${user.email}`
              : "Enter the verification code we sent to your email"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormFieldWrapper label="Verification code" htmlFor="submittedCode" error={errors.submittedCode?.message}>
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
              {isSubmitting ? "Verifying..." : "Verify email"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={isResending || cooldown > 0}
              onClick={handleResend}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : isResending ? "Sending..." : "Resend code"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
