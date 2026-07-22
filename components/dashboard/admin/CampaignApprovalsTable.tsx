"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Icon } from "@gravity-ui/uikit";
import { Check, CircleCheck, Xmark } from "@gravity-ui/icons";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatDate, formatNumber } from "@/lib/format";
import type { Campaign } from "@/types";

/** Campaigns awaiting admin review, with Approve / Reject actions. */
export function CampaignApprovalsTable() {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<Campaign | null>(null);

  // NOTE: /campaigns/all has no matching real endpoint — the server only
  // exposes the public approved-only list, the creator-scoped /mine list,
  // and single-campaign GET. There is currently no admin "every status"
  // list, so this table cannot load real data until the server adds one.
  const { data, isPending } = useQuery({
    queryKey: ["campaigns", "all"],
    queryFn: () => apiFetch<{ campaigns: Campaign[] }>("/campaigns/all"),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaign"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const approve = useMutation({
    mutationFn: (c: Campaign) =>
      apiFetch<{ campaign: Campaign }>(`/campaigns/${c._id}/approve`, { method: "PATCH" }),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: (c: Campaign) =>
      apiFetch<{ campaign: Campaign }>(`/campaigns/${c._id}/reject`, { method: "PATCH" }),
    onSuccess: () => {
      invalidate();
      setRejecting(null);
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
      render: (row) => `${formatNumber(row.fundingGoal)} credits`,
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

  if (isPending || !data) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  const pending = data.campaigns.filter((c) => c.status === "pending");

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
