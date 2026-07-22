// Small shared helpers + the credit-economy constants.
// Rates are fixed by product rules: 10 credits = $1 to buy, 20 credits = $1
// to withdraw, 200-credit minimum withdrawal.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn-standard class combiner: clsx for conditionals, twMerge for conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Visible focus-visible ring for hand-rolled interactive elements (plain
 * <Link>/<button>, not shadcn's Button/Input/etc — those already ship
 * their own ring-[3px] treatment). Append via cn(...) alongside hover
 * classes. Every interactive element must have one or the other.
 */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const CREDITS_PER_USD_BUY = 10;
export const CREDITS_PER_USD_WITHDRAW = 20;
export const MIN_WITHDRAWAL_CREDITS = 200;

// Must match CREDIT_PACKAGES on the real server exactly (credits + amountUsd
// pairs) — POST /payments rejects any pair that isn't one of these four.
export const CREDIT_PACKAGES = [
  { id: "starter", name: "Starter", credits: 100, priceUsd: 10 },
  { id: "backer", name: "Backer", credits: 300, priceUsd: 25 },
  { id: "champion", name: "Champion", credits: 800, priceUsd: 60 },
  { id: "patron", name: "Patron", credits: 1500, priceUsd: 110 },
] as const;
