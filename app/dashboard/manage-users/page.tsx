"use client";

import { Alert } from "@gravity-ui/uikit";
import { FadeIn } from "@/components/animations/FadeIn";
import { ManageUsersTable } from "@/components/dashboard/admin/ManageUsersTable";
import { useSessionStore } from "@/lib/store";

export default function ManageUsersPage() {
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
        <h2>Manage Users</h2>
        <p className="mt-2 text-sm opacity-70">
          Change a user&rsquo;s role with the dropdown — they&rsquo;re notified immediately.
          Admin accounts and your own can&rsquo;t be deleted.
        </p>
      </div>
      <ManageUsersTable />
    </FadeIn>
  );
}
