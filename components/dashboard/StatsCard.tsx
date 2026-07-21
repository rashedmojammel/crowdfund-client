"use client";

import { Icon, type IconData } from "@gravity-ui/uikit";
import { CountUp } from "@/components/animations/CountUp";

interface StatsCardProps {
  label: string;
  value: number;
  icon?: IconData;
  prefix?: string;
  suffix?: string;
  /** Small line under the number, e.g. "≈ $14.00 at withdrawal rate". */
  hint?: string;
}

/** Big-number card for dashboard home pages — the number counts up on view. */
export function StatsCard({ label, value, icon, prefix, suffix, hint }: StatsCardProps) {
  return (
    <div className="shadow-card flex h-full flex-col gap-2 rounded-xl bg-[var(--g-color-base-float)] p-4 md:p-6">
      <div className="flex items-center gap-2 text-sm opacity-70">
        {icon ? <Icon data={icon} size={16} /> : null}
        {label}
      </div>
      <CountUp
        value={value}
        prefix={prefix}
        suffix={suffix}
        className="text-[32px] font-bold leading-[1.25]"
      />
      {hint ? <p className="text-sm opacity-60">{hint}</p> : null}
    </div>
  );
}
