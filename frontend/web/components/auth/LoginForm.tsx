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
import { getErrorMessage } from "@/lib/get-error-message";
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
      toast.success(`Welcome back, ${loggedInUser.display_name}`);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error && error.message === "ROLE_NOT_ALLOWED") {
        // login() already showed a toast and redirected to /unauthorized
        return;
      }
      toast.error(
        getErrorMessage(
          error,
          "Unable to sign in. Check your credentials and try again.",
        ),
      );
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
        <CardTitle className="text-xl text-zinc-50">Welcome back</CardTitle>
        <CardDescription className="text-zinc-400">
          Sign in to the Bixi-Dhiig hospital &amp; admin dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <GoogleAuthButton label="Continue with Google" className="text-md" />
        <Divider label="or" variant="dark" />
      </CardContent>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-0">
          <AuthFormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
          >
            <IconInput
              id="email"
              type="email"
              placeholder="you@hospital.org"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              {...register("email")}
            />
          </AuthFormField>

          <AuthFormField
            label="Password"
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
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </CardContent>
      </form>

      <CardFooter>
        <p className="w-full text-center text-sm text-zinc-500">
          Don&apos;t have a hospital account?{" "}
          <Link
            href="/register"
            className="font-medium text-red-400 hover:text-red-300 hover:underline"
          >
            Register your hospital
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
