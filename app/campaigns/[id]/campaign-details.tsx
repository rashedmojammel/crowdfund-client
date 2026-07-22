"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Gift, LogIn, TriangleAlert, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/animations/FadeIn";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { ContributeForm } from "@/components/campaigns/ContributeForm";
import { ProgressBar } from "@/components/campaigns/ProgressBar";
import { ReportCampaignButton } from "@/components/campaigns/ReportCampaignButton";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/auth-client";
import { BLUR_DATA_URL } from "@/lib/constants";
import { daysLeft, formatCredits, formatDate, formatNumber } from "@/lib/format";
import type { Campaign } from "@/types";

/** Mirrors the final two-column layout so nothing shifts when data lands. */
function DetailsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function CampaignDetails({ campaignId }: { campaignId: string }) {
  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user;

  // The server requires auth for campaign detail (unlike the public
  // explore list), so wait for the session to resolve before deciding —
  // and don't even attempt the fetch for a logged-out visitor.
  const { data, isPending, isError } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => apiFetch<{ campaign: Campaign }>(`/campaigns/${campaignId}`),
    enabled: Boolean(user),
  });
  const campaign = data?.campaign;

  if (isSessionPending) {
    return (
      <div className="container-fs py-12">
        <DetailsSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-fs py-12">
        <Alert>
          <LogIn />
          <AlertTitle>Sign in to view this campaign</AlertTitle>
          <AlertDescription>
            Campaign details are only visible to signed-in members.
            <Button size="sm" className="mt-2 w-fit" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="container-fs py-12">
        <DetailsSkeleton />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="container-fs py-12">
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Campaign not found</AlertTitle>
          <AlertDescription>
            This campaign may have been removed, or the link is incorrect.
            <Button size="sm" className="mt-2 w-fit" asChild>
              <Link href="/explore">Browse live campaigns</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const percent =
    campaign.fundingGoal > 0
      ? Math.min(100, Math.round((campaign.amountRaised / campaign.fundingGoal) * 100))
      : 0;
  const remaining = daysLeft(campaign.deadline);

  return (
    <div className="container-fs py-12">
      <FadeIn>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main column */}
          <article className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {campaign.category}
              </Badge>
              <CampaignStatusBadge status={campaign.status} />
            </div>

            <div>
              <h1 className="text-balance">{campaign.title}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <User className="size-4" aria-hidden="true" />
                  {campaign.creatorEmail}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4" aria-hidden="true" />
                  Started {formatDate(campaign.createdAt)}
                </span>
              </p>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image
                src={campaign.coverImage}
                alt={`Cover image for ${campaign.title}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </div>

            <section aria-labelledby="story-heading">
              <h3 id="story-heading">About this campaign</h3>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/90">
                {campaign.story}
              </p>
            </section>

            <section
              aria-labelledby="reward-heading"
              className="rounded-xl bg-muted p-4 md:p-6"
            >
              <h4 id="reward-heading" className="flex items-center gap-2">
                <Gift className="size-5" aria-hidden="true" />
                Backer reward
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                {campaign.reward}
              </p>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6 self-start lg:sticky lg:top-24">
            <div className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-sm md:p-6">
              <ProgressBar raised={campaign.amountRaised} goal={campaign.fundingGoal} />
              <div>
                <p className="text-[24px] font-bold leading-[1.3]">
                  {formatCredits(campaign.amountRaised)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {percent}% of {formatNumber(campaign.fundingGoal)}-credit goal
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" aria-hidden="true" />
                {remaining > 0
                  ? `Ends ${formatDate(campaign.deadline)} — ${remaining} day${remaining === 1 ? "" : "s"} left`
                  : `Ended ${formatDate(campaign.deadline)}`}
              </div>
            </div>

            <div className="rounded-xl bg-card p-4 shadow-sm md:p-6">
              <ContributeForm campaign={campaign} />
            </div>

            <ReportCampaignButton campaign={campaign} />

            <Button variant="ghost" asChild>
              <Link href="/explore">← Back to all campaigns</Link>
            </Button>
          </aside>
        </div>
      </FadeIn>
    </div>
  );
}
