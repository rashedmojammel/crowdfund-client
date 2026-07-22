"use client";

// NOTE: the real server has no GET /payments/session, POST /payments/confirm,
// or Stripe webhook route (app/api/payments/webhook is unbuilt — see
// Architecture.md) — nothing actually credits the wallet after a real
// Stripe payment yet. This page can only show a generic confirmation; it
// can't verify the payment or report a live balance until the webhook exists.

import { Button, Icon } from "@gravity-ui/uikit";
import { CircleCheckFill } from "@gravity-ui/icons";
import { FadeIn } from "@/components/animations/FadeIn";

export function SuccessClient() {
  return (
    <FadeIn className="flex flex-col items-center gap-6 py-16 text-center">
      <span className="text-[var(--g-color-text-positive)]">
        <Icon data={CircleCheckFill} size={64} />
      </span>
      <div>
        <h2>Payment successful</h2>
        <p className="mx-auto mt-2 max-w-md text-sm opacity-70">
          Your credits will be added to your wallet shortly. The receipt will appear in your
          payment history once it&rsquo;s processed.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button view="action" size="l" href="/dashboard/explore-campaigns">
          Find a campaign to back
        </Button>
        <Button view="outlined" size="l" href="/dashboard/payment-history">
          View payment history
        </Button>
      </div>
    </FadeIn>
  );
}
