"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleCheck, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/store";
import { REPORT_REASONS, reportSchema, type ReportInput } from "@/lib/validators";
import type { Campaign, Report } from "@/types";

interface ReportCampaignButtonProps {
  campaign: Campaign;
}

/** Flat flag button under the contribute card — opens the report modal. */
export function ReportCampaignButton({ campaign }: ReportCampaignButtonProps) {
  const user = useSessionStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: "Suspected scam", details: "" },
  });

  const report = useMutation({
    // The real server takes a single free-text `reason` (10-500 chars, no
    // `details` field) — fold the dropdown reason and the details textarea
    // together rather than changing the two-field form.
    mutationFn: (values: ReportInput) =>
      apiFetch<{ report: Report }>("/reports", {
        method: "POST",
        body: {
          campaignId: campaign._id,
          reason: `${values.reason}: ${values.details}`.slice(0, 500),
        },
      }),
    onSuccess: () => {
      setSubmitted(true);
      reset();
      toast.success("Report submitted. Our team will review it.");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Couldn't file the report";
      setFormError(message);
      toast.error(message);
    },
  });

  // Creators don't report their own campaign.
  if (user && user.email === campaign.creatorEmail) return null;

  const close = () => {
    setOpen(false);
    setSubmitted(false);
    setFormError(null);
  };

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    report.mutate(values);
  });

  return (
    <>
      <Button
        variant="ghost"
        className="w-full text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Flag aria-hidden="true" />
        Report this campaign
      </Button>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report &ldquo;{campaign.title}&rdquo;</DialogTitle>
          </DialogHeader>

          {!user ? (
            <Alert>
              <Flag />
              <AlertTitle>Log in to report</AlertTitle>
              <AlertDescription>
                Reports are tied to an account so our team can follow up.
                <Button size="sm" className="mt-2 w-fit" asChild>
                  <a href="/login">Log in</a>
                </Button>
              </AlertDescription>
            </Alert>
          ) : submitted ? (
            <div role="status">
              <Alert variant="success">
                <CircleCheck />
                <AlertTitle>Report filed</AlertTitle>
                <AlertDescription>
                  Thanks — the review team has been notified and will look into this
                  campaign.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <form
              id="report-campaign-form"
              onSubmit={onSubmit}
              noValidate
              className="flex flex-col gap-4"
            >
              {formError ? (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <Controller
                control={control}
                name="reason"
                render={({ field, fieldState }) => (
                  <FormField label="Reason" required error={fieldState.error?.message}>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={fieldState.error ? true : undefined}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_REASONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="details"
                render={({ field, fieldState }) => (
                  <FormField
                    label="What did you notice?"
                    htmlFor="report-details"
                    required
                    error={fieldState.error?.message}
                  >
                    <Textarea
                      id="report-details"
                      rows={4}
                      placeholder="Links, inconsistencies, anything that helps the review team verify the problem."
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.error ? true : undefined}
                    />
                  </FormField>
                )}
              />
            </form>
          )}

          <DialogFooter>
            {user && !submitted ? (
              <>
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="report-campaign-form"
                  variant="destructive"
                  disabled={isSubmitting || report.isPending}
                >
                  {isSubmitting || report.isPending ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : null}
                  File report
                </Button>
              </>
            ) : (
              <Button type="button" onClick={close}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
