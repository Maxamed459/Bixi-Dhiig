"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value?: number | string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  tone?: "red" | "sky" | "emerald" | "amber" | "zinc";
}

const TONES = {
  red: "bg-red-50 text-red-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  zinc: "bg-zinc-100 text-zinc-600",
} as const;

export function StatCard({ label, value, hint, icon: Icon, loading, tone = "red" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div className="min-w-0">
          <p className="truncate text-sm text-zinc-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{loading ? "…" : (value ?? 0)}</p>
          {hint && <p className="mt-1 truncate text-xs text-zinc-400">{hint}</p>}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", TONES[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
