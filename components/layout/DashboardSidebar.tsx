"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDashboardNav, isNavItemActive } from "@/components/layout/dashboard-nav";
import { useSessionStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Desktop role-based navigation — MobileNav covers screens under 768px. */
export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useSessionStore((s) => s.user);
  if (!user) return null;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-xl font-bold" aria-label="FundSpark home">
          Fund<span className="text-primary">Spark</span>
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
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to FundSpark
        </Link>
      </div>
    </aside>
  );
}
