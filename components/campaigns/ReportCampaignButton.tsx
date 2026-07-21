"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Dialog, Icon, Select, TextArea } from "@gravity-ui/uikit";
import { Flag } from "@gravity-ui/icons";
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
    mutationFn: (values: ReportInput) =>
      apiFetch<Report>("/reports", {
        method: "POST",
        body: { campaignId: campaign.id, ...values },
      }),
    onSuccess: () => {
      setSubmitted(true);
      reset();
    },
    onError: (err) =>
      setFormError(err instanceof Error ? err.message : "Couldn't file the report"),
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
      <Button view="flat-danger" size="m" width="max" onClick={() => setOpen(true)}>
        <span className="flex items-center gap-2">
          <Icon data={Flag} size={14} />
          Report this campaign
        </span>
      </Button>

      <Dialog open={open} onClose={close} size="s">
        <Dialog.Header caption={`Report "${campaign.title}"`} />
        <Dialog.Body>
          {!user ? (
            <Alert
              theme="info"
              title="Log in to report"
              message="Reports are tied to an account so our team can follow up."
              actions={<Alert.Action href="/login">Log in</Alert.Action>}
            />
          ) : submitted ? (
            <div role="status">
              <Alert
                theme="success"
                title="Report filed"
                message="Thanks — the review team has been notified and will look into this campaign."
              />
            </div>
          ) : (
            <form id="report-campaign-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              {formError ? <Alert theme="danger" message={formError} /> : null}

              <Controller
                control={control}
                name="reason"
                render={({ field, fieldState }) => (
                  <FormField label="Reason" required>
                    <Select
                      size="l"
                      width="max"
                      value={[field.value]}
                      onUpdate={(v) => field.onChange(v[0])}
                      validationState={fieldState.error ? "invalid" : undefined}
                      errorMessage={fieldState.error?.message}
                      options={REPORT_REASONS.map((r) => ({ value: r, content: r }))}
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="details"
                render={({ field, fieldState }) => (
                  <FormField label="What did you notice?" htmlFor="report-details" required>
                    <TextArea
                      id="report-details"
                      size="l"
                      rows={4}
                      placeholder="Links, inconsistencies, anything that helps the review team verify the problem."
                      value={field.value}
                      onUpdate={field.onChange}
                      onBlur={field.onBlur}
                      validationState={fieldState.error ? "invalid" : undefined}
                      errorMessage={fieldState.error?.message}
                    />
                  </FormField>
                )}
              />
            </form>
          )}
        </Dialog.Body>
        {user && !submitted ? (
          <Dialog.Footer
            textButtonApply="File report"
            textButtonCancel="Cancel"
            onClickButtonCancel={close}
            propsButtonApply={{
              view: "outlined-danger",
              loading: isSubmitting || report.isPending,
              type: "submit",
              // Submit the form inside the body from the footer button.
              extraProps: { form: "report-campaign-form" },
            }}
          />
        ) : (
          <Dialog.Footer
            textButtonApply="Close"
            onClickButtonApply={close}
            propsButtonApply={{ view: "normal" }}
          />
        )}
      </Dialog>
    </>
  );
}
