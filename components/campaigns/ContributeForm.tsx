"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Icon, Skeleton, TextInput } from "@gravity-ui/uikit";
import { Lock } from "@gravity-ui/icons";
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
      <div className="flex flex-col items-center gap-4 rounded-xl bg-[var(--g-color-base-generic)] p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--g-color-base-float)]">
          <Icon data={Lock} size={22} />
        </span>
        <div>
          <h4>Log in to contribute</h4>
          <p className="mt-2 text-sm opacity-70">
            Contributions come from your credit wallet, so you&rsquo;ll need an account
            first. New supporters start with a 50-credit bonus.
          </p>
        </div>
        <Pressable className="w-full">
          <Button view="action" size="l" width="max" href="/login">
            Log in
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
      <Alert
        theme="info"
        title="Supporters only"
        message={`You're signed in as a ${user.role}. Only supporter accounts can contribute credits to campaigns.`}
      />
    );
  }

  if (campaign.status !== "approved") {
    return (
      <Alert
        theme="warning"
        title="Not accepting contributions"
        message="This campaign isn't live right now, so it can't accept contributions."
      />
    );
  }

  if (new Date(campaign.deadline).getTime() < renderedAt) {
    return (
      <Alert
        theme="warning"
        title="Campaign ended"
        message="This campaign's deadline has passed. Explore other live campaigns to keep supporting."
      />
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
          <Alert
            theme="success"
            title="Contribution sent for review"
            message="The creator will review your contribution. You'll get a notification either way — if it's rejected, your credits come straight back."
          />
        </div>
      ) : null}
      {formError ? <Alert theme="danger" message={formError} /> : null}

      <Controller
        control={control}
        name="amount"
        render={({ field, fieldState }) => (
          <FormField label="Amount (credits)" htmlFor="contribute-amount" required>
            <TextInput
              id="contribute-amount"
              size="l"
              type="text"
              controlProps={{ inputMode: "numeric" }}
              placeholder="100"
              value={field.value}
              onUpdate={field.onChange}
              onBlur={field.onBlur}
              validationState={fieldState.error ? "invalid" : undefined}
              errorMessage={fieldState.error?.message}
            />
          </FormField>
        )}
      />

      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            size="m"
            view="outlined"
            onClick={() => setValue("amount", String(amount), { shouldValidate: true })}
          >
            {amount}
          </Button>
        ))}
      </div>

      <p className="text-sm opacity-70">Wallet balance: {formatCredits(user.credits)}</p>

      <Pressable>
        <Button type="submit" view="action" size="l" width="max" loading={isSubmitting}>
          Contribute
        </Button>
      </Pressable>
    </form>
  );
}
