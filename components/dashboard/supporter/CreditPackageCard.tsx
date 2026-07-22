"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@gravity-ui/uikit";
import { Pressable } from "@/components/animations/Pressable";
import { formatNumber, formatUsd } from "@/lib/format";
import type { CREDIT_PACKAGES } from "@/lib/utils";

export type CreditPackage = (typeof CREDIT_PACKAGES)[number];

interface CreditPackageCardProps {
  pkg: CreditPackage;
  onBuy: (pkg: CreditPackage) => void;
  /** True while this specific package's purchase is in flight. */
  loading?: boolean;
  /** True while ANY package's purchase is in flight — blocks a second, concurrent checkout. */
  disabled?: boolean;
}

/** One of the four purchasable credit packages (10 credits = $1). */
export function CreditPackageCard({
  pkg,
  onBuy,
  loading = false,
  disabled = false,
}: CreditPackageCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
      className="card-elevate flex h-full flex-col gap-4 rounded-xl bg-[var(--g-color-base-float)] p-4 text-center md:p-6"
    >
      <p className="text-sm font-medium uppercase tracking-wide opacity-60">{pkg.name}</p>
      <div>
        <p className="text-[32px] font-bold leading-[1.25]">{formatNumber(pkg.credits)}</p>
        <p className="text-sm opacity-70">credits</p>
      </div>
      <p className="text-lg font-semibold">{formatUsd(pkg.priceUsd)}</p>
      <div className="mt-auto">
        <Pressable>
          <Button
            view="action"
            size="l"
            width="max"
            loading={loading}
            disabled={disabled}
            onClick={() => onBuy(pkg)}
          >
            Buy {formatNumber(pkg.credits)} credits
          </Button>
        </Pressable>
      </div>
    </motion.div>
  );
}
