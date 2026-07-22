"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { UpdateCampaignForm } from "@/components/dashboard/creator/UpdateCampaignForm";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/store";
import type { Campaign } from "@/types";

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useSessionStore((s) => s.user);

  const { data, isPending, isError } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => apiFetch<{ campaign: Campaign }>(`/campaigns/${id}`),
    enabled: Boolean(user),
  });
  const campaign = data?.campaign;

  if (!user) return null;

  if (isPending) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <Alert
        theme="danger"
        title="Campaign not found"
        message="This campaign may have been removed, or the link is incorrect."
        actions={<Alert.Action href="/dashboard/my-campaigns">Back to my campaigns</Alert.Action>}
      />
    );
  }

  if (campaign.creatorEmail !== user.email && user.role !== "admin") {
    return (
      <Alert
        theme="warning"
        title="Not your campaign"
        message="You can only edit campaigns you created."
        actions={<Alert.Action href="/dashboard/my-campaigns">Back to my campaigns</Alert.Action>}
      />
    );
  }

  return (
    <FadeIn className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h2>Update Campaign</h2>
        <p className="mt-2 text-sm opacity-70">
          Only the title, story, and reward can change after submission — goal, category,
          deadline, and cover image are locked.
        </p>
      </div>
      <UpdateCampaignForm campaign={campaign} />
    </FadeIn>
  );
}
