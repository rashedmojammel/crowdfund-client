"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Label } from "@gravity-ui/uikit";
import { CircleDollar } from "@gravity-ui/icons";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatDate, formatUsd } from "@/lib/format";
import type { Paginated, Withdrawal } from "@/types";

/** All withdrawal requests, pending first, with the mark-paid action. */
export function WithdrawalRequestsTable() {
  const queryClient = useQueryClient();
  const [paying, setPaying] = useState<Withdrawal | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["withdrawals", "admin"],
    // limit=50 approximates "all" — this table has no pagination control.
    // Real GET /withdrawals (no ?mine) is already scoped to status=pending
    // on the server, so this list is the pending queue, not full history.
    queryFn: () => apiFetch<Paginated<Withdrawal>>("/withdrawals?limit=50"),
  });

  const markPaid = useMutation({
    mutationFn: (w: Withdrawal) =>
      apiFetch<{ withdrawal: Withdrawal }>(`/withdrawals/${w._id}/approve`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setPaying(null);
    },
  });

  const columns: Array<DataTableColumn<Withdrawal>> = [
    {
      key: "creator",
      title: "Creator",
      // No creatorName on the real Withdrawal document — only creatorEmail.
      render: (row) => <p className="font-medium">{row.creatorEmail}</p>,
    },
    {
      key: "credits",
      title: "Credits",
      align: "right",
      sortable: true,
      sortValue: (row) => row.credits,
      render: (row) => formatCredits(row.credits),
    },
    {
      key: "payout",
      title: "Payout",
      align: "right",
      render: (row) => formatUsd(row.amount),
    },
    {
      key: "method",
      title: "Method",
      render: (row) => (
        <div>
          <p className="capitalize">{row.paymentSystem}</p>
          <p className="font-mono text-xs opacity-60">{row.accountNumber}</p>
        </div>
      ),
    },
    {
      key: "requested",
      title: "Requested",
      sortable: true,
      sortValue: (row) => row.createdAt,
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => (
        <Label theme={row.status === "approved" ? "success" : "warning"}>
          {row.status === "approved" ? "Paid" : "Pending"}
        </Label>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      render: (row) =>
        row.status === "pending" ? (
          <Button view="outlined-success" size="s" onClick={() => setPaying(row)}>
            Payment Success
          </Button>
        ) : null,
    },
  ];

  if (isError) {
    return (
      <Alert
        theme="danger"
        title="Couldn't load withdrawal requests"
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
            icon={CircleDollar}
            title="No withdrawal requests"
            subtitle="Creator payout requests appear here, pending ones first."
          />
        }
      />

      <ConfirmDialog
        open={Boolean(paying)}
        title="Confirm payout?"
        message={
          paying
            ? `Mark ${formatCredits(paying.credits)} (${formatUsd(paying.amount)}) to ${paying.creatorEmail} via ${paying.paymentSystem} as paid? The creator is notified immediately.`
            : ""
        }
        confirmText="Mark as paid"
        loading={markPaid.isPending}
        onConfirm={() => paying && markPaid.mutate(paying)}
        onClose={() => setPaying(null)}
      />
    </>
  );
}
