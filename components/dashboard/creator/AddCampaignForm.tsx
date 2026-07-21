"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Select, Text, TextArea, TextInput } from "@gravity-ui/uikit";
import { Pressable } from "@/components/animations/Pressable";
import { FormField } from "@/components/forms/FormField";
import { ImageUploader } from "@/components/forms/ImageUploader";
import { apiFetch } from "@/lib/api-client";
import { CATEGORIES } from "@/lib/constants";
import { campaignSchema, type CampaignInput } from "@/lib/validators";
import type { Campaign } from "@/types";

export function AddCampaignForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      category: "community",
      story: "",
      reward: "",
      image: "",
      funding_goal: "",
      deadline: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await apiFetch<Campaign>("/campaigns", {
        method: "POST",
        body: {
          ...values,
          funding_goal: Number(values.funding_goal),
          deadline: new Date(`${values.deadline}T23:59:59`).toISOString(),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      router.push("/dashboard/my-campaigns");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Couldn't submit the campaign");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {formError ? <Alert theme="danger" message={formError} /> : null}

      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label="Campaign title" htmlFor="campaign-title" required>
            <TextInput
              id="campaign-title"
              size="l"
              placeholder="SolarBridge: Portable Solar Kits for Rural Clinics"
              value={field.value}
              onUpdate={field.onChange}
              onBlur={field.onBlur}
              validationState={fieldState.error ? "invalid" : undefined}
              errorMessage={fieldState.error?.message}
            />
          </FormField>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <FormField label="Category" required>
              <Select
                size="l"
                width="max"
                value={[field.value]}
                onUpdate={(v) => field.onChange(v[0])}
                validationState={fieldState.error ? "invalid" : undefined}
                errorMessage={fieldState.error?.message}
                options={CATEGORIES.map((c) => ({ value: c.value, content: c.label }))}
              />
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="funding_goal"
          render={({ field, fieldState }) => (
            <FormField label="Funding goal (credits)" htmlFor="campaign-goal" required>
              <TextInput
                id="campaign-goal"
                size="l"
                type="text"
                controlProps={{ inputMode: "numeric" }}
                placeholder="50000"
                value={field.value}
                onUpdate={field.onChange}
                onBlur={field.onBlur}
                validationState={fieldState.error ? "invalid" : undefined}
                errorMessage={fieldState.error?.message}
              />
            </FormField>
          )}
        />
      </div>

      <Controller
        control={control}
        name="deadline"
        render={({ field, fieldState }) => (
          <FormField label="Deadline" htmlFor="campaign-deadline" required>
            {/* Native date input — Gravity's TextInput has no date type. */}
            <input
              id="campaign-deadline"
              type="date"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
              className="h-9 w-full rounded-lg border border-[var(--g-color-line-generic)] bg-transparent px-3 text-sm"
            />
            {fieldState.error ? (
              <Text color="danger" variant="caption-2">
                {fieldState.error.message}
              </Text>
            ) : null}
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="image"
        render={({ field, fieldState }) => (
          <FormField label="Cover image" required>
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              errorMessage={fieldState.error?.message}
              disabled={isSubmitting}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="story"
        render={({ field, fieldState }) => (
          <FormField label="Story" htmlFor="campaign-story" required>
            <TextArea
              id="campaign-story"
              size="l"
              rows={8}
              placeholder="What are you building, why does it matter, and how will the funds be used?"
              value={field.value}
              onUpdate={field.onChange}
              onBlur={field.onBlur}
              validationState={fieldState.error ? "invalid" : undefined}
              errorMessage={fieldState.error?.message}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="reward"
        render={({ field, fieldState }) => (
          <FormField label="Backer reward" htmlFor="campaign-reward" required>
            <TextArea
              id="campaign-reward"
              size="l"
              rows={3}
              placeholder="What do backers get in return? Updates, perks, acknowledgements…"
              value={field.value}
              onUpdate={field.onChange}
              onBlur={field.onBlur}
              validationState={fieldState.error ? "invalid" : undefined}
              errorMessage={fieldState.error?.message}
            />
          </FormField>
        )}
      />

      <Alert
        theme="info"
        message="New campaigns go to the admin team for review and appear publicly once approved."
      />

      <Pressable>
        <Button type="submit" view="action" size="l" width="max" loading={isSubmitting}>
          Submit campaign for review
        </Button>
      </Pressable>
    </form>
  );
}
