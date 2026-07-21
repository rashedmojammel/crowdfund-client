"use client";

// Post-creation edits are limited to title / story / reward — goal, category,
// deadline, and cover are locked once a campaign is submitted.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      {formError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField
            label="Campaign title"
            htmlFor="edit-title"
            required
            error={fieldState.error?.message}
          >
            <Input
              id="edit-title"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="story"
        render={({ field, fieldState }) => (
          <FormField
            label="Story"
            htmlFor="edit-story"
            required
            error={fieldState.error?.message}
          >
            <Textarea
              id="edit-story"
              rows={8}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="reward"
        render={({ field, fieldState }) => (
          <FormField
            label="Backer reward"
            htmlFor="edit-reward"
            required
            error={fieldState.error?.message}
          >
            <Textarea
              id="edit-reward"
              rows={3}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
          </FormField>
        )}
      />

      <div className="flex items-center gap-3">
        <Pressable className="grow">
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            Save changes
          </Button>
        </Pressable>
        <Button variant="ghost" size="lg" asChild>
          <Link href="/dashboard/my-campaigns">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
