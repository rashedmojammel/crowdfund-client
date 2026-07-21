"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { CampaignGrid } from "@/components/campaigns/CampaignGrid";
import { apiFetch } from "@/lib/api-client";
import type { Campaign } from "@/types";

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
        {isError ? (
          <Alert
            theme="danger"
            title="Couldn't load campaigns"
            message="Something went wrong while fetching the top funded campaigns."
            actions={<Alert.Action onClick={() => refetch()}>Try again</Alert.Action>}
          />
        ) : (
          <CampaignGrid campaigns={data} isLoading={isPending} />
        )}
      </div>
    </section>
  );
}
