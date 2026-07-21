"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Icon } from "@gravity-ui/uikit";
import { Layers, TrashBin } from "@gravity-ui/icons";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatDate, formatNumber } from "@/lib/format";
import type { Campaign } from "@/types";

/** Every campaign on the platform — admins can delete any of them. */
export function ManageCampaignsTable() {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<Campaign | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["campaigns", "all"],
    queryFn: () => apiFetch<Campaign[]>("/campaigns/all"),
  });

  const remove = useMutation({
    mutationFn: (c: Campaign) => apiFetch(`/campaigns/${c.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setDeleting(null);
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
            href={`/campaigns/${row.id}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            {row.title}
          </Link>
          <p className="text-xs opacity-60">
            <span className="capitalize">{row.category}</span> · by {row.creatorName}
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
      sortValue: (row) => row.amount_raised,
      render: (row) => (
        <span>
          {formatNumber(row.amount_raised)} / {formatNumber(row.funding_goal)}
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

  if (isPending || !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <>
      <DataTable
        columns={columns}
        rows={data}
        rowKey={(row) => row.id}
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
            ? `"${deleting.title}" by ${deleting.creatorName} will be removed permanently. Every approved contribution is refunded to its supporter and everyone involved is notified.`
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
