"use client";

import { useT } from "@/lib/i18n/context";
import type { RequestStatus } from "@/lib/blood-requests";
import { cn } from "@/lib/utils";

const SEGMENTS: { status: RequestStatus; bar: string; dot: string }[] = [
  { status: "APPROVED", bar: "bg-sky-500", dot: "bg-sky-500" },
  { status: "PENDING", bar: "bg-amber-400", dot: "bg-amber-400" },
  { status: "FULFILLED", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  { status: "REJECTED", bar: "bg-red-500", dot: "bg-red-500" },
  { status: "CANCELLED", bar: "bg-zinc-400", dot: "bg-zinc-400" },
];

/** Stacked status bar + legend used on the admin overview and requests list. */
export function StatusPipeline({
  counts,
  total,
  className,
}: {
  counts: Partial<Record<RequestStatus, number>>;
  total: number;
  className?: string;
}) {
  const t = useT();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-100">
        {SEGMENTS.map(({ status, bar }) => {
          const value = counts[status] ?? 0;
          const width = total > 0 ? (value / total) * 100 : 0;
          return value > 0 ? (
            <div key={status} className={bar} style={{ width: `${width}%` }} title={`${t(`status.${status}`)}: ${value}`} />
          ) : null;
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {SEGMENTS.map(({ status, dot }) => (
          <span key={status} className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
            <span className={cn("h-2 w-2 rounded-full", dot)} />
            {t(`status.${status}`)}
            <span className="font-semibold text-zinc-800">{counts[status] ?? 0}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
