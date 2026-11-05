"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  ClipboardList,
  Droplet,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  UserRound,
  Users,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import type { UserRole } from "@/lib/types";
import type { AdminPermission } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";

interface NavItem {
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  /** Exact-match highlight (otherwise: prefix match, minus the "new" sub-route for Requests). */
  exact?: boolean;
  roles?: UserRole[];
  permission?: AdminPermission;
  capability?: "canDonate" | "canRequest";
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/requests", labelKey: "nav.requests", icon: ClipboardList },
  { href: "/dashboard/requests/new", labelKey: "nav.newRequest", icon: PlusCircle, exact: true, roles: ["HOSPITAL"] },
  { href: "/dashboard/requests/new", labelKey: "nav.newRequest", icon: PlusCircle, exact: true, roles: ["ADMIN"], capability: "canRequest" },
  { href: "/dashboard/users", labelKey: "nav.users", icon: Users, roles: ["ADMIN"], permission: "MANAGE_USERS" },
  { href: "/dashboard/admins", labelKey: "nav.admins", icon: ShieldCheck, roles: ["ADMIN"] },
  { href: "/dashboard/donations", labelKey: "nav.donations", icon: HeartHandshake, exact: true, roles: ["ADMIN"], permission: "MANAGE_DONATIONS" },
  { href: "/dashboard/notifications", labelKey: "nav.notifications", icon: BellRing, exact: true, roles: ["ADMIN"], permission: "VIEW_NOTIFICATIONS" },
  { href: "/dashboard/profile", labelKey: "nav.profile", icon: UserRound, exact: true },
];

function initials(name: string | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
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
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-zinc-200 bg-white transition-[width] duration-200 ease-in-out",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-zinc-200",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
            <Droplet className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="truncate text-base font-semibold text-zinc-900">{t("common.appName")}</span>
          )}
        </div>
      </div>

      <nav
        className={cn(
          "flex-1 space-y-1 px-3 py-4",
          collapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden",
        )}
      >
        {NAV_ITEMS.filter((item) =>
          (!item.roles || (user && item.roles.includes(user.role))) &&
          (!item.permission || hasPermission(user, item.permission)) &&
          (!item.capability || user?.[item.capability] === true) &&
          (item.href !== "/dashboard/admins" || user?.isSuperAdmin)
        ).map((item) => {
          const Icon = item.icon;
          const label = t(item.labelKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group/nav relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center",
                isActive(item) ? "bg-red-50 text-red-700" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
              {collapsed && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/nav:opacity-100"
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("space-y-3 border-t border-zinc-200 p-4", collapsed && "px-2")}>
        {!collapsed && (
          <div>
            <LanguageSwitcher />
          </div>
        )}

        <div className={cn("flex items-center gap-2 px-1", collapsed && "justify-center px-0")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
            {initials(user?.display_name)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">{user?.display_name}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email}</p>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className={cn("w-full gap-2", collapsed ? "justify-center" : "justify-start")}
          onClick={handleLogout}
          title={collapsed ? t("nav.logout") : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={cn(collapsed && "sr-only")}>{t("nav.logout")}</span>
        </Button>
      </div>
    </aside>
  );
}
