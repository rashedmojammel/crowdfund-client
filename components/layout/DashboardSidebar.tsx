"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@gravity-ui/uikit";
import { ArrowLeft } from "@gravity-ui/icons";
import { getDashboardNav, isNavItemActive } from "@/components/layout/dashboard-nav";
import { useSessionStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Desktop role-based navigation — MobileNav covers screens under 768px. */
export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useSessionStore((s) => s.user);
  if (!user) return null;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--g-color-line-generic)] md:flex">
      <div className="flex h-16 items-center border-b border-[var(--g-color-line-generic)] px-6">
        <Link href="/" className="text-xl font-bold" aria-label="FundSpark home">
          Fund<span className="text-[var(--g-color-text-brand)]">Spark</span>
        </Link>
      </div>

      <nav aria-label="Dashboard" className="flex grow flex-col gap-1 overflow-y-auto p-4">
        {getDashboardNav(user.role).map((item) => {
          const active = isNavItemActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[var(--g-color-base-selection)] font-semibold"
                  : "hover:bg-[var(--g-color-base-simple-hover)]"
              )}
            >
              <Icon data={item.icon} size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--g-color-line-generic)] p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm opacity-70 transition-colors hover:bg-[var(--g-color-base-simple-hover)] hover:opacity-100"
        >
          <Icon data={ArrowLeft} size={16} />
          Back to FundSpark
        </Link>
      </div>
    </aside>
  );
}
