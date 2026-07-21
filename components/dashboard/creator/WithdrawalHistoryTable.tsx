"use client";

import { useQuery } from "@tanstack/react-query";
import { Label } from "@gravity-ui/uikit";
import { CircleDollar } from "@gravity-ui/icons";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatDate, formatUsd } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import type { Withdrawal } from "@/types";

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
    key: "status",
    title: "Status",
    render: (row) => (
      <Label theme={row.status === "paid" ? "success" : "warning"}>
        {row.status === "paid" ? "Paid" : "Pending"}
      </Label>
    ),
  },
];

export function WithdrawalHistoryTable() {
  const user = useSessionStore((s) => s.user);

  const { data, isPending } = useQuery({
    queryKey: ["withdrawals", "mine", user?.email],
    queryFn: () => apiFetch<Withdrawal[]>("/withdrawals?mine=true"),
    enabled: Boolean(user),
  });

  if (isPending || !data) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  return (
    <DataTable
      columns={columns}
      rows={data}
      rowKey={(row) => row.id}
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
