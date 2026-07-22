"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@gravity-ui/uikit";
import { Heart } from "@gravity-ui/icons";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatDate } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import type { Contribution, Paginated } from "@/types";

const columns: Array<DataTableColumn<Contribution>> = [
  {
    key: "campaign",
    title: "Campaign",
    // No campaignTitle on the real Contribution document — see the same
    // note in MyContributionsTable.tsx.
    sortable: true,
    sortValue: (row) => row.campaignId,
    render: (row) => (
      <Link
        href={`/campaigns/${row.campaignId}`}
        className="font-medium underline-offset-4 hover:underline"
      >
        {row.campaignId}
      </Link>
    ),
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
    key: "date",
    title: "Date",
    align: "right",
    sortable: true,
    sortValue: (row) => row.createdAt,
    render: (row) => formatDate(row.createdAt),
  },
];

/** The supporter's approved contributions — shown on the dashboard home. */
export function ApprovedContributionsTable() {
  const user = useSessionStore((s) => s.user);

  const { data, isPending } = useQuery({
    queryKey: ["contributions", "mine", user?.email, "all"],
    queryFn: () => apiFetch<Paginated<Contribution>>("/contributions?mine=true&page=1&limit=50"),
    enabled: Boolean(user),
  });
  // limit=50 approximates "all" since the real endpoint always paginates
  // and this table has no pagination control of its own.

  if (isPending) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  const approved = (data?.items ?? []).filter((c) => c.status === "approved");

  return (
    <DataTable
      columns={columns}
      rows={approved}
      rowKey={(row) => row._id}
      emptyState={
        <EmptyState
          icon={Heart}
          title="No approved contributions yet"
          subtitle="Once a creator accepts one of your contributions it shows up here with its full history."
          action={
            <Button size="l" view="outlined" href="/dashboard/explore-campaigns">
              Explore campaigns
            </Button>
          }
        />
      }
    />
  );
}
