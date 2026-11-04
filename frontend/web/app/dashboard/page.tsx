"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Droplet,
  HeartHandshake,
  Hourglass,
  Loader2,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStats } from "@/hooks/useAdmin";
import { useRequestsList } from "@/hooks/useBloodRequests";
import { useI18n } from "@/lib/i18n/context";
import { dateLocale } from "@/lib/i18n";
import { BLOOD_TYPES } from "@/lib/validation";
import type { BloodType, RequestStatus } from "@/lib/blood-requests";
import type { UserRole } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusPipeline } from "@/components/dashboard/status-pipeline";
import { BarList, ColumnChart, DonutChart } from "@/components/dashboard/charts";
import { DonationStatusBadge, StatusBadge, UrgencyBadge } from "@/components/requests/badges";

function RecentRequests({ items }: { items: { id: string; patientName: string; bloodType: string; city: string; hospitalName: string; urgency: "NORMAL" | "URGENT" | "CRITICAL"; status: "PENDING" | "APPROVED" | "REJECTED" | "FULFILLED" | "CANCELLED"; createdAt: string }[] }) {
  const { t, formatDateTime } = useI18n();

  if (items.length === 0) {
    return <p className="py-4 text-sm text-zinc-500">{t("dashboard.noRecent")}</p>;
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {items.map((request) => (
        <li key={request.id}>
          <Link href={`/dashboard/requests/${request.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-zinc-50">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">
                {request.patientName} · {t(`bloodType.${request.bloodType}`)}
              </p>
              <p className="truncate text-xs text-zinc-500">
                {request.hospitalName}, {request.city} · {formatDateTime(request.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <UrgencyBadge urgency={request.urgency} />
              <StatusBadge status={request.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const USER_ROLES: UserRole[] = ["ADMIN", "HOSPITAL", "USER"];
const REQUEST_STATUSES: RequestStatus[] = ["PENDING", "APPROVED", "FULFILLED", "REJECTED", "CANCELLED"];

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "#dc2626",
  HOSPITAL: "#0284c7",
  USER: "#059669",
};

const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: "#fbbf24",
  APPROVED: "#0ea5e9",
  FULFILLED: "#10b981",
  REJECTED: "#ef4444",
  CANCELLED: "#a1a1aa",
};

function ChartLoading() {
  return (
    <div className="flex h-44 items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-red-600" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, formatDateTime, locale } = useI18n();
  const isAdmin = user?.role === "ADMIN";
  const adminView = !isAdmin;

  // Hospital overview (also used as a fallback while admin stats load).
  const pending = useRequestsList({ status: "PENDING", limit: 1 }, "all", adminView);
  const live = useRequestsList({ status: "APPROVED", limit: 1 }, "all", adminView);
  const fulfilled = useRequestsList({ status: "FULFILLED", limit: 1 }, "all", adminView);
  const mine = useRequestsList({ limit: 1000 }, "mine", adminView);
  const recentRequests = useRequestsList({ limit: 5 }, "all", adminView);

  const stats = useAdminStats(isAdmin);

  const admin = stats.data;

  const trendData = (admin?.requests.byDay ?? []).map(({ date, count }) => {
    const day = new Date(`${date}T00:00:00Z`);
    return {
      label: day.toLocaleDateString(dateLocale(locale), { weekday: "short", timeZone: "UTC" }),
      value: count,
      tooltip: `${day.toLocaleDateString(dateLocale(locale), {
        weekday: "long",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })}: ${count}`,
    };
  });

  const roleChartData = USER_ROLES.map((role) => ({
    label: t(`roles.${role}`),
    value: admin?.users.byRole[role] ?? 0,
    color: ROLE_COLORS[role],
  }));

  const bloodTypeChartData = BLOOD_TYPES.map((type) => ({
    label: t(`bloodType.${type}`),
    value: admin?.users.donorsByBloodType[type] ?? 0,
  }));

  const donorsWithBloodType = bloodTypeChartData.reduce((sum, item) => sum + item.value, 0);

  const myRequests = mine.data?.items ?? [];
  const myStatusCounts = myRequests.reduce<Partial<Record<RequestStatus, number>>>((acc, request) => {
    acc[request.status] = (acc[request.status] ?? 0) + 1;
    return acc;
  }, {});
  const myBloodTypeCounts = myRequests.reduce<Partial<Record<BloodType, number>>>((acc, request) => {
    acc[request.bloodType] = (acc[request.bloodType] ?? 0) + 1;
    return acc;
  }, {});

  const myStatusChartData = REQUEST_STATUSES.map((status) => ({
    label: t(`status.${status}`),
    value: myStatusCounts[status] ?? 0,
    color: REQUEST_STATUS_COLORS[status],
  }));

  const myBloodTypeChartData = BLOOD_TYPES.map((type) => ({
    label: t(`bloodType.${type}`),
    value: myBloodTypeCounts[type] ?? 0,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {t("dashboard.welcome", { name: user?.display_name ?? "" })}
          </h1>
          <p className="text-sm text-zinc-500">
            {isAdmin ? t("dashboard.subtitleAdmin") : t("dashboard.subtitleHospital")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role && <Badge variant="secondary">{t(`roles.${user.role}`)}</Badge>}
          {isAdmin && (
            <Button asChild size="sm">
              <Link href="/dashboard/users">
                <Users className="h-4 w-4" />
                {t("dashboard.manageUsers")}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isAdmin ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t("dashboard.stats.totalUsers")}
              value={admin?.users.total}
              hint={t("dashboard.hints.newUsers", { count: admin?.users.newThisWeek ?? 0 })}
              icon={Users}
              loading={stats.isLoading}
              tone="sky"
            />
            <StatCard
              label={t("dashboard.stats.pending")}
              value={admin?.requests.pending}
              hint={t("dashboard.hints.liveRequests", { count: admin?.requests.live ?? 0 })}
              icon={Hourglass}
              loading={stats.isLoading}
              tone="amber"
            />
            <StatCard
              label={t("dashboard.stats.donations")}
              value={admin?.donations.total}
              hint={t("dashboard.hints.completedDonations", { count: admin?.donations.completed ?? 0 })}
              icon={HeartHandshake}
              loading={stats.isLoading}
              tone="emerald"
            />
            <StatCard
              label={t("dashboard.stats.unitsCollected")}
              value={admin?.donations.completedUnits}
              hint={t("dashboard.hints.fulfilledRequests", { count: admin?.requests.fulfilled ?? 0 })}
              icon={Droplet}
              loading={stats.isLoading}
              tone="red"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <CardTitle>{t("dashboard.charts.requestsTrend")}</CardTitle>
                  <CardDescription>{t("dashboard.charts.requestsTrendDescription")}</CardDescription>
                </div>
                <Badge variant="secondary">
                  {t("dashboard.charts.requestsTrendTotal", { count: admin?.requests.newThisWeek ?? 0 })}
                </Badge>
              </CardHeader>
              <CardContent>
                {stats.isLoading ? (
                  <ChartLoading />
                ) : (
                  <ColumnChart
                    data={trendData}
                    ariaLabel={t("dashboard.charts.requestsTrendDescription")}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.charts.usersByRole")}</CardTitle>
                <CardDescription>{t("dashboard.charts.usersByRoleDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.isLoading ? (
                  <ChartLoading />
                ) : (
                  <DonutChart data={roleChartData} centerLabel={t("dashboard.charts.accounts")} />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle>{t("dashboard.charts.donorsByBloodType")}</CardTitle>
                <CardDescription>{t("dashboard.charts.donorsByBloodTypeDescription")}</CardDescription>
              </div>
              <Badge variant="secondary">
                {t("dashboard.charts.donorsByBloodTypeTotal", { count: donorsWithBloodType })}
              </Badge>
            </CardHeader>
            <CardContent>
              {stats.isLoading ? (
                <ChartLoading />
              ) : (
                <BarList
                  data={bloodTypeChartData}
                  className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle>{t("dashboard.requestPipeline")}</CardTitle>
                <CardDescription>{t("dashboard.requestPipelineDescription")}</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/requests">
                  {t("dashboard.reviewRequests")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats.isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-red-600" />
              ) : (
                <StatusPipeline counts={admin?.requests.byStatus ?? {}} total={admin?.requests.total ?? 0} />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
                {stats.isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                ) : (
                  <RecentRequests items={admin?.recent.requests ?? []} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle>{t("dashboard.recentUsers")}</CardTitle>
                  <CardDescription>{t("dashboard.recentUsersDescription")}</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/users">{t("dashboard.manageUsers")}</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {stats.isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                ) : admin && admin.recent.users.length > 0 ? (
                  <ul className="divide-y divide-zinc-100">
                    {admin.recent.users.map((u) => (
                      <li key={u.id}>
                        <Link href={`/dashboard/users/${u.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-zinc-50">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-900">{u.display_name}</p>
                            <p className="truncate text-xs text-zinc-500">{u.email}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {u.bloodType && (
                              <Badge variant="outline">{t(`bloodType.${u.bloodType}`)}</Badge>
                            )}
                            <Badge variant="secondary">{t(`roles.${u.role}`)}</Badge>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-sm text-zinc-500">{t("dashboard.noUsers")}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle>{t("dashboard.recentDonations")}</CardTitle>
                <CardDescription>{t("dashboard.recentDonationsDescription")}</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/donations">{t("dashboard.viewAll")}</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats.isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-red-600" />
              ) : admin && admin.recent.donations.length > 0 ? (
                <ul className="divide-y divide-zinc-100">
                  {admin.recent.donations.map((donation) => (
                    <li key={donation.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {donation.donor.display_name} → {donation.bloodRequest.patientName} · {t(`bloodType.${donation.bloodRequest.bloodType}`)}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {donation.bloodRequest.city} · {formatDateTime(donation.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-zinc-500">{t("common.unitsCount", { count: donation.unitsOffered })}</span>
                        <DonationStatusBadge status={donation.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-sm text-zinc-500">{t("dashboard.noDonations")}</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t("dashboard.stats.pending")} value={pending.data?.total} icon={Hourglass} loading={pending.isLoading} tone="amber" />
            <StatCard label={t("dashboard.stats.live")} value={live.data?.total} icon={Radio} loading={live.isLoading} tone="sky" />
            <StatCard label={t("dashboard.stats.fulfilled")} value={fulfilled.data?.total} icon={CheckCircle2} loading={fulfilled.isLoading} tone="emerald" />
            <StatCard label={t("dashboard.stats.myRequests")} value={mine.data?.total} icon={ClipboardList} loading={mine.isLoading} tone="zinc" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.charts.myRequestsByStatus")}</CardTitle>
                <CardDescription>{t("dashboard.charts.myRequestsByStatusDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                {mine.isLoading ? (
                  <ChartLoading />
                ) : mine.data && mine.data.total > 0 ? (
                  <DonutChart data={myStatusChartData} centerLabel={t("dashboard.charts.requests")} />
                ) : (
                  <p className="py-4 text-sm text-zinc-500">{t("dashboard.charts.noData")}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.charts.myRequestsByBloodType")}</CardTitle>
                <CardDescription>{t("dashboard.charts.myRequestsByBloodTypeDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                {mine.isLoading ? (
                  <ChartLoading />
                ) : mine.data && mine.data.total > 0 ? (
                  <BarList data={myBloodTypeChartData} className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2" />
                ) : (
                  <p className="py-4 text-sm text-zinc-500">{t("dashboard.charts.noData")}</p>
                )}
              </CardContent>
            </Card>
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
              {recentRequests.isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-red-600" />
              ) : recentRequests.data && recentRequests.data.items.length > 0 ? (
                <RecentRequests items={recentRequests.data.items} />
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-600" />
                {t("dashboard.hospitalGuideTitle")}
              </CardTitle>
              <CardDescription>{t("dashboard.hospitalGuideDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/requests">{t("nav.requests")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/requests/new">{t("nav.newRequest")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/profile">{t("nav.profile")}</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
