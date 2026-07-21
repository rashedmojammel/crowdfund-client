"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Icon, Label } from "@gravity-ui/uikit";
import { Ban, Flag, TrashBin, Xmark } from "@gravity-ui/icons";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
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

  const { data, isPending } = useQuery({
    queryKey: ["reports"],
    queryFn: () => apiFetch<Report[]>("/reports"),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaign"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const suspend = useMutation({
    mutationFn: async (report: Report) => {
      await apiFetch(`/campaigns/${report.campaignId}/suspend`, { method: "PATCH" });
      await apiFetch(`/reports/${report.id}`, {
        method: "PATCH",
        body: { status: "resolved" },
      });
    },
    onSuccess: () => {
      invalidate();
      setConfirming(null);
    },
  });

  const removeCampaign = useMutation({
    mutationFn: async (report: Report) => {
      await apiFetch(`/campaigns/${report.campaignId}`, { method: "DELETE" });
      await apiFetch(`/reports/${report.id}`, {
        method: "PATCH",
        body: { status: "resolved" },
      });
    },
    onSuccess: () => {
      invalidate();
      setConfirming(null);
    },
  });

  const dismiss = useMutation({
    mutationFn: (report: Report) =>
      apiFetch(`/reports/${report.id}`, { method: "PATCH", body: { status: "dismissed" } }),
    onSuccess: invalidate,
  });

  const columns: Array<DataTableColumn<Report>> = [
    {
      key: "campaign",
      title: "Campaign",
      render: (row) => (
        <Link
          href={`/campaigns/${row.campaignId}`}
          className="font-medium underline-offset-4 hover:underline"
        >
          {row.campaignTitle}
        </Link>
      ),
    },
    {
      key: "report",
      title: "Report",
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-medium">{row.reason}</p>
          <p className="line-clamp-2 text-xs opacity-60">{row.details}</p>
        </div>
      ),
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
              aria-label={`Suspend ${row.campaignTitle}`}
              onClick={() => setConfirming({ report: row, action: "suspend" })}
            >
              <Icon data={Ban} size={16} />
            </Button>
            <Button
              view="flat-danger"
              size="s"
              title="Delete campaign"
              aria-label={`Delete ${row.campaignTitle}`}
              onClick={() => setConfirming({ report: row, action: "delete" })}
            >
              <Icon data={TrashBin} size={16} />
            </Button>
            <Button
              view="flat"
              size="s"
              title="Dismiss report"
              aria-label={`Dismiss report on ${row.campaignTitle}`}
              loading={dismiss.isPending && dismiss.variables?.id === row.id}
              onClick={() => dismiss.mutate(row)}
            >
              <Icon data={Xmark} size={16} />
            </Button>
          </span>
        ) : null,
    },
  ];

  if (isPending || !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  const isSuspend = confirming?.action === "suspend";

  return (
    <>
      <DataTable
        columns={columns}
        rows={data}
        rowKey={(row) => row.id}
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
              ? `"${confirming.report.campaignTitle}" stops accepting contributions and the creator is notified. The report is marked resolved.`
              : `"${confirming.report.campaignTitle}" is removed permanently and approved backers are refunded. The report is marked resolved.`
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
