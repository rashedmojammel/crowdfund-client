"use client";

// Post-creation edits are limited to title / story / reward — goal, category,
// deadline, and cover are locked once a campaign is submitted.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, TextArea, TextInput } from "@gravity-ui/uikit";
import { Pressable } from "@/components/animations/Pressable";
import { FormField } from "@/components/forms/FormField";
import { apiFetch } from "@/lib/api-client";
import { updateCampaignSchema, type UpdateCampaignInput } from "@/lib/validators";
import type { Campaign } from "@/types";

interface UpdateCampaignFormProps {
  campaign: Campaign;
}

export function UpdateCampaignForm({ campaign }: UpdateCampaignFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<UpdateCampaignInput>({
    resolver: zodResolver(updateCampaignSchema),
    defaultValues: {
      title: campaign.title,
      story: campaign.story,
      reward: campaign.reward,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await apiFetch<Campaign>(`/campaigns/${campaign.id}`, {
        method: "PATCH",
        body: values,
      });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", campaign.id] });
      router.push("/dashboard/my-campaigns");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Couldn't save changes");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {formError ? <Alert theme="danger" message={formError} /> : null}

      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label="Campaign title" htmlFor="edit-title" required>
            <TextInput
              id="edit-title"
              size="l"
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
        name="story"
        render={({ field, fieldState }) => (
          <FormField label="Story" htmlFor="edit-story" required>
            <TextArea
              id="edit-story"
              size="l"
              rows={8}
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
          <FormField label="Backer reward" htmlFor="edit-reward" required>
            <TextArea
              id="edit-reward"
              size="l"
              rows={3}
              value={field.value}
              onUpdate={field.onChange}
              onBlur={field.onBlur}
              validationState={fieldState.error ? "invalid" : undefined}
              errorMessage={fieldState.error?.message}
            />
          </FormField>
        )}
      />

      <div className="flex items-center gap-3">
        <Pressable className="grow">
          <Button
            type="submit"
            view="action"
            size="l"
            width="max"
            loading={isSubmitting}
            disabled={!isDirty}
          >
            Save changes
          </Button>
        </Pressable>
        <Button view="flat" size="l" href="/dashboard/my-campaigns">
          Cancel
        </Button>
      </div>
    </form>
  );
}
