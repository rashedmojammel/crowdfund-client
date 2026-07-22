"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleDollar, ListUl, Rocket } from "@gravity-ui/icons";
import { Alert } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ContributionsToReviewTable } from "@/components/dashboard/creator/ContributionsToReviewTable";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatUsd } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import { CREDITS_PER_USD_WITHDRAW } from "@/lib/utils";
import type { CreatorStats } from "@/types";

export function CreatorHome() {
  const user = useSessionStore((s) => s.user);

  const { data: statsData, isPending, isError, refetch } = useQuery({
    queryKey: ["stats", "creator", user?.email],
    queryFn: () => apiFetch<{ stats: CreatorStats }>("/stats/creator"),
    enabled: Boolean(user),
  });
  const stats = statsData?.stats;

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <h2>Welcome back, {user.name.split(" ")[0]}</h2>
        {/* Real /stats/creator has no pendingReviewCount — the table below
            already surfaces what's pending. */}
        <p className="mt-2 text-sm opacity-70">Here&rsquo;s how your campaigns are performing.</p>
      </FadeIn>

      {isError ? (
        <Alert
          theme="danger"
          title="Couldn't load your stats"
          message="Something went wrong while fetching this."
          actions={<Alert.Action onClick={() => refetch()}>Try again</Alert.Action>}
        />
      ) : isPending || !stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <StatsGrid>
          <StatsCard
            label="Total campaigns"
            value={stats.totalCampaigns}
            icon={ListUl}
            hint="Across all statuses"
          />
          <StatsCard
            label="Active campaigns"
            value={stats.activeCampaigns}
            icon={Rocket}
            hint="Live and inside deadline"
          />
          <StatsCard
            label="Total raised"
            value={stats.totalRaised}
            suffix=" credits"
            icon={CircleDollar}
            hint={`≈ ${formatUsd(stats.totalRaised / CREDITS_PER_USD_WITHDRAW)} at the withdrawal rate`}
          />
        </StatsGrid>
      )}

      <section aria-labelledby="review-heading">
        <h3 id="review-heading">Contributions to review</h3>
        <div className="mt-4">
          <ContributionsToReviewTable />
        </div>
      </section>
    </div>
  );
}
