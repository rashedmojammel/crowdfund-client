"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button, Icon } from "@gravity-ui/uikit";
import { CircleCheckFill } from "@gravity-ui/icons";
import { FadeIn } from "@/components/animations/FadeIn";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatNumber } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import type { CheckoutSession } from "@/types";

export function SuccessClient() {
  const sessionId = useSearchParams().get("session_id");
  const user = useSessionStore((s) => s.user);

  const { data: session } = useQuery({
    queryKey: ["checkout-session", sessionId],
    queryFn: () => apiFetch<CheckoutSession>(`/payments/session?session_id=${sessionId}`),
    enabled: Boolean(sessionId),
    retry: false,
  });

  return (
    <FadeIn className="flex flex-col items-center gap-6 py-16 text-center">
      <span className="text-[var(--g-color-text-positive)]">
        <Icon data={CircleCheckFill} size={64} />
      </span>
      <div>
        <h2>Payment successful</h2>
        <p className="mx-auto mt-2 max-w-md text-sm opacity-70">
          {session?.status === "completed"
            ? `${formatNumber(session.credits)} credits have been added to your wallet` +
              (user ? ` — your balance is now ${formatCredits(user.credits)}.` : ".")
            : "Your credits have been added to your wallet."}{" "}
          The receipt is in your payment history.
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
