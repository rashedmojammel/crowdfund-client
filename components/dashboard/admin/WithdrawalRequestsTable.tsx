"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Label } from "@gravity-ui/uikit";
import { CircleDollar } from "@gravity-ui/icons";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatDate, formatUsd } from "@/lib/format";
import type { Withdrawal } from "@/types";

/** All withdrawal requests, pending first, with the mark-paid action. */
export function WithdrawalRequestsTable() {
  const queryClient = useQueryClient();
  const [paying, setPaying] = useState<Withdrawal | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["withdrawals", "admin"],
    queryFn: () => apiFetch<Withdrawal[]>("/withdrawals"),
  });

  const markPaid = useMutation({
    mutationFn: (w: Withdrawal) =>
      apiFetch<Withdrawal>(`/withdrawals/${w.id}/approve`, { method: "PATCH" }),
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
      render: (row) => (
        <div>
          <p className="font-medium">{row.creatorName}</p>
          <p className="text-xs opacity-60">{row.creatorEmail}</p>
        </div>
      ),
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
      render: (row) => formatUsd(row.amountUsd),
    },
    {
      key: "method",
      title: "Method",
      render: (row) => (
        <div>
          <p>{row.paymentSystem}</p>
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
        <Label theme={row.status === "paid" ? "success" : "warning"}>
          {row.status === "paid" ? "Paid" : "Pending"}
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
            ? `Mark ${formatCredits(paying.credits)} (${formatUsd(paying.amountUsd)}) to ${paying.creatorName} via ${paying.paymentSystem} as paid? The creator is notified immediately.`
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
