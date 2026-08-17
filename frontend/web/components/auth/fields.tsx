"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Auth-page-only input variants. Both wrap the shared <Input /> primitive
 * (so focus rings, disabled states, and react-hook-form's ref registration
 * all keep working exactly as they do elsewhere) and only add an icon slot
 * plus dark-theme colors via className overrides. Nothing here edits
 * components/ui/input.tsx, so /dashboard and /verify-email are unaffected.
 */

const darkInputClasses =
  "border-zinc-800 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-red-500 focus-visible:ring-offset-zinc-950";

interface IconInputProps extends InputProps {
  icon: React.ReactNode;
}

export const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
  ({ icon, className, ...props }, ref) => (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
        {icon}
      </span>
      <Input ref={ref} className={cn(darkInputClasses, "pl-9", className)} {...props} />
    </div>
  ),
);
IconInput.displayName = "IconInput";

interface PasswordInputProps extends Omit<InputProps, "type"> {
  icon: React.ReactNode;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ icon, className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
          {icon}
        </span>
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(darkInputClasses, "pl-9 pr-9", className)}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
