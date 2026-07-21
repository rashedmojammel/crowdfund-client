"use client";

// Stripe Checkout cancel redirect target — no charge was made.

import { Button, Icon } from "@gravity-ui/uikit";
import { CircleXmark } from "@gravity-ui/icons";
import { FadeIn } from "@/components/animations/FadeIn";

export default function PurchaseCancelPage() {
  return (
    <FadeIn className="flex flex-col items-center gap-6 py-16 text-center">
      <span className="opacity-40">
        <Icon data={CircleXmark} size={64} />
      </span>
      <div>
        <h2>Payment cancelled</h2>
        <p className="mx-auto mt-2 max-w-md text-sm opacity-70">
          No charge was made and no credits were added. Your card was not touched — you can
          pick a package again whenever you&rsquo;re ready.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button view="action" size="l" href="/dashboard/purchase-credit">
          Back to credit packages
        </Button>
        <Button view="outlined" size="l" href="/dashboard">
          Go to dashboard
        </Button>
      </div>
    </FadeIn>
  );
}
