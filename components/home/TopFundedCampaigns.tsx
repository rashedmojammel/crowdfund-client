"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CircleAlert, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";
import { CampaignGrid } from "@/components/campaigns/CampaignGrid";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { apiFetch } from "@/lib/api-client";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Campaign } from "@/types";

export function TopFundedCampaigns() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["campaigns", "top-funded"],
    queryFn: () => apiFetch<{ campaigns: Campaign[] }>("/campaigns/top-funded"),
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
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Couldn&rsquo;t load campaigns</AlertTitle>
            <AlertDescription>
              Something went wrong while fetching the top funded campaigns.
              <Button variant="outline" size="sm" className="mt-2 w-fit" onClick={() => refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
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
