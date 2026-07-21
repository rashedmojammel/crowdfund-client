"use client";

import { CountUp } from "@/components/animations/CountUp";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";

const stats = [
  { value: 12480, suffix: "+", label: "Supporters backing projects" },
  { value: 316, suffix: "", label: "Campaigns fully funded" },
  { value: 2140000, suffix: "", label: "Credits contributed to date" },
  { value: 64, suffix: "", label: "Districts reached across Bangladesh" },
];

export function PlatformImpact() {
  return (
    <section aria-labelledby="impact-heading" className="bg-muted py-12 md:py-16">
      <div className="container-fs">
        <FadeIn className="text-center">
          <h2 id="impact-heading">What we&rsquo;ve funded together</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Real numbers from real campaigns — updated as every contribution is approved.
          </p>
        </FadeIn>

        <StaggerChildren className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="flex flex-col items-center gap-2 text-center">
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  className="text-[32px] font-bold leading-[1.25] text-primary"
                />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
