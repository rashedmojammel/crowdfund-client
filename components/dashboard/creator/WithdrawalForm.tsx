"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CircleCheck, Loader2, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pressable } from "@/components/animations/Pressable";
import { FormField } from "@/components/forms/FormField";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatUsd } from "@/lib/format";
import { CREDITS_PER_USD_WITHDRAW, MIN_WITHDRAWAL_CREDITS } from "@/lib/utils";
import { withdrawalSchema, type WithdrawalInput } from "@/lib/validators";
import type { Withdrawal } from "@/types";

const PAYOUT_METHODS = ["bKash", "Nagad", "Bank Transfer", "PayPal"] as const;

interface WithdrawalFormProps {
  /** Raised credits not yet requested for withdrawal. */
  availableCredits: number;
}

export function WithdrawalForm({ availableCredits }: WithdrawalFormProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Withdrawal | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = useForm<WithdrawalInput>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: { credits: "", paymentSystem: "bKash", accountNumber: "" },
  });

  // Live USD conversion under the credits input: 20 credits = $1.
  const creditsValue = useWatch({ control, name: "credits" });
  const usdPreview = /^\d+$/.test(creditsValue ?? "")
    ? Number(creditsValue) / CREDITS_PER_USD_WITHDRAW
    : null;

  // Per spec: under the 200-credit minimum there is no form to submit.
  if (availableCredits < MIN_WITHDRAWAL_CREDITS) {
    return (
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Insufficient credit</AlertTitle>
        <AlertDescription>
          You need at least {MIN_WITHDRAWAL_CREDITS} raised credits to request a withdrawal.
          Available now: {formatCredits(availableCredits)}.
        </AlertDescription>
      </Alert>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSubmitted(null);
    const credits = Number(values.credits);
    if (credits > availableCredits) {
      setError("credits", {
        message: `Only ${formatCredits(availableCredits)} available to withdraw`,
      });
      return;
    }
    try {
      const withdrawal = await apiFetch<Withdrawal>("/withdrawals", {
        method: "POST",
        body: { ...values, credits },
      });
      setSubmitted(withdrawal);
      reset();
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Withdrawal request failed");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {submitted ? (
        <div role="status">
          <Alert variant="success">
            <CircleCheck />
            <AlertTitle>Withdrawal requested</AlertTitle>
            <AlertDescription>
              {formatCredits(submitted.credits)} ({formatUsd(submitted.amountUsd)}) queued for
              payout via {submitted.paymentSystem}. An admin will mark it paid.
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
        name="credits"
        render={({ field, fieldState }) => (
          <FormField
            label="Credits to withdraw"
            htmlFor="withdraw-credits"
            required
            error={fieldState.error?.message}
          >
            <Input
              id="withdraw-credits"
              type="text"
              inputMode="numeric"
              placeholder={String(MIN_WITHDRAWAL_CREDITS)}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
            <p className="text-sm text-muted-foreground">
              {usdPreview !== null
                ? `You'll receive ${formatUsd(usdPreview)} (${CREDITS_PER_USD_WITHDRAW} credits = $1)`
                : `${CREDITS_PER_USD_WITHDRAW} credits = $1 · ${formatCredits(availableCredits)} available`}
            </p>
          </FormField>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="paymentSystem"
          render={({ field, fieldState }) => (
            <FormField label="Payout method" required error={fieldState.error?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="w-full"
                  aria-invalid={fieldState.error ? true : undefined}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYOUT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="accountNumber"
          render={({ field, fieldState }) => (
            <FormField
              label="Account number"
              htmlFor="withdraw-account"
              required
              error={fieldState.error?.message}
            >
              <Input
                id="withdraw-account"
                placeholder="01712-000045"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={fieldState.error ? true : undefined}
              />
            </FormField>
          )}
        />
      </div>

      <Pressable>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          Request withdrawal
        </Button>
      </Pressable>
    </form>
  );
}
