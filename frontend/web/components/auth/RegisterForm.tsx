"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Droplet, Mail, Lock, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/lib/validation";
import { getErrorMessage } from "@/lib/get-error-message";
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
        password: values.password,
      });
      toast.success("Account created. Check your email for a verification code.");
      router.push("/verify-email");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to register. Please try again."));
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
        <CardTitle className="text-xl text-zinc-50">Register your hospital</CardTitle>
        <CardDescription className="text-zinc-400">
          The web dashboard is only open to verified hospitals and admins.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <GoogleAuthButton label="Sign up with Google" />
        <Divider label="or" variant="dark" />
      </CardContent>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-0">
          <AuthFormField label="Hospital / display name" htmlFor="display_name" error={errors.display_name?.message}>
            <IconInput
              id="display_name"
              placeholder="Banadir General Hospital"
              autoComplete="organization"
              icon={<Building2 className="h-4 w-4" />}
              {...register("display_name")}
            />
          </AuthFormField>

          <AuthFormField label="Email" htmlFor="email" error={errors.email?.message}>
            <IconInput
              id="email"
              type="email"
              placeholder="contact@hospital.org"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              {...register("email")}
            />
          </AuthFormField>

          <AuthFormField label="Password" htmlFor="password" error={errors.password?.message}>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="new-password"
              icon={<Lock className="h-4 w-4" />}
              {...register("password")}
            />
          </AuthFormField>

          <AuthFormField label="Account type" htmlFor="role">
            {/* Locked to "hospital" — regular user accounts can't be created from the web. */}
            <Select value="hospital" disabled>
              <SelectTrigger id="role" className="border-zinc-800 bg-zinc-900/60 text-zinc-100 disabled:opacity-70">
                <SelectValue placeholder="Hospital" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hospital">Hospital</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">
              Donor/requester accounts must be created from the mobile app.
            </p>
          </AuthFormField>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create hospital account"}
          </Button>
        </CardContent>
      </form>

      <CardFooter>
        <p className="w-full text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-red-400 hover:text-red-300 hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
