"use client";

import { Label } from "@gravity-ui/uikit";
import type { CampaignStatus } from "@/types";

const statusTheme: Record<CampaignStatus, "warning" | "success" | "danger" | "utility"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  suspended: "utility",
};

const statusText: Record<CampaignStatus, string> = {
  pending: "Pending review",
  approved: "Live",
  rejected: "Rejected",
  suspended: "Suspended",
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return <Label theme={statusTheme[status]}>{statusText[status]}</Label>;
}
