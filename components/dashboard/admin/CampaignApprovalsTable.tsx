"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Icon } from "@gravity-ui/uikit";
import { Check, CircleCheck, Xmark } from "@gravity-ui/icons";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { isRenderableCampaign } from "@/lib/campaign-guards";
import { formatCredits, formatDate } from "@/lib/format";
import type { Campaign } from "@/types";

/** Campaigns awaiting admin review, with Approve / Reject actions. */
export function CampaignApprovalsTable() {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<Campaign | null>(null);

  const queryKey = ["campaigns", "all"] as const;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => apiFetch<{ campaigns: Campaign[] }>("/campaigns/all"),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaign"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  /** Optimistically patches the row's status; returns the prior cache for rollback. */
  const applyOptimisticStatus = (id: string, status: Campaign["status"]) => {
    const previous = queryClient.getQueryData<{ campaigns: Campaign[] }>(queryKey);
    queryClient.setQueryData<{ campaigns: Campaign[] }>(queryKey, (old) =>
      old
        ? { campaigns: old.campaigns.map((c) => (c._id === id ? { ...c, status } : c)) }
        : old
    );
    return previous;
  };

  const approve = useMutation({
    mutationFn: (c: Campaign) =>
      apiFetch<{ campaign: Campaign }>(`/campaigns/${c._id}/approve`, { method: "PATCH" }),
    onMutate: async (c) => {
      await queryClient.cancelQueries({ queryKey });
      return { previous: applyOptimisticStatus(c._id, "approved") };
    },
    onSuccess: () => {
      invalidate();
      toast.success("Campaign approved.");
    },
    onError: (error, _c, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error(error instanceof Error ? error.message : "Couldn't approve this campaign");
    },
  });

  const reject = useMutation({
    mutationFn: (c: Campaign) =>
      apiFetch<{ campaign: Campaign }>(`/campaigns/${c._id}/reject`, { method: "PATCH" }),
    onMutate: async (c) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = applyOptimisticStatus(c._id, "rejected");
      setRejecting(null);
      return { previous };
    },
    onSuccess: () => {
      invalidate();
      toast.success("Campaign rejected.");
    },
    onError: (error, _c, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error(error instanceof Error ? error.message : "Couldn't reject this campaign");
    },
  });

  const columns: Array<DataTableColumn<Campaign>> = [
    {
      key: "campaign",
      title: "Campaign",
      render: (row) => (
        <div>
          <Link
            href={`/campaigns/${row._id}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            {row.title}
          </Link>
          <p className="text-xs opacity-60">
            <span className="capitalize">{row.category}</span> · by {row.creatorEmail}
          </p>
        </div>
      ),
    },
    {
      key: "goal",
      title: "Goal",
      align: "right",
      render: (row) => formatCredits(row.fundingGoal),
    },
    {
      key: "deadline",
      title: "Deadline",
      render: (row) => formatDate(row.deadline),
    },
    {
      key: "submitted",
      title: "Submitted",
      sortable: true,
      sortValue: (row) => row.createdAt,
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      render: (row) => (
        <span className="inline-flex items-center gap-1">
          <Button
            view="flat-success"
            size="s"
            title="Approve and take live"
            aria-label={`Approve ${row.title}`}
            loading={approve.isPending && approve.variables?._id === row._id}
            onClick={() => approve.mutate(row)}
          >
            <Icon data={Check} size={16} />
          </Button>
          <Button
            view="flat-danger"
            size="s"
            title="Reject"
            aria-label={`Reject ${row.title}`}
            onClick={() => setRejecting(row)}
          >
            <Icon data={Xmark} size={16} />
          </Button>
        </span>
      ),
    },
  ];

  if (isError) {
    return (
      <Alert
        theme="danger"
        title="Couldn't load campaign approvals"
        message="Something went wrong while fetching this."
        actions={<Alert.Action onClick={() => refetch()}>Try again</Alert.Action>}
      />
    );
  }

  if (isPending || !data) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  // The database still has a handful of legacy-schema documents (see
  // lib/campaign-guards.ts) — drop them rather than crash the table.
  const pending = data.campaigns
    .filter(isRenderableCampaign)
    .filter((c) => c.status === "pending");

  return (
    <>
      <DataTable
        columns={columns}
        rows={pending}
        rowKey={(row) => row._id}
        emptyState={
          <EmptyState
            icon={CircleCheck}
            title="No campaigns waiting"
            subtitle="New submissions land here for review before they can accept contributions."
          />
        }
      />

      <ConfirmDialog
        open={Boolean(rejecting)}
        title="Reject this campaign?"
        message={
          rejecting
            ? `"${rejecting.title}" won't go live and ${rejecting.creatorEmail} will be notified with guidance to revise and resubmit.`
            : ""
        }
        confirmText="Reject campaign"
        danger
        loading={reject.isPending}
        onConfirm={() => rejecting && reject.mutate(rejecting)}
        onClose={() => setRejecting(null)}
      />
    </>
  );
}
