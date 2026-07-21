"use client";

import { motion, useReducedMotion } from "motion/react";

interface ProgressBarProps {
  raised: number;
  goal: number;
}

/**
 * amount_raised / funding_goal visual. The fill animates from 0 to its
 * percentage over 800ms ease-out on first view (CLAUDE.md motion rules).
 */
export function ProgressBar({ raised, goal }: ProgressBarProps) {
  const reduceMotion = useReducedMotion();
  const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${percent}% funded`}
      className="h-2 w-full overflow-hidden rounded-full bg-[var(--g-color-base-generic)]"
    >
      <motion.div
        className="h-full rounded-full bg-[var(--g-color-base-brand)]"
        initial={{ width: reduceMotion ? `${percent}%` : "0%" }}
        whileInView={{ width: `${percent}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
