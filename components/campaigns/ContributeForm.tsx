"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, Info, Lock, Loader2, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pressable } from "@/components/animations/Pressable";
import { FormField } from "@/components/forms/FormField";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/store";
import { formatCredits } from "@/lib/format";
import { contributionSchema, type ContributionInput } from "@/lib/validators";
import type { Campaign, Contribution } from "@/types";

const QUICK_AMOUNTS = [50, 100, 250, 500];

interface ContributeFormProps {
  campaign: Campaign;
}

export function ContributeForm({ campaign }: ContributeFormProps) {
  const user = useSessionStore((s) => s.user);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  // Captured once per mount — deadline comparison must be render-pure.
  const [renderedAt] = useState(() => Date.now());

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<ContributionInput>({
    resolver: zodResolver(contributionSchema),
    defaultValues: { amount: "" },
  });

  const mutation = useMutation({
    mutationFn: (amount: number) =>
      apiFetch<Contribution>("/contributions", {
        method: "POST",
        body: { campaignId: campaign.id, amount },
      }),
    onSuccess: () => {
      setSubmitted(true);
      reset();
      queryClient.invalidateQueries({ queryKey: ["campaign", campaign.id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  // Wait for session hydration — same size as the form, no layout shift.
  if (!hasHydrated) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  // Login gate for visitors.
  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-muted p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
          <Lock className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h4>Log in to contribute</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Contributions come from your credit wallet, so you&rsquo;ll need an account
            first. New supporters start with a 50-credit bonus.
          </p>
        </div>
        <Pressable className="w-full">
          <Button size="lg" className="w-full" asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </Pressable>
        <Link href="/register" className="text-sm font-medium underline underline-offset-4">
          Create an account
        </Link>
      </div>
    );
  }

  if (user.role !== "supporter") {
    return (
      <Alert variant="info">
        <Info />
        <AlertTitle>Supporters only</AlertTitle>
        <AlertDescription>
          You&rsquo;re signed in as a {user.role}. Only supporter accounts can contribute
          credits to campaigns.
        </AlertDescription>
      </Alert>
    );
  }

  if (campaign.status !== "approved") {
    return (
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Not accepting contributions</AlertTitle>
        <AlertDescription>
          This campaign isn&rsquo;t live right now, so it can&rsquo;t accept contributions.
        </AlertDescription>
      </Alert>
    );
  }

  if (new Date(campaign.deadline).getTime() < renderedAt) {
    return (
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Campaign ended</AlertTitle>
        <AlertDescription>
          This campaign&rsquo;s deadline has passed. Explore other live campaigns to keep
          supporting.
        </AlertDescription>
      </Alert>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSubmitted(false);
    const amount = Number(values.amount);
    if (amount > user.credits) {
      setFormError(
        `You have ${formatCredits(user.credits)} — top up your wallet to contribute ${formatCredits(amount)}.`
      );
      return;
    }
    try {
      await mutation.mutateAsync(amount);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Contribution failed — try again");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {submitted ? (
        <div role="status">
          <Alert variant="success">
            <CircleCheck />
            <AlertTitle>Contribution sent for review</AlertTitle>
            <AlertDescription>
              The creator will review your contribution. You&rsquo;ll get a notification
              either way — if it&rsquo;s rejected, your credits come straight back.
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      {formError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <Controller
        control={control}
        name="amount"
        render={({ field, fieldState }) => (
          <FormField
            label="Amount (credits)"
            htmlFor="contribute-amount"
            required
            error={fieldState.error?.message}
          >
            <Input
              id="contribute-amount"
              type="text"
              inputMode="numeric"
              placeholder="100"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
          </FormField>
        )}
      />

      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setValue("amount", String(amount), { shouldValidate: true })}
          >
            {amount}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Wallet balance: {formatCredits(user.credits)}
      </p>

      <Pressable>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          Contribute
        </Button>
      </Pressable>
    </form>
  );
}
