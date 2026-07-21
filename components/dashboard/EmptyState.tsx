"use client";

import type { ReactNode } from "react";
import { Icon, type IconData } from "@gravity-ui/uikit";

interface EmptyStateProps {
  icon: IconData;
  title: string;
  subtitle: string;
  /** Optional CTA — rendered under the subtitle when there's an obvious next action. */
  action?: ReactNode;
}

/** Designed empty state per CLAUDE.md — never a bare "No data". */
export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-[var(--g-color-base-generic)] px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--g-color-base-float)]">
        <Icon data={icon} size={28} />
      </span>
      <div>
        <h4>{title}</h4>
        <p className="mx-auto mt-2 max-w-sm text-sm opacity-70">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
