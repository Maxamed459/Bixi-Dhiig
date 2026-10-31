"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";

interface FormFieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormFieldWrapper({ label, htmlFor, error, className, children }: FormFieldWrapperProps) {
  const t = useT();
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{t(error)}</p>}
    </div>
  );
}
