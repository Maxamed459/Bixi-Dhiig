"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Droplet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/lib/validation";
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

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If a valid, allowed session already exists (e.g. restored on reload),
  // skip the login form entirely.
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && isAllowedRole(user.role)) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

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
      toast.success(`Welcome back, ${loggedInUser.display_name}`);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error && error.message === "ROLE_NOT_ALLOWED") {
        // login() already showed a toast and redirected to /unauthorized
        return;
      }
      toast.error(getErrorMessage(error, "Unable to sign in. Check your credentials and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white">
            <Droplet className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">Bixi-Dhiig Dashboard</CardTitle>
          <CardDescription>Sign in with your admin or hospital account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormFieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="you@hospital.org"
                autoComplete="email"
                {...register("email")}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="Password" htmlFor="password" error={errors.password?.message}>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
            </FormFieldWrapper>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-sm text-zinc-500">
              Hospital account?{" "}
              <Link href="/register" className="font-medium text-red-600 hover:underline">
                Register here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
