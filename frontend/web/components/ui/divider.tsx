import { cn } from "@/lib/utils";

interface DividerProps {
  label?: string;
  className?: string;
  /** "light" (default) matches the existing white-card pages. "dark" is for
   * the auth pages' dark card. */
  variant?: "light" | "dark";
}

export function Divider({ label, className, variant = "light" }: DividerProps) {
  const lineColor = variant === "dark" ? "bg-zinc-800" : "bg-zinc-200";
  const borderColor = variant === "dark" ? "border-zinc-800" : "border-zinc-200";
  const textColor = variant === "dark" ? "text-zinc-500" : "text-zinc-400";

  if (!label) {
    return <div className={cn("border-t", borderColor, className)} />;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("h-px flex-1", lineColor)} />
      <span className={cn("text-xs font-medium uppercase tracking-wide", textColor)}>{label}</span>
      <div className={cn("h-px flex-1", lineColor)} />
    </div>
  );
}
