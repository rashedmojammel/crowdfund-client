// Stripe.js singleton — loaded once, reused everywhere.
//
// The live flow (once crowdfund-server is up):
//   1. POST /payments { credits } → server creates a Stripe Checkout Session
//      with success_url /dashboard/purchase-credit/success?session_id={CHECKOUT_SESSION_ID}
//      and cancel_url /dashboard/purchase-credit/cancel, returns { url }.
//   2. Client redirects to that hosted-checkout URL (plain navigation).
//   3. Stripe webhook POST /payments/webhook credits the wallet, idempotent
//      by session_id.
// In mock mode the same POST /payments returns an in-app /mock-checkout URL
// instead, so no Stripe account is needed during development.

import { loadStripe, type Stripe } from "@stripe/stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export const isStripeConfigured = Boolean(publishableKey);

export function getStripe(): Promise<Stripe | null> {
  if (!publishableKey) return Promise.resolve(null);
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
