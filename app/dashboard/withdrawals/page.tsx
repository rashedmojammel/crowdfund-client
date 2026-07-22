"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert } from "@gravity-ui/uikit";
import { CircleDollar, Clock, Wallet } from "@gravity-ui/icons";
import { FadeIn } from "@/components/animations/FadeIn";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { WithdrawalForm } from "@/components/dashboard/creator/WithdrawalForm";
import { WithdrawalHistoryTable } from "@/components/dashboard/creator/WithdrawalHistoryTable";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatUsd } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import { CREDITS_PER_USD_WITHDRAW } from "@/lib/utils";
import type { CreatorStats, Paginated, Withdrawal } from "@/types";

export default function WithdrawalsPage() {
  const user = useSessionStore((s) => s.user);

  const {
    data: statsData,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["stats", "creator", user?.email],
    queryFn: () => apiFetch<{ stats: CreatorStats }>("/stats/creator"),
    enabled: Boolean(user),
  });
  const stats = statsData?.stats;

  const {
    data: withdrawalsData,
    isError: withdrawalsError,
    refetch: refetchWithdrawals,
  } = useQuery({
    queryKey: ["withdrawals", "mine", user?.email],
    queryFn: () => apiFetch<Paginated<Withdrawal>>("/withdrawals?mine=true&limit=50"),
    enabled: Boolean(user),
  });
  const withdrawals = withdrawalsData?.items;

  if (!user) return null;

  if (user.role !== "creator") {
    return (
      <Alert
        theme="info"
        title="Creators only"
        message="Withdrawals are for creator accounts cashing out raised campaign credits."
      />
    );
  }

  // Both feed the "available" calculation below — showing it on a partial
  // failure would silently understate (or overstate) how much a creator
  // can withdraw.
  if (statsError || withdrawalsError) {
    return (
      <Alert
        theme="danger"
        title="Couldn't load your withdrawal data"
        message="Something went wrong while fetching this."
        actions={
          <Alert.Action
            onClick={() => {
              if (statsError) refetchStats();
              if (withdrawalsError) refetchWithdrawals();
            }}
          >
            Try again
          </Alert.Action>
        }
      />
    );
  }

  const loading = !stats || !withdrawals;
  const requested = (withdrawals ?? []).reduce((sum, w) => sum + w.credits, 0);
  const available = (stats?.totalRaised ?? 0) - requested;

  return (
    <FadeIn className="flex flex-col gap-8">
      <div>
        <h2>Withdrawals</h2>
        <p className="mt-2 text-sm opacity-70">
          Cash out raised credits at {CREDITS_PER_USD_WITHDRAW} credits = $1. Requests are
          paid out by an admin.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <StatsGrid>
          <StatsCard
            label="Total raised"
            value={stats.totalRaised}
            suffix=" credits"
            icon={CircleDollar}
            hint="Approved contributions across your campaigns"
          />
          <StatsCard
            label="Requested"
            value={requested}
            suffix=" credits"
            icon={Clock}
            hint="Pending and paid withdrawals"
          />
          <StatsCard
            label="Available"
            value={available}
            suffix=" credits"
            icon={Wallet}
            hint={`≈ ${formatUsd(available / CREDITS_PER_USD_WITHDRAW)} payout`}
          />
        </StatsGrid>
      )}

      <section aria-labelledby="withdraw-form-heading" className="max-w-2xl">
        <h3 id="withdraw-form-heading">Request a withdrawal</h3>
        <div className="mt-4">
          {loading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : (
            <WithdrawalForm availableCredits={available} />
          )}
        </div>
      </section>

      <section aria-labelledby="withdraw-history-heading">
        <h3 id="withdraw-history-heading">Withdrawal history</h3>
        <div className="mt-4">
          <WithdrawalHistoryTable />
        </div>
      </section>
    </FadeIn>
  );
}
