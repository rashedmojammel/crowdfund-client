"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Icon } from "@gravity-ui/uikit";
import { Layers, TrashBin } from "@gravity-ui/icons";
import { toast } from "sonner";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { isRenderableCampaign } from "@/lib/campaign-guards";
import { formatDate, formatNumber } from "@/lib/format";
import type { Campaign } from "@/types";

/** Every campaign on the platform — admins can delete any of them. */
export function ManageCampaignsTable() {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<Campaign | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["campaigns", "all"],
    queryFn: () => apiFetch<{ campaigns: Campaign[] }>("/campaigns/all"),
  });

  const remove = useMutation({
    mutationFn: (c: Campaign) => apiFetch(`/campaigns/${c._id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setDeleting(null);
      toast.success("Campaign deleted.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't delete this campaign");
    },
  });

  const columns: Array<DataTableColumn<Campaign>> = [
    {
      key: "campaign",
      title: "Campaign",
      sortable: true,
      sortValue: (row) => row.title,
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
      key: "status",
      title: "Status",
      render: (row) => <CampaignStatusBadge status={row.status} />,
    },
    {
      key: "raised",
      title: "Raised / Goal",
      align: "right",
      sortable: true,
      sortValue: (row) => row.amountRaised,
      render: (row) => (
        <span>
          {formatNumber(row.amountRaised)} / {formatNumber(row.fundingGoal)}
        </span>
      ),
    },
    {
      key: "deadline",
      title: "Deadline",
      sortable: true,
      sortValue: (row) => row.deadline,
      render: (row) => formatDate(row.deadline),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      render: (row) => (
        <Button
          view="flat-danger"
          size="s"
          title="Delete campaign"
          aria-label={`Delete ${row.title}`}
          onClick={() => setDeleting(row)}
        >
          <Icon data={TrashBin} size={16} />
        </Button>
      ),
    },
  ];

  if (isError) {
    return (
      <Alert
        theme="danger"
        title="Couldn't load campaigns"
        message="Something went wrong while fetching this."
        actions={<Alert.Action onClick={() => refetch()}>Try again</Alert.Action>}
      />
    );
  }

  if (isPending || !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  // The database still has a handful of legacy-schema documents (see
  // lib/campaign-guards.ts) — drop them rather than crash the table.
  const campaigns = data.campaigns.filter(isRenderableCampaign);

  return (
    <>
      <DataTable
        columns={columns}
        rows={campaigns}
        rowKey={(row) => row._id}
        emptyState={
          <EmptyState
            icon={Layers}
            title="No campaigns on the platform"
            subtitle="Campaigns appear here as soon as creators submit them."
          />
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this campaign?"
        message={
          deleting
            ? `"${deleting.title}" by ${deleting.creatorEmail} will be removed permanently. Every approved contribution is refunded to its supporter and everyone involved is notified.`
            : ""
        }
        confirmText="Delete and refund backers"
        danger
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
