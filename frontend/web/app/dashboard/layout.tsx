"use client";

import { Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isReady, isLoading } = useRequireAuth();

  if (isLoading || !isReady) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-zinc-50 p-8">{children}</main>
    </div>
  );
}
