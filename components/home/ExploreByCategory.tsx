"use client";

import Link from "next/link";
import { Icon } from "@gravity-ui/uikit";
import {
  CircleTree,
  Cpu,
  GraduationCap,
  HeartPulse,
  Palette,
  Persons,
} from "@gravity-ui/icons";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { CATEGORIES } from "@/lib/constants";
import type { CampaignCategory } from "@/types";

const categoryIcons: Record<CampaignCategory, typeof Cpu> = {
  technology: Cpu,
  education: GraduationCap,
  health: HeartPulse,
  environment: CircleTree,
  community: Persons,
  creative: Palette,
};

export function ExploreByCategory() {
  return (
    <section id="categories" aria-labelledby="categories-heading" className="container-page">
      <FadeIn className="text-center">
        <h2 id="categories-heading">Explore by category</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm opacity-70">
          Six ways people are changing things — pick the one you care about most.
        </p>
      </FadeIn>

      <StaggerChildren className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {CATEGORIES.map((category) => (
          <StaggerItem key={category.value} className="h-full">
            <Link
              href={`/explore?category=${category.value}`}
              className="card-elevate flex h-full flex-col items-center gap-3 rounded-xl bg-[var(--g-color-base-float)] p-6 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--g-color-base-generic)]">
                <Icon data={categoryIcons[category.value]} size={24} />
              </span>
              <span className="font-semibold">{category.label}</span>
              <span className="text-sm opacity-70">{category.blurb}</span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  );
}
