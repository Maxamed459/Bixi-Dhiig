"use client";

import type { ReactNode } from "react";
import { Droplet, HeartPulse } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Left: brand/emotional copy panel. Right: the form (login/register), passed
 * in as children so both pages can share this shell. Stacks vertically on
 * mobile (brand panel above the form) and splits into two columns from `lg`
 * up.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="hidden lg:flex relative  flex-col justify-between overflow-hidden bg-linear-to-br from-red-600 via-red-700 to-red-800 px-8 py-10 text-white sm:px-12 lg:w-1/2 lg:px-16 lg:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-600">
            <Droplet className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {t("common.appName")}
          </span>
        </div>

        <div className="relative mt-10 max-w-md lg:mt-0">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t("auth.brand.headline")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-red-50/90">
            {t("auth.brand.body")}
          </p>
        </div>

        <div className="relative mt-10 flex items-start gap-2 rounded-lg bg-white/10 p-4 text-sm text-red-50/90 backdrop-blur-sm lg:mt-0">
          <HeartPulse className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {t("auth.brand.notice")}
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-950 px-4 py-10 sm:px-8 lg:w-1/2 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage:
              "radial-gradient(ellipse 60% 55% at 50% 40%, black 0%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 55% at 50% 40%, black 0%, transparent 75%)",
          }}
        />
        <div className="absolute right-4 top-4 z-10 sm:right-8 sm:top-6">
          <LanguageSwitcher tone="dark" />
        </div>
        <div className="relative w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
