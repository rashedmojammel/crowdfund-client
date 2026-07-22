"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Label } from "@gravity-ui/uikit";
import { CircleDollar } from "@gravity-ui/icons";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatDate, formatUsd, maskAccount } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import type { Paginated, Withdrawal } from "@/types";

const columns: Array<DataTableColumn<Withdrawal>> = [
  {
    key: "date",
    title: "Requested",
    sortable: true,
    sortValue: (row) => row.createdAt,
    render: (row) => formatDate(row.createdAt),
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
    key: "usd",
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
        <p className="font-mono text-xs opacity-60">{maskAccount(row.accountNumber)}</p>
      </div>
    ),
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
];

export function WithdrawalHistoryTable() {
  const user = useSessionStore((s) => s.user);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["withdrawals", "mine", user?.email],
    // limit=50 approximates "all" — this table has no pagination control.
    queryFn: () => apiFetch<Paginated<Withdrawal>>("/withdrawals?mine=true&limit=50"),
    enabled: Boolean(user),
  });

  if (isError) {
    return (
      <Alert
        theme="danger"
        title="Couldn't load withdrawal history"
        message="Something went wrong while fetching this."
        actions={<Alert.Action onClick={() => refetch()}>Try again</Alert.Action>}
      />
    );
  }

  if (isPending || !data) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  return (
    <DataTable
      columns={columns}
      rows={data.items}
      rowKey={(row) => row._id}
      emptyState={
        <EmptyState
          icon={CircleDollar}
          title="No withdrawals yet"
          subtitle="Once you request a payout it appears here with its status — an admin marks it paid."
        />
      }
    />
  );
}
