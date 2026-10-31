"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";

interface AuthFormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Dark-themed counterpart to components/ui/form-field.tsx. `error` is usually a
 * validation translation key, so it goes through t() (unknown strings pass through).
 */
export function AuthFormField({ label, htmlFor, error, className, children }: AuthFormFieldProps) {
  const t = useT();
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-400">{t(error)}</p>}
    </div>
  );
}
