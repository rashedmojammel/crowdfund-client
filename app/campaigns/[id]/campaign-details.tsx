"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Icon, Label, Skeleton } from "@gravity-ui/uikit";
import { Calendar, Gift, Person } from "@gravity-ui/icons";
import { FadeIn } from "@/components/animations/FadeIn";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { ContributeForm } from "@/components/campaigns/ContributeForm";
import { ProgressBar } from "@/components/campaigns/ProgressBar";
import { ReportCampaignButton } from "@/components/campaigns/ReportCampaignButton";
import { apiFetch } from "@/lib/api-client";
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
  const { data: campaign, isPending, isError } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => apiFetch<Campaign>(`/campaigns/${campaignId}`),
  });

  if (isPending) {
    return (
      <div className="container-page py-12">
        <DetailsSkeleton />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="container-page py-12">
        <Alert
          theme="danger"
          title="Campaign not found"
          message="This campaign may have been removed, or the link is incorrect."
          actions={
            <Alert.Action href="/explore">Browse live campaigns</Alert.Action>
          }
        />
      </div>
    );
  }

  const percent =
    campaign.funding_goal > 0
      ? Math.min(100, Math.round((campaign.amount_raised / campaign.funding_goal) * 100))
      : 0;
  const remaining = daysLeft(campaign.deadline);

  return (
    <div className="container-page py-12">
      <FadeIn>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main column */}
          <article className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <Label theme="normal">{campaign.category}</Label>
              <CampaignStatusBadge status={campaign.status} />
            </div>

            <div>
              <h1 className="text-balance">{campaign.title}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm opacity-70">
                <span className="inline-flex items-center gap-1.5">
                  <Icon data={Person} size={16} />
                  {campaign.creatorName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon data={Calendar} size={16} />
                  Started {formatDate(campaign.createdAt)}
                </span>
              </p>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image
                src={campaign.image}
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
              <p className="mt-4 whitespace-pre-line leading-relaxed opacity-90">
                {campaign.story}
              </p>
            </section>

            <section
              aria-labelledby="reward-heading"
              className="rounded-xl bg-[var(--g-color-base-generic)] p-4 md:p-6"
            >
              <h4 id="reward-heading" className="flex items-center gap-2">
                <Icon data={Gift} size={20} />
                Backer reward
              </h4>
              <p className="mt-3 text-sm leading-relaxed opacity-90">{campaign.reward}</p>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6 self-start lg:sticky lg:top-24">
            <div className="card-elevate flex flex-col gap-4 rounded-xl bg-[var(--g-color-base-float)] p-4 md:p-6">
              <ProgressBar raised={campaign.amount_raised} goal={campaign.funding_goal} />
              <div>
                <p className="text-[24px] font-bold leading-[1.3]">
                  {formatCredits(campaign.amount_raised)}
                </p>
                <p className="mt-1 text-sm opacity-70">
                  {percent}% of {formatNumber(campaign.funding_goal)}-credit goal
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-70">
                <Icon data={Calendar} size={16} />
                {remaining > 0
                  ? `Ends ${formatDate(campaign.deadline)} — ${remaining} day${remaining === 1 ? "" : "s"} left`
                  : `Ended ${formatDate(campaign.deadline)}`}
              </div>
            </div>

            <div className="card-elevate rounded-xl bg-[var(--g-color-base-float)] p-4 md:p-6">
              <ContributeForm campaign={campaign} />
            </div>

            <ReportCampaignButton campaign={campaign} />

            <Button view="flat" size="m" href="/explore">
              ← Back to all campaigns
            </Button>
          </aside>
        </div>
      </FadeIn>
    </div>
  );
}
