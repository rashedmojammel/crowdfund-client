"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Loading placeholder with the CLAUDE.md pulse (opacity 0.4–0.7, 1.5s).
 * Size it with className to match the final content's dimensions so the
 * layout never shifts when data arrives.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn("skeleton-pulse rounded-lg", className)} />;
}
