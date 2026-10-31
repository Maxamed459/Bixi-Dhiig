"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserRound, LogOut, Droplet, ClipboardList, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import type { UserRole } from "@/lib/types";

interface NavItem {
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  /** Exact-match highlight (otherwise: prefix match, minus the "new" sub-route for Requests). */
  exact?: boolean;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/requests", labelKey: "nav.requests", icon: ClipboardList },
  { href: "/dashboard/requests/new", labelKey: "nav.newRequest", icon: PlusCircle, exact: true, roles: ["HOSPITAL"] },
  { href: "/dashboard/profile", labelKey: "nav.profile", icon: UserRound, exact: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useT();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    void logout();
  };

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href) && !pathname.startsWith("/dashboard/requests/new");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-200 bg-white">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
          <Droplet className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold text-zinc-900">{t("common.appName")}</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role))).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(item) ? "bg-red-50 text-red-700" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-zinc-200 p-4">
        <LanguageSwitcher />
        <div className="px-1">
          <p className="truncate text-sm font-medium text-zinc-900">{user?.display_name}</p>
          <p className="truncate text-xs text-zinc-500">{user?.email}</p>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </Button>
      </div>
    </aside>
  );
}
