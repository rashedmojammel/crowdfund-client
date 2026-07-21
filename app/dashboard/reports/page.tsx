"use client";

import { Alert } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { ReportsTable } from "@/components/dashboard/admin/ReportsTable";
import { useSessionStore } from "@/lib/store";

export default function ReportsPage() {
  const user = useSessionStore((s) => s.user);
  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <Alert theme="info" title="Admins only" message="This page is for platform administrators." />
    );
  }

  return (
    <FadeIn className="flex flex-col gap-6">
      <div>
        <h2>Reports</h2>
        <p className="mt-2 text-sm opacity-70">
          Flags filed by the community, open ones first. Suspending or deleting the campaign
          resolves the report; dismiss it if the campaign checks out.
        </p>
      </div>
      <ReportsTable />
    </FadeIn>
  );
}
