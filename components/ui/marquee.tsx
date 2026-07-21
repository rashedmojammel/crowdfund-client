"use client";

import type { AriaAttributes, CSSProperties, ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  /** Scroll direction. */
  reverse?: boolean;
  /** Full loop duration in seconds — lower is faster. */
  durationSeconds?: number;
  className?: string;
}

/**
 * Infinite horizontal marquee: duplicates `children` once and animates the
 * pair by exactly -50% so the loop is seamless. Pauses on hover/focus and
 * freezes entirely under prefers-reduced-motion (both CSS media-query and
 * JS, since the animation itself is CSS-driven for smooth 60fps scroll).
 */
export function Marquee({ children, reverse, durationSeconds = 40, className }: MarqueeProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn("group flex overflow-hidden [--marquee-duration:40s]", className)}
      style={{ "--marquee-duration": `${durationSeconds}s` } as CSSProperties}
    >
      <div
        className={cn(
          "flex shrink-0 items-stretch gap-6",
          !reduceMotion && (reverse ? "animate-marquee-right" : "animate-marquee-left"),
          "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
        )}
      >
        <MarqueeGroup>{children}</MarqueeGroup>
        <MarqueeGroup aria-hidden="true">{children}</MarqueeGroup>
      </div>
    </div>
  );
}

function MarqueeGroup({
  children,
  ...props
}: {
  children: ReactNode;
  "aria-hidden"?: AriaAttributes["aria-hidden"];
}) {
  return (
    <div className="flex shrink-0 items-stretch gap-6" {...props}>
      {children}
    </div>
  );
}
