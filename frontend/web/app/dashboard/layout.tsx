"use client";

import { useState } from "react";
import { Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useT } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isReady, isLoading } = useRequireAuth();
  const t = useT();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading || !isReady) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
      </div>
    );
  }

  const collapseLabel = collapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar");

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapseLabel}
            aria-expanded={!collapsed}
            title={collapseLabel}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto bg-zinc-50 p-8">{children}</main>
      </div>
    </div>
  );
}
