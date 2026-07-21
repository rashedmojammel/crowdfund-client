"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Optional CTA — rendered under the subtitle when there's an obvious next action. */
  action?: ReactNode;
}

/** Designed empty state per CLAUDE.md — never a bare "No data". */
export function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-muted px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <div>
        <h4>{title}</h4>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
