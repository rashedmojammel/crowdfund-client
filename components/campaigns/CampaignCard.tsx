"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/campaigns/ProgressBar";
import { BLUR_DATA_URL } from "@/lib/constants";
import type { Campaign } from "@/types";

interface CampaignCardProps {
  campaign: Campaign;
}

const creatorInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function CampaignCard({ campaign }: CampaignCardProps) {
  const reduceMotion = useReducedMotion();
  const percent =
    campaign.funding_goal > 0
      ? Math.min(100, Math.round((campaign.amount_raised / campaign.funding_goal) * 100))
      : 0;

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl"
    >
      <Link
        href={`/campaigns/${campaign.id}`}
        className="flex h-full flex-col"
        aria-label={`View details of ${campaign.title}`}
      >
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={campaign.image}
            alt={`Cover image for ${campaign.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
          {/* Gradient scrim so the category chip always has contrast. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
          />
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" className="capitalize backdrop-blur-sm">
              {campaign.category}
            </Badge>
          </div>
        </div>

        <div className="flex grow flex-col gap-3 p-4 md:p-6">
          <h4 className="line-clamp-2 text-lg font-semibold leading-snug">{campaign.title}</h4>

          <div className="flex items-center gap-2">
            <Avatar className="size-5">
              <AvatarFallback className="text-[10px]">
                {creatorInitials(campaign.creatorName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">by {campaign.creatorName}</span>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <ProgressBar raised={campaign.amount_raised} goal={campaign.funding_goal} />
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">
                {campaign.amount_raised.toLocaleString("en-US")} credits
              </span>
              <span className="text-muted-foreground">
                {percent}% of {campaign.funding_goal.toLocaleString("en-US")}
              </span>
            </div>
          </div>

          <span className="text-sm font-medium text-primary transition-transform duration-200 group-hover:translate-x-0.5">
            View details →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
