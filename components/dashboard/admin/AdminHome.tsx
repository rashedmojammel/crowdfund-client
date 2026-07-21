"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, Persons, PersonWorker, Wallet } from "@gravity-ui/icons";
import { FadeIn } from "@/components/animations/FadeIn";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/store";
import type { PlatformStats } from "@/types";

export function AdminHome() {
  const user = useSessionStore((s) => s.user);

  const { data: stats, isPending } = useQuery({
    queryKey: ["stats", "platform"],
    queryFn: () => apiFetch<PlatformStats>("/stats/platform"),
    enabled: Boolean(user),
  });

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <h2>Platform overview</h2>
        <p className="mt-2 text-sm opacity-70">
          Live totals across FundSpark. Approvals, payouts, and reports are in the sidebar.
        </p>
      </FadeIn>

      {isPending || !stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <StatsGrid>
          <StatsCard
            label="Supporters"
            value={stats.totalSupporters}
            icon={Persons}
            hint="Registered supporter accounts"
          />
          <StatsCard
            label="Creators"
            value={stats.totalCreators}
            icon={PersonWorker}
            hint="Registered creator accounts"
          />
          <StatsCard
            label="Credits in wallets"
            value={stats.totalCreditsInWallets}
            icon={Wallet}
            hint="Unspent credits across all users"
          />
          <StatsCard
            label="Payments received"
            value={stats.totalPaymentsUsd}
            prefix="$"
            icon={CreditCard}
            hint="Total credit purchases"
          />
        </StatsGrid>
      )}
    </div>
  );
}
