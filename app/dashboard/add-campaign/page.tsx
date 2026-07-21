"use client";

import { Alert } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { AddCampaignForm } from "@/components/dashboard/creator/AddCampaignForm";
import { useSessionStore } from "@/lib/store";

export default function AddCampaignPage() {
  const user = useSessionStore((s) => s.user);
  if (!user) return null;

  if (user.role !== "creator") {
    return (
      <Alert
        theme="info"
        title="Creators only"
        message="Only creator accounts can launch campaigns. Register as a creator to start one."
      />
    );
  }

  return (
    <FadeIn className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h2>Add Campaign</h2>
        <p className="mt-2 text-sm opacity-70">
          Tell supporters what you&rsquo;re building. Campaigns are reviewed by an admin
          before going live.
        </p>
      </div>
      <AddCampaignForm />
    </FadeIn>
  );
}
