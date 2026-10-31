"use client";

import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/context";
import type { DonationStatus, RequestStatus, UrgencyLevel } from "@/lib/blood-requests";

const STATUS_VARIANT = {
  PENDING: "warning",
  APPROVED: "info",
  REJECTED: "danger",
  FULFILLED: "success",
  CANCELLED: "secondary",
} as const;

const URGENCY_VARIANT = { NORMAL: "secondary", URGENT: "warning", CRITICAL: "danger" } as const;

const DONATION_VARIANT = {
  PENDING: "warning",
  ACCEPTED: "info",
  COMPLETED: "success",
  DECLINED: "danger",
  CANCELLED: "secondary",
} as const;

export function StatusBadge({ status }: { status: RequestStatus }) {
  const t = useT();
  return <Badge variant={STATUS_VARIANT[status]}>{t(`status.${status}`)}</Badge>;
}

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  const t = useT();
  return <Badge variant={URGENCY_VARIANT[urgency]}>{t(`urgency.${urgency}`)}</Badge>;
}

export function DonationStatusBadge({ status }: { status: DonationStatus }) {
  const t = useT();
  return <Badge variant={DONATION_VARIANT[status]}>{t(`donationStatus.${status}`)}</Badge>;
}
