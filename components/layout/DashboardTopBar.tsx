"use client";

import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { useCommandPaletteStore } from "@/lib/command-palette-store";
import { formatNumber } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import { cn, FOCUS_RING } from "@/lib/utils";

/** Available credits + notification bell + account menu, on every dashboard page. */
export function DashboardTopBar() {
  const user = useSessionStore((s) => s.user);
  const setPaletteOpen = useCommandPaletteStore((s) => s.setOpen);
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
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "hidden items-center gap-2 rounded-lg border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent sm:flex",
              FOCUS_RING
            )}
          >
            <Search className="size-3.5" aria-hidden="true" />
            Jump to…
            <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
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
