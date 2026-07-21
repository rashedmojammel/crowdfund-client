"use client";

import { Alert } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { CampaignApprovalsTable } from "@/components/dashboard/admin/CampaignApprovalsTable";
import { ManageCampaignsTable } from "@/components/dashboard/admin/ManageCampaignsTable";
import { useSessionStore } from "@/lib/store";

export default function ManageCampaignsPage() {
  const user = useSessionStore((s) => s.user);
  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <Alert theme="info" title="Admins only" message="This page is for platform administrators." />
    );
  }

  return (
    <FadeIn className="flex flex-col gap-8">
      <div>
        <h2>Manage Campaigns</h2>
        <p className="mt-2 text-sm opacity-70">
          Review new submissions, and remove campaigns that break the rules — deletions
          refund every approved backer automatically.
        </p>
      </div>

      <section aria-labelledby="approvals-heading">
        <h3 id="approvals-heading">Waiting for approval</h3>
        <div className="mt-4">
          <CampaignApprovalsTable />
        </div>
      </section>

      <section aria-labelledby="all-campaigns-heading">
        <h3 id="all-campaigns-heading">All campaigns</h3>
        <div className="mt-4">
          <ManageCampaignsTable />
        </div>
      </section>
    </FadeIn>
  );
}
