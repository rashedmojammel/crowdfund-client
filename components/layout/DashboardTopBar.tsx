"use client";

import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { formatNumber } from "@/lib/format";
import { useSessionStore } from "@/lib/store";

/** Available credits + notification bell + account menu, on every dashboard page. */
export function DashboardTopBar() {
  const user = useSessionStore((s) => s.user);
  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-5 md:px-8">
        <div className="flex items-center gap-3">
          <MobileNav />
          <span className="font-semibold">Dashboard</span>
          <RoleBadge role={user.role} />
        </div>

        <div className="flex items-center gap-3">
          <span title="Available credits">
            <Badge
              variant="outline"
              className="border-[var(--fs-success)]/40 text-[var(--fs-success)]"
            >
              {formatNumber(user.credits)} credits
            </Badge>
          </span>
          <ThemeToggle />
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
