"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleCheck, Clock, Heart } from "@gravity-ui/icons";
import { FadeIn } from "@/components/animations/FadeIn";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ApprovedContributionsTable } from "@/components/dashboard/supporter/ApprovedContributionsTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/store";
import type { SupporterStats } from "@/types";

export function SupporterHome() {
  const user = useSessionStore((s) => s.user);

  const { data: stats, isPending } = useQuery({
    queryKey: ["stats", "supporter", user?.email],
    queryFn: () => apiFetch<SupporterStats>("/stats/supporter"),
    enabled: Boolean(user),
  });

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <h2>Welcome back, {user.name.split(" ")[0]}</h2>
        <p className="mt-2 text-sm opacity-70">
          Here&rsquo;s how your support is doing across {stats?.campaignsBacked ?? "your"}{" "}
          backed campaigns.
        </p>
      </FadeIn>

      {isPending || !stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <StatsGrid>
          <StatsCard
            label="Total contributed"
            value={stats.totalContributed}
            suffix=" credits"
            icon={Heart}
            hint={`Across ${stats.campaignsBacked} campaign${stats.campaignsBacked === 1 ? "" : "s"}`}
          />
          <StatsCard
            label="Pending review"
            value={stats.pendingAmount}
            suffix=" credits"
            icon={Clock}
            hint="Waiting for creator approval"
          />
          <StatsCard
            label="Approved"
            value={stats.approvedAmount}
            suffix=" credits"
            icon={CircleCheck}
            hint="Counted toward campaign goals"
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
