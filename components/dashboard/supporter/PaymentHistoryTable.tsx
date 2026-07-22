"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Button } from "@gravity-ui/uikit";
import { CreditCard } from "@gravity-ui/icons";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatDate, formatUsd } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import type { Paginated, Payment } from "@/types";

const columns: Array<DataTableColumn<Payment>> = [
  {
    key: "date",
    title: "Date",
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
    key: "amount",
    title: "Paid",
    align: "right",
    sortable: true,
    sortValue: (row) => row.amountUsd,
    render: (row) => formatUsd(row.amountUsd),
  },
  {
    key: "receipt",
    title: "Receipt",
    align: "right",
    render: (row) => (
      <span className="font-mono text-xs opacity-60">{row.stripeSessionId ?? "—"}</span>
    ),
  },
];

/** Credit purchase history (shared by supporters and creators). */
export function PaymentHistoryTable() {
  const user = useSessionStore((s) => s.user);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["payments", user?.email],
    // limit=50 approximates "all" — this table has no pagination control.
    queryFn: () => apiFetch<Paginated<Payment>>("/payments?limit=50"),
    enabled: Boolean(user),
  });

  if (isError) {
    return (
      <Alert
        theme="danger"
        title="Couldn't load payment history"
        message="Something went wrong while fetching this."
        actions={<Alert.Action onClick={() => refetch()}>Try again</Alert.Action>}
      />
    );
  }

  if (isPending || !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <DataTable
      columns={columns}
      rows={data.items}
      rowKey={(row) => row._id}
      emptyState={
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          subtitle="When you top up your credit wallet, every purchase and its receipt lands here."
          action={
            <Button size="l" view="outlined" href="/dashboard/purchase-credit">
              Purchase credits
            </Button>
          }
        />
      }
    />
  );
}
