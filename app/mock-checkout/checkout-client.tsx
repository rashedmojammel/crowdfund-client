"use client";

// Stand-in for Stripe's hosted checkout page, reached by the same redirect
// the real integration will use. Delete this route once the server creates
// real Stripe Checkout Sessions.

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Label } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { Pressable } from "@/components/animations/Pressable";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatUsd } from "@/lib/format";
import type { CheckoutSession, Payment } from "@/types";

export function CheckoutClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionId = useSearchParams().get("session_id");

  const { data: session, isPending, isError } = useQuery({
    queryKey: ["checkout-session", sessionId],
    queryFn: () => apiFetch<CheckoutSession>(`/payments/session?session_id=${sessionId}`),
    enabled: Boolean(sessionId),
    retry: false,
  });

  const pay = useMutation({
    mutationFn: () =>
      apiFetch<Payment>("/payments/confirm", { method: "POST", body: { sessionId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["checkout-session", sessionId] });
      router.push(`/dashboard/purchase-credit/success?session_id=${sessionId}`);
    },
  });

  const cancel = useMutation({
    mutationFn: () =>
      apiFetch<CheckoutSession>("/payments/cancel", { method: "POST", body: { sessionId } }),
    onSuccess: () => router.push("/dashboard/purchase-credit/cancel"),
  });

  if (!sessionId || isError) {
    return (
      <Alert
        theme="warning"
        title="Checkout session not found"
        message="This checkout link is invalid or has expired (mock sessions don't survive a full page reload). Start the purchase again."
        actions={<Alert.Action href="/dashboard/purchase-credit">Back to packages</Alert.Action>}
      />
    );
  }

  if (isPending || !session) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (session.status === "completed") {
    return (
      <Alert
        theme="success"
        title="Already paid"
        message="This checkout session has already been completed."
        actions={
          <Alert.Action href={`/dashboard/purchase-credit/success?session_id=${session.id}`}>
            View confirmation
          </Alert.Action>
        }
      />
    );
  }

  return (
    <FadeIn className="card-elevate flex flex-col gap-6 rounded-xl bg-[var(--g-color-base-float)] p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-lg font-bold">
          Fund<span className="text-[var(--g-color-text-brand)]">Spark</span>
        </span>
        <Label theme="warning">Test mode</Label>
      </div>

      <dl className="flex flex-col gap-3 border-y border-[var(--g-color-line-generic)] py-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="opacity-70">Credit package</dt>
          <dd className="font-semibold">{formatCredits(session.credits)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="opacity-70">Rate</dt>
          <dd>10 credits = $1</dd>
        </div>
        <div className="flex items-center justify-between gap-4 text-base">
          <dt className="font-medium">Total due</dt>
          <dd className="font-bold">{formatUsd(session.amountUsd)}</dd>
        </div>
      </dl>

      <p className="text-sm opacity-60">
        Simulated Stripe Checkout for development — no card required and no real charge is
        made.
      </p>

      <div className="flex flex-col gap-3">
        <Pressable>
          <Button
            view="action"
            size="xl"
            width="max"
            loading={pay.isPending}
            onClick={() => pay.mutate()}
          >
            Pay {formatUsd(session.amountUsd)}
          </Button>
        </Pressable>
        <Button
          view="flat"
          size="l"
          width="max"
          loading={cancel.isPending}
          onClick={() => cancel.mutate()}
        >
          Cancel and return
        </Button>
      </div>
    </FadeIn>
  );
}
