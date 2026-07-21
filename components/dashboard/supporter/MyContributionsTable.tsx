"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@gravity-ui/uikit";
import { Heart } from "@gravity-ui/icons";
import { ContributionStatusBadge } from "@/components/dashboard/ContributionStatusBadge";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Pagination } from "@/components/dashboard/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatDate } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import type { Contribution, Paginated } from "@/types";

const PAGE_SIZE = 5;

const columns: Array<DataTableColumn<Contribution>> = [
  {
    key: "campaign",
    title: "Campaign",
    render: (row) => (
      <Link
        href={`/campaigns/${row.campaignId}`}
        className="font-medium underline-offset-4 hover:underline"
      >
        {row.campaignTitle}
      </Link>
    ),
  },
  {
    key: "amount",
    title: "Amount",
    align: "right",
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
    align: "right",
    render: (row) => formatDate(row.createdAt),
  },
];

/** Paginated list of every contribution the supporter has made. */
export function MyContributionsTable() {
  const user = useSessionStore((s) => s.user);
  const [page, setPage] = useState(1);

  const { data, isPending } = useQuery({
    queryKey: ["contributions", "mine", user?.email, page],
    queryFn: () =>
      apiFetch<Paginated<Contribution>>(
        `/contributions?mine=true&page=${page}&limit=${PAGE_SIZE}`
      ),
    enabled: Boolean(user),
    placeholderData: keepPreviousData, // keep rows visible while the next page loads
  });

  if (isPending || !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={columns}
        rows={data.items}
        rowKey={(row) => row.id}
        emptyState={
          <EmptyState
            icon={Heart}
            title="No contributions yet"
            subtitle="Back your first campaign and it will show up here with its review status."
            action={
              <Button size="l" view="outlined" href="/dashboard/explore-campaigns">
                Explore campaigns
              </Button>
            }
          />
        }
      />
      <div className="flex items-center justify-between gap-4">
        {data.total > 0 ? (
          <p className="text-sm opacity-60">
            {data.total} contribution{data.total === 1 ? "" : "s"} total
          </p>
        ) : (
          <span />
        )}
        <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
