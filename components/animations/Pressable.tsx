"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface PressableProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a primary button to give it the standard press feedback
 * (scale 0.97 on tap — CLAUDE.md motion rules). Scale is disabled
 * under prefers-reduced-motion.
 */
export function Pressable({ children, className }: PressableProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
