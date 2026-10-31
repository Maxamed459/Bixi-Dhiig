"use client";

import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES } from "@/lib/i18n";

/** EN | SO toggle. `tone="dark"` is for the dark auth panel, "light" for the dashboard. */
export function LanguageSwitcher({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const dark = tone === "dark";

  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border p-0.5 text-xs font-semibold",
        dark ? "border-zinc-700 bg-zinc-900/80 text-zinc-400" : "border-zinc-200 bg-white text-zinc-500",
        className,
      )}
    >
      <Globe className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          title={t(`lang.${code}`)}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            locale === code
              ? "bg-red-600 text-white"
              : dark
                ? "hover:text-zinc-100"
                : "hover:text-zinc-900",
          )}
        >
          {code === "so" ? "SO" : "EN"}
        </button>
      ))}
    </div>
  );
}
