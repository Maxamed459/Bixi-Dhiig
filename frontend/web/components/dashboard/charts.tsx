"use client";

import { cn } from "@/lib/utils";

export interface ColumnDatum {
  label: string;
  value: number;
  /** Optional richer label for the native tooltip. */
  tooltip?: string;
}

/** Small responsive column chart used for the weekly request trend. */
export function ColumnChart({
  data,
  ariaLabel,
  className,
}: {
  data: ColumnDatum[];
  ariaLabel?: string;
  className?: string;
}) {
  const max = Math.max(1, ...data.map((datum) => datum.value));

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <div className="flex h-44 items-end gap-2 sm:gap-3">
        {data.map((datum, index) => {
          const height = datum.value > 0 ? Math.max((datum.value / max) * 100, 6) : 2;
          return (
            <div
              key={`${datum.label}-${index}`}
              className="group flex h-full flex-1 items-end"
              title={datum.tooltip ?? `${datum.label}: ${datum.value}`}
            >
              <div
                className={cn(
                  "w-full rounded-t-md transition-colors",
                  datum.value > 0 ? "bg-red-500 group-hover:bg-red-600" : "bg-zinc-200",
                )}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2 border-t border-zinc-100 pt-2 sm:gap-3">
        {data.map((datum, index) => (
          <div key={`${datum.label}-label-${index}`} className="min-w-0 flex-1 text-center">
            <p className="truncate text-[11px] text-zinc-400">{datum.label}</p>
            <p className="text-xs font-semibold text-zinc-700">{datum.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface BarDatum {
  label: string;
  value: number;
}

/** Horizontal bar list used for blood-type distribution. */
export function BarList({
  data,
  className,
  barClassName = "bg-red-500",
}: {
  data: BarDatum[];
  className?: string;
  barClassName?: string;
}) {
  const max = Math.max(1, ...data.map((datum) => datum.value));

  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {data.map((datum) => (
        <li key={datum.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="truncate text-zinc-600">{datum.label}</span>
            <span className="shrink-0 font-semibold text-zinc-800">{datum.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className={cn("h-full rounded-full transition-[width]", barClassName)}
              style={{ width: `${(datum.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export interface DonutDatum {
  label: string;
  value: number;
  /** Hex colour used for both the segment and its legend dot. */
  color: string;
}

/** Donut chart with a legend, built with a conic-gradient (no chart dependency). */
export function DonutChart({
  data,
  centerLabel,
  className,
}: {
  data: DonutDatum[];
  centerLabel: string;
  className?: string;
}) {
  const total = data.reduce((sum, datum) => sum + datum.value, 0);

  let cursor = 0;
  const stops = data
    .filter((datum) => datum.value > 0)
    .map((datum) => {
      const start = cursor;
      cursor += (datum.value / total) * 100;
      return `${datum.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  return (
    <div
      className={cn("flex flex-col items-center gap-6 sm:flex-row", className)}
      role="img"
      aria-label={data.map((datum) => `${datum.label}: ${datum.value}`).join(", ")}
    >
      <div
        className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
        style={{ background: total > 0 ? `conic-gradient(${stops})` : "#f4f4f5" }}
      >
        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-inner">
          <span className="text-2xl font-semibold text-zinc-900">{total}</span>
          <span className="max-w-20 text-center text-xs leading-tight text-zinc-500">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {data.map((datum) => (
          <li key={datum.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: datum.color }}
              />
              <span className="truncate text-zinc-600">{datum.label}</span>
            </span>
            <span className="shrink-0 font-medium text-zinc-800">
              {datum.value}
              <span className="ml-1 text-xs text-zinc-400">
                {total > 0 ? `${Math.round((datum.value / total) * 100)}%` : "0%"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
