"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Info, Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
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
  const [imageUploading, setImageUploading] = useState(false);

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
      coverImage: "",
      fundingGoal: "",
      deadline: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await apiFetch<{ campaign: Campaign }>("/campaigns", {
        method: "POST",
        body: {
          ...values,
          fundingGoal: Number(values.fundingGoal),
          deadline: new Date(`${values.deadline}T23:59:59`).toISOString(),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Campaign submitted for review.");
      router.push("/dashboard/my-campaigns");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Couldn't submit the campaign");
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
            htmlFor="campaign-title"
            required
            error={fieldState.error?.message}
          >
            <Input
              id="campaign-title"
              placeholder="SolarBridge: Portable Solar Kits for Rural Clinics"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
          </FormField>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <FormField label="Category" required error={fieldState.error?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="w-full"
                  aria-invalid={fieldState.error ? true : undefined}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="fundingGoal"
          render={({ field, fieldState }) => (
            <FormField
              label="Funding goal (credits)"
              htmlFor="campaign-goal"
              required
              error={fieldState.error?.message}
            >
              <Input
                id="campaign-goal"
                type="text"
                inputMode="numeric"
                placeholder="50000"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={fieldState.error ? true : undefined}
              />
            </FormField>
          )}
        />
      </div>

      <Controller
        control={control}
        name="deadline"
        render={({ field, fieldState }) => (
          <FormField
            label="Deadline"
            htmlFor="campaign-deadline"
            required
            error={fieldState.error?.message}
          >
            <Input
              id="campaign-deadline"
              type="date"
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
        name="coverImage"
        render={({ field, fieldState }) => (
          <FormField label="Cover image" required>
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              errorMessage={fieldState.error?.message}
              disabled={isSubmitting}
              onUploadingChange={setImageUploading}
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
            htmlFor="campaign-story"
            required
            error={fieldState.error?.message}
          >
            <Textarea
              id="campaign-story"
              rows={8}
              placeholder="What are you building, why does it matter, and how will the funds be used?"
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
            htmlFor="campaign-reward"
            required
            error={fieldState.error?.message}
          >
            <Textarea
              id="campaign-reward"
              rows={3}
              placeholder="What do backers get in return? Updates, perks, acknowledgements…"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
          </FormField>
        )}
      />

      <Alert variant="info">
        <Info />
        <AlertTitle>
          New campaigns go to the admin team for review and appear publicly once approved.
        </AlertTitle>
      </Alert>

      <Pressable>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || imageUploading}
        >
          {isSubmitting || imageUploading ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          {imageUploading
            ? "Uploading image…"
            : isSubmitting
              ? "Submitting…"
              : "Submit campaign for review"}
        </Button>
      </Pressable>
    </form>
  );
}
