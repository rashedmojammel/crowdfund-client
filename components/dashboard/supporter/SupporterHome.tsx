"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleCheck, Clock, Heart } from "@gravity-ui/icons";
import { Alert } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ApprovedContributionsTable } from "@/components/dashboard/supporter/ApprovedContributionsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/store";
import type { SupporterStats } from "@/types";

export function SupporterHome() {
  const user = useSessionStore((s) => s.user);

  const { data: statsData, isPending, isError, refetch } = useQuery({
    queryKey: ["stats", "supporter", user?.email],
    queryFn: () => apiFetch<{ stats: SupporterStats }>("/stats/supporter"),
    enabled: Boolean(user),
  });
  const stats = statsData?.stats;

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <h2>Welcome back, {user.name.split(" ")[0]}</h2>
        <p className="mt-2 text-sm opacity-70">Here&rsquo;s how your support is doing.</p>
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
        // Real /stats/supporter only has totalContributions (count),
        // pendingContributions (count), and totalContributed (amount) — no
        // approvedAmount or campaignsBacked, so this is remapped rather than
        // a straight rename.
        <StatsGrid>
          <StatsCard
            label="Total contributed"
            value={stats.totalContributed}
            suffix=" credits"
            icon={Heart}
            hint={`Across ${stats.totalContributions} contribution${stats.totalContributions === 1 ? "" : "s"}`}
          />
          <StatsCard
            label="Pending review"
            value={stats.pendingContributions}
            icon={Clock}
            hint="Contributions waiting for creator approval"
          />
          <StatsCard
            label="Total contributions"
            value={stats.totalContributions}
            icon={CircleCheck}
            hint="Across every status"
          />
        </StatsGrid>
      )}

      <section aria-labelledby="approved-contributions-heading">
        <h3 id="approved-contributions-heading">Approved contributions</h3>
        <div className="mt-4">
          <ApprovedContributionsTable />
        </div>
      </section>
    </div>
  );
}
