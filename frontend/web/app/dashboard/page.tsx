"use client";

import { Droplets, Users, ClipboardList } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STAT_CARDS = [
  { label: "Active blood requests", value: "—", icon: ClipboardList },
  { label: "Available donors", value: "—", icon: Users },
  { label: "Units in stock", value: "—", icon: Droplets },
] as const;

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Welcome back, {user?.display_name}
          </h1>
          <p className="text-sm text-zinc-500">Here&apos;s what&apos;s happening on Bixi-Dhiig today.</p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {user?.role}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-zinc-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            Wire these cards up to your requests/donors/inventory endpoints once they&apos;re ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-zinc-600">
          This dashboard home is intentionally minimal — it&apos;s the landing point after a
          successful login/verification for <span className="font-medium">admin</span> and{" "}
          <span className="font-medium">hospital</span> accounts.
        </CardContent>
      </Card>
    </div>
  );
}
