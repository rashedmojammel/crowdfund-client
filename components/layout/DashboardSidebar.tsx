"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getDashboardNav, isNavItemActive } from "@/components/layout/dashboard-nav";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { useSessionStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Desktop role-based navigation — MobileNav covers screens under 768px. */
export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useSessionStore((s) => s.user);
  const { collapsed, toggle } = useSidebarCollapsed();
  if (!user) return null;

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r transition-[width] duration-200 md:flex",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link
            href="/"
            className="flex items-center gap-2 overflow-hidden text-xl font-bold"
            aria-label="FundSpark home"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
              F
            </span>
            {!collapsed ? (
              <span className="whitespace-nowrap">
                Fund<span className="text-primary">Spark</span>
              </span>
            ) : null}
          </Link>
        </div>

        <nav
          aria-label="Dashboard"
          className="flex grow flex-col gap-1 overflow-y-auto overflow-x-hidden p-3"
        >
          {getDashboardNav(user.role).map((item) => {
            const active = isNavItemActive(item.href, pathname);
            const link = (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {!collapsed ? <span className="whitespace-nowrap">{item.label}</span> : null}
              </Link>
            );

            if (!collapsed) return link;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t p-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  className="flex items-center justify-center rounded-lg px-0 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Back to FundSpark</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
              Back to FundSpark
            </Link>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={collapsed ? "justify-center" : "justify-start gap-3"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="size-4" aria-hidden="true" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
