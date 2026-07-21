"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Icon } from "@gravity-ui/uikit";
import { Check, Eye, Heart, Xmark } from "@gravity-ui/icons";
import { ContributionStatusBadge } from "@/components/dashboard/ContributionStatusBadge";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ViewContributionModal } from "@/components/dashboard/creator/ViewContributionModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatDate } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import type { Contribution } from "@/types";

/** Contributions on the creator's campaigns with View / Approve / Reject. */
export function ContributionsToReviewTable() {
  const user = useSessionStore((s) => s.user);
  const queryClient = useQueryClient();
  const [viewing, setViewing] = useState<Contribution | null>(null);
  const [rejecting, setRejecting] = useState<Contribution | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["contributions", "for-creator", user?.email],
    queryFn: () => apiFetch<Contribution[]>("/contributions?forCreator=true"),
    enabled: Boolean(user),
  });

  const invalidateAll = () => {
    // Approval changes amount_raised and stats; rejection refunds credits.
    queryClient.invalidateQueries({ queryKey: ["contributions"] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaign"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  const approve = useMutation({
    mutationFn: (c: Contribution) =>
      apiFetch<Contribution>(`/contributions/${c.id}/approve`, { method: "PATCH" }),
    onSuccess: () => {
      invalidateAll();
      setViewing(null);
    },
  });

  const reject = useMutation({
    mutationFn: (c: Contribution) =>
      apiFetch<Contribution>(`/contributions/${c.id}/reject`, { method: "PATCH" }),
    onSuccess: () => {
      invalidateAll();
      setRejecting(null);
      setViewing(null);
    },
  });

  const actionPending = approve.isPending || reject.isPending;

  const columns: Array<DataTableColumn<Contribution>> = [
    {
      key: "supporter",
      title: "Supporter",
      render: (row) => (
        <div>
          <p className="font-medium">{row.supporterName}</p>
          <p className="text-xs opacity-60">{row.supporterEmail}</p>
        </div>
      ),
    },
    {
      key: "campaign",
      title: "Campaign",
      render: (row) => row.campaignTitle,
    },
    {
      key: "amount",
      title: "Amount",
      align: "right",
      sortable: true,
      sortValue: (row) => row.amount,
      render: (row) => formatCredits(row.amount),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => <ContributionStatusBadge status={row.status} />,
    },
    {
      key: "date",
      title: "Date",
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
            view="flat"
            size="s"
            title="View details"
            aria-label={`View contribution from ${row.supporterName}`}
            onClick={() => setViewing(row)}
          >
            <Icon data={Eye} size={16} />
          </Button>
          {row.status === "pending" ? (
            <>
              <Button
                view="flat-success"
                size="s"
                title="Approve"
                aria-label={`Approve ${formatCredits(row.amount)} from ${row.supporterName}`}
                loading={approve.isPending && approve.variables?.id === row.id}
                onClick={() => approve.mutate(row)}
              >
                <Icon data={Check} size={16} />
              </Button>
              <Button
                view="flat-danger"
                size="s"
                title="Reject"
                aria-label={`Reject ${formatCredits(row.amount)} from ${row.supporterName}`}
                onClick={() => setRejecting(row)}
              >
                <Icon data={Xmark} size={16} />
              </Button>
            </>
          ) : null}
        </span>
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
            icon={Heart}
            title="No contributions yet"
            subtitle="When supporters back your campaigns, their contributions arrive here for your review."
          />
        }
      />

      <ViewContributionModal
        contribution={viewing}
        onClose={() => setViewing(null)}
        onApprove={(c) => approve.mutate(c)}
        onReject={(c) => {
          setViewing(null);
          setRejecting(c);
        }}
        actionPending={actionPending}
      />

      <ConfirmDialog
        open={Boolean(rejecting)}
        title="Reject this contribution?"
        message={
          rejecting
            ? `${rejecting.supporterName}'s ${formatCredits(rejecting.amount)} will be refunded to their wallet and they'll be notified. This can't be undone.`
            : ""
        }
        confirmText="Reject and refund"
        danger
        loading={reject.isPending}
        onConfirm={() => rejecting && reject.mutate(rejecting)}
        onClose={() => setRejecting(null)}
      />
    </>
  );
}
