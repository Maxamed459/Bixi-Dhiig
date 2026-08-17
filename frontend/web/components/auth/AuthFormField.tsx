import * as React from "react";
import { cn } from "@/lib/utils";

interface AuthFormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Dark-themed counterpart to components/ui/form-field.tsx. Used only by
 * LoginForm and RegisterForm, so the shared FormFieldWrapper (still used on
 * /dashboard and /verify-email) is left untouched.
 */
export function AuthFormField({ label, htmlFor, error, className, children }: AuthFormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
