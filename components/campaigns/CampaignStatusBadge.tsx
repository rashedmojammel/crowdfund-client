"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CampaignStatus } from "@/types";

const statusClass: Record<CampaignStatus, string> = {
  pending: "border-transparent bg-[var(--fs-warning)] text-white",
  approved: "border-transparent bg-[var(--fs-success)] text-white",
  rejected: "border-transparent bg-destructive text-white",
  suspended: "border-transparent bg-muted-foreground text-white",
};

const statusText: Record<CampaignStatus, string> = {
  pending: "Pending review",
  approved: "Live",
  rejected: "Rejected",
  suspended: "Suspended",
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return <Badge className={cn(statusClass[status])}>{statusText[status]}</Badge>;
}
