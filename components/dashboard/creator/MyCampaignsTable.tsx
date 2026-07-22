"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Icon } from "@gravity-ui/uikit";
import { CirclePlus, Pencil, TrashBin } from "@gravity-ui/icons";
import { toast } from "sonner";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { daysLeft, formatDate, formatNumber } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import type { Campaign } from "@/types";

/** The creator's campaigns, already sorted by deadline desc by the API. */
export function MyCampaignsTable() {
  const user = useSessionStore((s) => s.user);
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<Campaign | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["campaigns", "mine", user?.email],
    queryFn: () => apiFetch<{ campaigns: Campaign[] }>("/campaigns/mine"),
    enabled: Boolean(user),
  });

  const remove = useMutation({
    mutationFn: (campaign: Campaign) =>
      apiFetch(`/campaigns/${campaign._id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setDeleting(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't delete this campaign");
    },
  });

  const columns: Array<DataTableColumn<Campaign>> = [
    {
      key: "title",
      title: "Campaign",
      render: (row) => (
        <div>
          <Link
            href={`/campaigns/${row._id}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            {row.title}
          </Link>
          <p className="text-xs capitalize opacity-60">{row.category}</p>
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
      render: (row) => {
        const percent =
          row.fundingGoal > 0
            ? Math.min(100, Math.round((row.amountRaised / row.fundingGoal) * 100))
            : 0;
        return (
          <div>
            <p className="font-medium">
              {formatNumber(row.amountRaised)} / {formatNumber(row.fundingGoal)}
            </p>
            <p className="text-xs opacity-60">{percent}% funded</p>
          </div>
        );
      },
    },
    {
      key: "deadline",
      title: "Deadline",
      render: (row) => {
        const remaining = daysLeft(row.deadline);
        return (
          <div>
            <p>{formatDate(row.deadline)}</p>
            <p className="text-xs opacity-60">
              {remaining > 0 ? `${remaining} day${remaining === 1 ? "" : "s"} left` : "Ended"}
            </p>
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      render: (row) => (
        <span className="inline-flex items-center gap-1">
          <Button
            view="flat"
            size="s"
            title="Update title, story, or reward"
            aria-label={`Update ${row.title}`}
            href={`/dashboard/my-campaigns/${row._id}/edit`}
          >
            <Icon data={Pencil} size={16} />
          </Button>
          <Button
            view="flat-danger"
            size="s"
            title="Delete campaign"
            aria-label={`Delete ${row.title}`}
            onClick={() => setDeleting(row)}
          >
            <Icon data={TrashBin} size={16} />
          </Button>
        </span>
      ),
    },
  ];

  if (isError) {
    return (
      <Alert
        theme="danger"
        title="Couldn't load your campaigns"
        message="Something went wrong while fetching this."
        actions={<Alert.Action onClick={() => refetch()}>Try again</Alert.Action>}
      />
    );
  }

  if (isPending || !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <>
      <DataTable
        columns={columns}
        rows={data.campaigns}
        rowKey={(row) => row._id}
        emptyState={
          <EmptyState
            icon={CirclePlus}
            title="No campaigns yet"
            subtitle="Launch your first campaign — it goes to admin review and appears publicly once approved."
            action={
              <Button size="l" view="outlined" href="/dashboard/add-campaign">
                Add a campaign
              </Button>
            }
          />
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this campaign?"
        message={
          deleting
            ? `"${deleting.title}" will be removed permanently and every approved contribution will be refunded to its supporter. This can't be undone.`
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
