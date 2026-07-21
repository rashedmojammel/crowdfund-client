"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Alert, Skeleton } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { apiFetch } from "@/lib/api-client";
import type { Campaign } from "@/types";

/** Card-shaped skeleton so the grid doesn't shift when data arrives. */
function CampaignCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-[var(--g-color-base-float)]">
      <Skeleton className="aspect-video w-full" />
      <div className="flex flex-col gap-3 p-4 md:p-6">
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
}

export function TopFundedCampaigns() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["campaigns", "top-funded"],
    queryFn: () => apiFetch<Campaign[]>("/campaigns/top-funded"),
  });

  return (
    <section aria-labelledby="top-funded-heading" className="container-page">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="top-funded-heading">Top funded campaigns</h2>
            <p className="mt-2 max-w-xl text-sm opacity-70">
              The projects supporters are backing hardest right now — reviewed, live, and
              closing in on their goals.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-sm font-medium text-[var(--g-color-text-info)]"
          >
            View all campaigns →
          </Link>
        </div>
      </FadeIn>

      <div className="mt-8">
        {isPending ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <Alert
            theme="danger"
            title="Couldn't load campaigns"
            message="Something went wrong while fetching the top funded campaigns."
            actions={<Alert.Action onClick={() => refetch()}>Try again</Alert.Action>}
          />
        ) : (
          <StaggerChildren className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((campaign) => (
              <StaggerItem key={campaign.id} className="h-full">
                <CampaignCard campaign={campaign} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </div>
    </section>
  );
}
