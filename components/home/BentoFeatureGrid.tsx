"use client";

// Bento-style replacement for the plain 3-step HowItWorks layout (inspired
// by 21st.dev's bento-grid pattern family — see MIGRATION.md for the
// components referenced during research). One large "Discover" tile anchors
// the grid; Contribute and Impact stack beside it.

import { Rocket, Search, Wallet } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Search,
    title: "Discover a campaign",
    description:
      "Browse campaigns across six categories. Every one is reviewed and approved by our team before it can accept a single credit.",
    span: "md:col-span-2 md:row-span-2",
    accent: true,
  },
  {
    icon: Wallet,
    title: "Contribute credits",
    description:
      "Top up your wallet — 10 credits per dollar — and back any live campaign. The creator personally reviews and accepts each contribution.",
    span: "md:col-span-1",
    accent: false,
  },
  {
    icon: Rocket,
    title: "See the impact",
    description:
      "Follow funding progress and get notified at every step. Creators withdraw earnings as the work gets delivered, at 20 credits per dollar.",
    span: "md:col-span-1",
    accent: false,
  },
];

export function BentoFeatureGrid() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="container-fs">
      <FadeIn className="text-center">
        <h2 id="how-it-works-heading">How FundSpark works</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Three steps between a good idea and a funded one.
        </p>
      </FadeIn>

      <StaggerChildren className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
        {steps.map((step) => (
          <StaggerItem key={step.title} className={cn("h-full", step.span)}>
            <div
              className={cn(
                "relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md md:p-8",
                step.accent ? "bg-primary-solid text-primary-foreground" : "bg-card"
              )}
            >
              {/* Decorative corner glow — purely visual, no content. */}
              <div
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute -right-10 -top-10 size-40 rounded-full blur-2xl",
                  step.accent ? "bg-white/15" : "bg-primary/10"
                )}
              />
              <span
                className={cn(
                  "relative flex size-12 items-center justify-center rounded-xl",
                  step.accent ? "bg-white/15" : "bg-primary-solid text-primary-foreground"
                )}
              >
                <step.icon className="size-6" aria-hidden="true" />
              </span>
              <div className="relative">
                <h4 className={step.accent ? "text-primary-foreground" : undefined}>
                  {step.title}
                </h4>
                <p
                  className={cn(
                    "mt-2 text-sm leading-relaxed",
                    step.accent ? "text-primary-foreground/85" : "text-muted-foreground"
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  );
}
