"use client";

import { Icon } from "@gravity-ui/uikit";
import { Magnifier, Wallet, Rocket } from "@gravity-ui/icons";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";

const steps = [
  {
    icon: Magnifier,
    title: "Discover a campaign",
    description:
      "Browse campaigns across six categories. Every one is reviewed and approved by our team before it can accept a single credit.",
  },
  {
    icon: Wallet,
    title: "Contribute credits",
    description:
      "Top up your wallet — 10 credits per dollar — and back any live campaign. The creator personally reviews and accepts each contribution.",
  },
  {
    icon: Rocket,
    title: "Watch it happen",
    description:
      "Follow funding progress and get notified at every step. Creators withdraw earnings as the work gets delivered, at 20 credits per dollar.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="container-page">
      <FadeIn className="text-center">
        <h2 id="how-it-works-heading">How FundSpark works</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm opacity-70">
          Three steps between a good idea and a funded one.
        </p>
      </FadeIn>

      <StaggerChildren className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <StaggerItem key={step.title}>
            <div className="flex h-full flex-col items-center gap-4 rounded-xl p-6 text-center">
              <div className="relative">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--g-color-base-brand)] text-[var(--g-color-text-brand-contrast)]">
                  <Icon data={step.icon} size={28} />
                </span>
                <span
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--g-color-base-background)] text-xs font-semibold shadow-modal"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
              </div>
              <h4>{step.title}</h4>
              <p className="text-sm opacity-70">{step.description}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  );
}
