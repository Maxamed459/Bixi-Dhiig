"use client";

import Link from "next/link";
import { CheckCircle2, ClipboardList, Hourglass, Loader2, Radio } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRequestsList } from "@/hooks/useBloodRequests";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge, UrgencyBadge } from "@/components/requests/badges";

function StatCard({ label, value, icon: Icon, loading }: { label: string; value?: number; icon: typeof Hourglass; loading: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{loading ? "…" : (value ?? 0)}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, formatDateTime } = useI18n();

  // limit=1 is enough for the counts — we only read `total` from these.
  const pending = useRequestsList({ status: "PENDING", limit: 1 });
  const live = useRequestsList({ status: "APPROVED", limit: 1 });
  const fulfilled = useRequestsList({ status: "FULFILLED", limit: 1 });
  const recent = useRequestsList({ limit: 5 });

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t("dashboard.welcome", { name: user?.display_name ?? "" })}</h1>
          <p className="text-sm text-zinc-500">{isAdmin ? t("dashboard.subtitleAdmin") : t("dashboard.subtitleHospital")}</p>
        </div>
        {user?.role && <Badge variant="secondary">{t(`roles.${user.role}`)}</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label={t("dashboard.stats.pending")} value={pending.data?.total} icon={Hourglass} loading={pending.isLoading} />
        <StatCard label={t("dashboard.stats.live")} value={live.data?.total} icon={Radio} loading={live.isLoading} />
        <StatCard label={t("dashboard.stats.fulfilled")} value={fulfilled.data?.total} icon={CheckCircle2} loading={fulfilled.isLoading} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle>{t("dashboard.recent")}</CardTitle>
            <CardDescription>{t("dashboard.recentDescription")}</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/requests">{t("dashboard.viewAll")}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-red-600" />
          ) : recent.data && recent.data.items.length > 0 ? (
            <ul className="divide-y divide-zinc-100">
              {recent.data.items.map((r) => (
                <li key={r.id}>
                  <Link href={`/dashboard/requests/${r.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-zinc-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {r.patientName} · {t(`bloodType.${r.bloodType}`)}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {r.hospitalName}, {r.city} · {formatDateTime(r.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <UrgencyBadge urgency={r.urgency} />
                      <StatusBadge status={r.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-3 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                {t("dashboard.noRecent")}
              </div>
              {user?.role === "HOSPITAL" && (
                <Button asChild size="sm">
                  <Link href="/dashboard/requests/new">{t("dashboard.createFirst")}</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
