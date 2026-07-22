"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  /** Omit to render without a retry action. */
  onRetry?: () => void;
  /** Tighter, icon-only-adjacent layout for small surfaces like popovers. */
  compact?: boolean;
  className?: string;
}

/**
 * Inline fetch-failure state with a retry action — the error-side
 * counterpart to EmptyState. Use anywhere a data fetch can fail mid-page
 * so users get a way back in instead of an empty or broken section.
 */
export function ErrorState({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  onRetry,
  compact = false,
  className,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className={cn("flex flex-col items-center gap-2 px-4 py-8 text-center", className)}>
        <TriangleAlert className="size-5 text-destructive" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl bg-muted px-6 py-16 text-center",
        className
      )}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background">
        <TriangleAlert className="size-7 text-destructive" aria-hidden="true" />
      </span>
      <div>
        <h4>{title}</h4>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          <RotateCw aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
