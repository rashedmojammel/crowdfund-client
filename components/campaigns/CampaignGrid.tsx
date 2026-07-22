"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import type { Campaign } from "@/types";

/** Card-shaped skeleton so grids don't shift when data arrives. */
export function CampaignCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-card">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4 md:p-6">
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
}

interface CampaignGridProps {
  campaigns?: Campaign[];
  isLoading?: boolean;
  skeletonCount?: number;
  /** Rendered instead of the grid when there are no campaigns. */
  emptyState?: ReactNode;
}

/** Responsive campaign grid: 1 column mobile, 2 from 640px, 3 from 1024px. */
export function CampaignGrid({
  campaigns,
  isLoading,
  skeletonCount = 6,
  emptyState = null,
}: CampaignGridProps) {
  const gridClasses = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

  if (isLoading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <CampaignCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <StaggerChildren className={gridClasses}>
      {campaigns.map((campaign) => (
        <StaggerItem key={campaign._id} className="h-full">
          <CampaignCard campaign={campaign} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
