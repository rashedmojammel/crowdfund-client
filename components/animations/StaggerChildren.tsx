"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { SIGNATURE_EASE } from "@/components/animations/FadeIn";

// List/grid entrance per CLAUDE.md: children stagger in at 60ms intervals,
// each fading + sliding up 16px. Use StaggerChildren around the container
// and StaggerItem around each child.

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

interface StaggerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerChildren({ children, className }: StaggerProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: StaggerProps) {
  const reduceMotion = useReducedMotion();
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: SIGNATURE_EASE } },
  };
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
