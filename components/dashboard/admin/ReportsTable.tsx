"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Icon, Label } from "@gravity-ui/uikit";
import { Ban, Flag, TrashBin, Xmark } from "@gravity-ui/icons";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Report, ReportStatus } from "@/types";

const statusTheme: Record<ReportStatus, "warning" | "success" | "normal"> = {
  open: "warning",
  resolved: "success",
  dismissed: "normal",
};

type PendingAction = { report: Report; action: "suspend" | "delete" } | null;

/** Open reports first; resolving actions suspend or delete the campaign. */
export function ReportsTable() {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<PendingAction>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["reports"],
    queryFn: () => apiFetch<{ reports: Report[] }>("/reports"),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaign"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  // The real PATCH /reports/:id takes a single { action } — suspend_campaign
  // and delete_campaign act on the campaign AND resolve the report
  // atomically server-side, replacing what used to be two separate calls.
  const suspend = useMutation({
    mutationFn: (report: Report) =>
      apiFetch(`/reports/${report._id}`, {
        method: "PATCH",
        body: { action: "suspend_campaign" },
      }),
    onSuccess: () => {
      invalidate();
      setConfirming(null);
    },
  });

  const removeCampaign = useMutation({
    mutationFn: (report: Report) =>
      apiFetch(`/reports/${report._id}`, {
        method: "PATCH",
        body: { action: "delete_campaign" },
      }),
    onSuccess: () => {
      invalidate();
      setConfirming(null);
    },
  });

  const dismiss = useMutation({
    mutationFn: (report: Report) =>
      apiFetch(`/reports/${report._id}`, { method: "PATCH", body: { action: "dismiss" } }),
    onSuccess: invalidate,
  });

  const columns: Array<DataTableColumn<Report>> = [
    {
      key: "campaign",
      title: "Campaign",
      // No campaignTitle on the real Report document — only campaignId.
      render: (row) => (
        <Link
          href={`/campaigns/${row.campaignId}`}
          className="font-medium underline-offset-4 hover:underline"
        >
          {row.campaignId}
        </Link>
      ),
    },
    {
      key: "report",
      title: "Report",
      // The real Report has a single free-text `reason` field, no separate
      // `details` — ReportCampaignButton folds both into it on submit.
      render: (row) => <p className="line-clamp-2 max-w-xs text-sm">{row.reason}</p>,
    },
    {
      key: "reporter",
      title: "Reporter",
      render: (row) => <span className="text-xs">{row.reporterEmail}</span>,
    },
    {
      key: "date",
      title: "Filed",
      sortable: true,
      sortValue: (row) => row.createdAt,
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => (
        <Label theme={statusTheme[row.status]} className="capitalize">
          {row.status}
        </Label>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      render: (row) =>
        row.status === "open" ? (
          <span className="inline-flex items-center gap-1">
            <Button
              view="flat-warning"
              size="s"
              title="Suspend campaign"
              aria-label={`Suspend report on campaign ${row.campaignId}`}
              onClick={() => setConfirming({ report: row, action: "suspend" })}
            >
              <Icon data={Ban} size={16} />
            </Button>
            <Button
              view="flat-danger"
              size="s"
              title="Delete campaign"
              aria-label={`Delete campaign ${row.campaignId}`}
              onClick={() => setConfirming({ report: row, action: "delete" })}
            >
              <Icon data={TrashBin} size={16} />
            </Button>
            <Button
              view="flat"
              size="s"
              title="Dismiss report"
              aria-label={`Dismiss report on campaign ${row.campaignId}`}
              loading={dismiss.isPending && dismiss.variables?._id === row._id}
              onClick={() => dismiss.mutate(row)}
            >
              <Icon data={Xmark} size={16} />
            </Button>
          </span>
        ) : null,
    },
  ];

  if (isError) {
    return (
      <Alert
        theme="danger"
        title="Couldn't load reports"
        message="Something went wrong while fetching this."
        actions={<Alert.Action onClick={() => refetch()}>Try again</Alert.Action>}
      />
    );
  }

  if (isPending || !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  const isSuspend = confirming?.action === "suspend";

  return (
    <>
      <DataTable
        columns={columns}
        rows={data.reports}
        rowKey={(row) => row._id}
        emptyState={
          <EmptyState
            icon={Flag}
            title="No reports"
            subtitle="When supporters flag a campaign, the report lands here for review."
          />
        }
      />

      <ConfirmDialog
        open={Boolean(confirming)}
        title={isSuspend ? "Suspend this campaign?" : "Delete this campaign?"}
        message={
          confirming
            ? isSuspend
              ? `Campaign ${confirming.report.campaignId} stops accepting contributions and the creator is notified. The report is marked resolved.`
              : `Campaign ${confirming.report.campaignId} is removed permanently and approved backers are refunded. The report is marked resolved.`
            : ""
        }
        confirmText={isSuspend ? "Suspend campaign" : "Delete and refund backers"}
        danger
        loading={suspend.isPending || removeCampaign.isPending}
        onConfirm={() => {
          if (!confirming) return;
          if (isSuspend) suspend.mutate(confirming.report);
          else removeCampaign.mutate(confirming.report);
        }}
        onClose={() => setConfirming(null)}
      />
    </>
  );
}
