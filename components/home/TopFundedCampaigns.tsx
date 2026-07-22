"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { CampaignGrid } from "@/components/campaigns/CampaignGrid";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { apiFetch } from "@/lib/api-client";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Campaign } from "@/types";

export function TopFundedCampaigns() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["campaigns", "top-funded"],
    queryFn: () => apiFetch<{ campaigns: Campaign[] }>("/campaigns/top-funded", { public: true }),
  });

  return (
    <section aria-labelledby="top-funded-heading" className="container-fs">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="top-funded-heading">Top funded campaigns</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              The projects supporters are backing hardest right now — reviewed, live, and
              closing in on their goals.
            </p>
          </div>
          <Link href="/explore" className={cn("rounded text-sm font-medium text-primary", FOCUS_RING)}>
            View all campaigns →
          </Link>
        </div>
      </FadeIn>

      <div className="mt-8">
        {isError ? (
          <ErrorState
            title="Couldn't load campaigns"
            message="Something went wrong while fetching the top funded campaigns."
            onRetry={() => refetch()}
          />
        ) : (
          <CampaignGrid
            campaigns={data?.campaigns}
            isLoading={isPending}
            emptyState={
              <EmptyState
                icon={Sparkles}
                title="No campaigns yet"
                subtitle="Once campaigns are approved and start getting backed, the top-funded ones will show up here."
              />
            }
          />
        )}
      </div>
    </section>
  );
}
