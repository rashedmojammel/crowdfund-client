"use client";

import { Label } from "@gravity-ui/uikit";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { formatNumber } from "@/lib/format";
import { useSessionStore } from "@/lib/store";

/** Available credits + notification bell + account menu, on every dashboard page. */
export function DashboardTopBar() {
  const user = useSessionStore((s) => s.user);
  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--g-color-line-generic)] bg-[var(--g-color-base-background)]">
      <div className="flex h-16 items-center justify-between gap-4 px-5 md:px-8">
        <div className="flex items-center gap-3">
          <MobileNav />
          <span className="font-semibold">Dashboard</span>
          <RoleBadge role={user.role} />
        </div>

        <div className="flex items-center gap-3">
          <span title="Available credits">
            <Label theme="success" size="m">
              {formatNumber(user.credits)} credits
            </Label>
          </span>
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
