import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout — FundSpark",
};

/** Simulated Stripe-hosted checkout — intentionally outside the app shell. */
export default function MockCheckoutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--g-color-base-generic)] px-5 py-12">
      <div className="w-full max-w-md">
        <Suspense>
          <CheckoutClient />
        </Suspense>
      </div>
    </main>
  );
}
