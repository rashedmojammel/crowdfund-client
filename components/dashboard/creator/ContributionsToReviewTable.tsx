"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Icon } from "@gravity-ui/uikit";
import { Check, Eye, Heart, Xmark } from "@gravity-ui/icons";
import { toast } from "sonner";
import { ContributionStatusBadge } from "@/components/dashboard/ContributionStatusBadge";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ViewContributionModal } from "@/components/dashboard/creator/ViewContributionModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatDate } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import type { Contribution, Paginated } from "@/types";

/** Contributions on the creator's campaigns with View / Approve / Reject. */
export function ContributionsToReviewTable() {
  const user = useSessionStore((s) => s.user);
  const queryClient = useQueryClient();
  const [viewing, setViewing] = useState<Contribution | null>(null);
  const [rejecting, setRejecting] = useState<Contribution | null>(null);

  const queryKey = ["contributions", "for-creator", user?.email] as const;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey,
    // limit=50 approximates "all" — this table has no pagination control.
    queryFn: () =>
      apiFetch<Paginated<Contribution>>("/contributions?forCreator=true&limit=50"),
    enabled: Boolean(user),
  });

  const invalidateAll = () => {
    // Approval changes amountRaised and stats; rejection refunds credits.
    queryClient.invalidateQueries({ queryKey: ["contributions"] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaign"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  /** Optimistically patches the row's status; returns the prior cache for rollback. */
  const applyOptimisticStatus = (id: string, status: Contribution["status"]) => {
    const previous = queryClient.getQueryData<Paginated<Contribution>>(queryKey);
    queryClient.setQueryData<Paginated<Contribution>>(queryKey, (old) =>
      old ? { ...old, items: old.items.map((c) => (c._id === id ? { ...c, status } : c)) } : old
    );
    return previous;
  };

  const approve = useMutation({
    mutationFn: (c: Contribution) =>
      apiFetch<{ contribution: Contribution }>(`/contributions/${c._id}/approve`, {
        method: "PATCH",
      }),
    onMutate: async (c) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = applyOptimisticStatus(c._id, "approved");
      setViewing(null);
      return { previous };
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Contribution approved.");
    },
    onError: (error, _c, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error(error instanceof Error ? error.message : "Couldn't approve this contribution");
    },
  });

  const reject = useMutation({
    mutationFn: (c: Contribution) =>
      apiFetch<{ contribution: Contribution }>(`/contributions/${c._id}/reject`, {
        method: "PATCH",
      }),
    onMutate: async (c) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = applyOptimisticStatus(c._id, "rejected");
      setRejecting(null);
      setViewing(null);
      return { previous };
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Contribution rejected and credits refunded.");
    },
    onError: (error, _c, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error(error instanceof Error ? error.message : "Couldn't reject this contribution");
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
      // No campaignTitle on the real Contribution document — see the note
      // in MyContributionsTable.tsx.
      render: (row) => row.campaignId,
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
                loading={approve.isPending && approve.variables?._id === row._id}
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

  if (isError) {
    return (
      <Alert
        theme="danger"
        title="Couldn't load contributions to review"
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
        rows={data.items}
        rowKey={(row) => row._id}
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
