"use client";

// Stripe Checkout flow: Buy → POST /payments creates a checkout session →
// redirect to its URL. In mock mode that URL is the in-app /mock-checkout
// page; with the real server it's Stripe's hosted checkout — the only
// difference is where the redirect lands.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import {
  CreditPackageCard,
  type CreditPackage,
} from "@/components/dashboard/supporter/CreditPackageCard";
import { apiFetch } from "@/lib/api-client";
import { formatCredits } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import { CREDIT_PACKAGES } from "@/lib/utils";
import type { CheckoutSession } from "@/types";

export default function PurchaseCreditPage() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkout = useMutation({
    mutationFn: (pkg: CreditPackage) =>
      apiFetch<CheckoutSession>("/payments", {
        method: "POST",
        body: { credits: pkg.credits },
      }),
    onSuccess: (session) => {
      // Real Stripe sessions have an absolute https URL — a full navigation.
      // The mock session URL is an in-app route, so keep the SPA alive
      // (a hard reload would wipe the in-memory mock session).
      if (session.url.startsWith("http")) {
        window.location.assign(session.url);
      } else {
        router.push(session.url);
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Couldn't start checkout");
      setPendingId(null);
    },
  });

  if (!user) return null;

  if (user.role !== "supporter") {
    return (
      <Alert
        theme="info"
        title="Supporters only"
        message="Credit packages are for supporter accounts. Creators receive credits through campaign contributions instead."
      />
    );
  }

  const handleBuy = (pkg: CreditPackage) => {
    setError(null);
    setPendingId(pkg.id);
    checkout.mutate(pkg);
  };

  return (
    <FadeIn className="flex flex-col gap-6">
      <div>
        <h2>Purchase Credit</h2>
        <p className="mt-2 text-sm opacity-70">
          10 credits per dollar, no fees. Your balance: {formatCredits(user.credits)}. You&rsquo;ll
          be taken to a secure checkout to complete the payment.
        </p>
      </div>

      {error ? <Alert theme="danger" message={error} /> : null}

      <StaggerChildren className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CREDIT_PACKAGES.map((pkg) => (
          <StaggerItem key={pkg.id} className="h-full">
            <CreditPackageCard pkg={pkg} onBuy={handleBuy} loading={pendingId === pkg.id} />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </FadeIn>
  );
}
