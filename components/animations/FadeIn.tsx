"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/** The app's signature easing curve — use for all entrances (CLAUDE.md). */
export const SIGNATURE_EASE = [0.22, 1, 0.36, 1] as const;

interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the entrance starts. */
  delay?: number;
}

/**
 * Standard page/section entrance: fade + 12px rise over 400ms.
 * With prefers-reduced-motion the rise is dropped; the opacity fade stays.
 */
export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: SIGNATURE_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

