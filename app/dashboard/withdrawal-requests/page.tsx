"use client";

import { Alert } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { WithdrawalRequestsTable } from "@/components/dashboard/admin/WithdrawalRequestsTable";
import { useSessionStore } from "@/lib/store";

export default function WithdrawalRequestsPage() {
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
        <h2>Withdrawal Requests</h2>
        <p className="mt-2 text-sm opacity-70">
          Creator payouts at 20 credits = $1. Send the money through the listed method, then
          mark the request paid — the creator is notified automatically.
        </p>
      </div>
      <WithdrawalRequestsTable />
    </FadeIn>
  );
}
