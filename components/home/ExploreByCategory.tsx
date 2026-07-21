"use client";

import Link from "next/link";
import { Cpu, GraduationCap, HeartPulse, Palette, TreeDeciduous, Users, type LucideIcon } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { CATEGORIES } from "@/lib/constants";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { CampaignCategory } from "@/types";

const categoryIcons: Record<CampaignCategory, LucideIcon> = {
  technology: Cpu,
  education: GraduationCap,
  health: HeartPulse,
  environment: TreeDeciduous,
  community: Users,
  creative: Palette,
};

export function ExploreByCategory() {
  return (
    <section id="categories" aria-labelledby="categories-heading" className="container-fs">
      <FadeIn className="text-center">
        <h2 id="categories-heading">Explore by category</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Six ways people are changing things — pick the one you care about most.
        </p>
      </FadeIn>

      <StaggerChildren className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {CATEGORIES.map((category) => {
          const CategoryIcon = categoryIcons[category.value];
          return (
            <StaggerItem key={category.value} className="h-full">
              <Link
                href={`/explore?category=${category.value}`}
                className={cn(
                  "flex h-full flex-col items-center gap-3 rounded-xl bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md",
                  FOCUS_RING
                )}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <CategoryIcon className="size-6" aria-hidden="true" />
                </span>
                <span className="font-semibold">{category.label}</span>
                <span className="text-sm text-muted-foreground">{category.blurb}</span>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerChildren>
    </section>
  );
}
