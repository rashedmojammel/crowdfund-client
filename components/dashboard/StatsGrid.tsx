"use client";

import { Children, type ReactNode } from "react";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";

/**
 * Stats layout per CLAUDE.md: 2 columns on mobile, 4 on desktop, with the
 * standard staggered entry. Each direct child gets its own stagger slot.
 */
export function StatsGrid({ children }: { children: ReactNode }) {
  return (
    <StaggerChildren className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Children.map(children, (child) => (
        <StaggerItem className="h-full">{child}</StaggerItem>
      ))}
    </StaggerChildren>
  );
}
