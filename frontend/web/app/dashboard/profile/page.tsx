"use client";

import { UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();

  const fields = [
    { label: "Display name", value: user?.display_name },
    { label: "Email", value: user?.email },
    { label: "Role", value: user?.role },
    { label: "Verified", value: user?.isVerified ? "Yes" : "No" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Profile</h1>
        <p className="text-sm text-zinc-500">Your account details on Bixi-Dhiig.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <UserRound className="h-7 w-7" />
          </div>
          <div>
            <CardTitle>{user?.display_name}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-auto capitalize">
            {user?.role}
          </Badge>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-zinc-100 border-t border-zinc-100">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3 text-sm">
                <dt className="text-zinc-500">{label}</dt>
                <dd className="font-medium text-zinc-900">{String(value ?? "—")}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
