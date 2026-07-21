"use client";

import { Alert, Button } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { MyCampaignsTable } from "@/components/dashboard/creator/MyCampaignsTable";
import { useSessionStore } from "@/lib/store";

export default function MyCampaignsPage() {
  const user = useSessionStore((s) => s.user);
  if (!user) return null;

  if (user.role !== "creator") {
    return (
      <Alert
        theme="info"
        title="Creators only"
        message="Only creator accounts have campaigns to manage."
      />
    );
  }

  return (
    <FadeIn className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2>My Campaigns</h2>
          <p className="mt-2 text-sm opacity-70">
            Sorted by deadline, newest deadline first. Deleting a campaign refunds every
            approved contribution.
          </p>
        </div>
        <Button view="action" size="l" href="/dashboard/add-campaign">
          Add campaign
        </Button>
      </div>
      <MyCampaignsTable />
    </FadeIn>
  );
}
