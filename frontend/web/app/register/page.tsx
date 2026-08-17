"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Droplet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/lib/validation";
import { getErrorMessage } from "@/lib/get-error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "@/components/ui/form-field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function RegisterPage() {
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
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white">
            <Droplet className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">Register your hospital</CardTitle>
          <CardDescription>
            The web dashboard is only open to verified hospitals and admins.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormFieldWrapper label="Hospital / display name" htmlFor="display_name" error={errors.display_name?.message}>
              <Input
                id="display_name"
                placeholder="Banadir General Hospital"
                autoComplete="organization"
                {...register("display_name")}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="contact@hospital.org"
                autoComplete="email"
                {...register("email")}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="Password" htmlFor="password" error={errors.password?.message}>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("password")}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="Account type" htmlFor="role">
              {/* Locked to "hospital" — regular user accounts can't be created from the web. */}
              <Select value="hospital" disabled>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">Hospital</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500">
                Regular donor/requester accounts must be created from the mobile app.
              </p>
            </FormFieldWrapper>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create hospital account"}
            </Button>
            <p className="text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-red-600 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
