"use client";

import { CheckCircle2, Clock, Droplet, Send, XCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { BloodRequest } from "@/lib/blood-requests";
import { cn } from "@/lib/utils";

type StepState = "done" | "current" | "upcoming" | "failed";

const TONES: Record<StepState, string> = {
  done: "border-emerald-200 bg-emerald-50 text-emerald-600",
  current: "border-sky-200 bg-sky-50 text-sky-600",
  upcoming: "border-zinc-200 bg-zinc-50 text-zinc-400",
  failed: "border-red-200 bg-red-50 text-red-600",
};

export function LifecycleTimeline({ request }: { request: BloodRequest }) {
  const { t, formatDateTime } = useI18n();
  const { status } = request;

  const reviewState: StepState =
    status === "PENDING" ? "current" : status === "REJECTED" ? "failed" : "done";

  const collectionState: StepState =
    status === "FULFILLED" ? "done" : status === "APPROVED" ? "current" : "upcoming";

  const closeState: StepState = status === "FULFILLED" ? "done" : "upcoming";

  const steps: {
    key: string;
    title: string;
    description: string;
    state: StepState;
    date?: string | null;
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
  }[] = [
    {
      key: "submitted",
      title: t("lifecycle.submitted"),
      description: t("lifecycle.submittedDescription"),
      state: "done",
      date: formatDateTime(request.createdAt),
      icon: Send,
      tone: TONES.done,
    },
    {
      key: "review",
      title: t("lifecycle.review"),
      description:
        status === "PENDING"
          ? t("lifecycle.reviewPending")
          : status === "REJECTED"
            ? request.rejectionReason
              ? t("lifecycle.reviewRejectedWithReason", { reason: request.rejectionReason })
              : t("lifecycle.reviewRejected")
            : t("lifecycle.reviewApproved"),
      state: reviewState,
      date: request.approvedAt ? formatDateTime(request.approvedAt) : null,
      icon: reviewState === "failed" ? XCircle : reviewState === "current" ? Clock : CheckCircle2,
      tone: TONES[reviewState],
    },
    {
      key: "collection",
      title: t("lifecycle.collection"),
      description:
        status === "CANCELLED"
          ? t("lifecycle.collectionCancelled")
          : t("lifecycle.collectionProgress", {
              done: request.unitsFulfilled,
              total: request.unitsNeeded,
            }),
      state: status === "CANCELLED" ? "failed" : collectionState,
      date: null,
      icon: status === "CANCELLED" ? XCircle : Droplet,
      tone: TONES[status === "CANCELLED" ? "failed" : collectionState],
    },
    {
      key: "fulfilled",
      title: t("lifecycle.fulfilled"),
      description:
        status === "FULFILLED"
          ? t("lifecycle.fulfilledDescription")
          : t("lifecycle.fulfilledPending"),
      state: closeState,
      date: status === "FULFILLED" ? formatDateTime(request.updatedAt) : null,
      icon: CheckCircle2,
      tone: TONES[closeState],
    },
  ];

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <li key={step.key} className="relative flex gap-3">
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%+0.25rem)] w-px",
                  step.state === "done" ? "bg-emerald-200" : "bg-zinc-200",
                )}
              />
            )}
            <span className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border", step.tone)}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-x-2">
                <p className="text-sm font-medium text-zinc-900">{step.title}</p>
                {step.date && <span className="text-xs text-zinc-400">{step.date}</span>}
              </div>
              <p className="text-sm text-zinc-500">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
