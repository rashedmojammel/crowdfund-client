"use client";

import { Label } from "@gravity-ui/uikit";
import type { ContributionStatus } from "@/types";

// Status highlighting per spec: pending = yellow, approved = green,
// rejected = red (Gravity warning / success / danger themes).
const statusTheme: Record<ContributionStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const statusText: Record<ContributionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function ContributionStatusBadge({ status }: { status: ContributionStatus }) {
  return <Label theme={statusTheme[status]}>{statusText[status]}</Label>;
}
