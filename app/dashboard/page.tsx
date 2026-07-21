"use client";

// Role-aware dashboard home dispatcher: one URL, three role homes.

import { AdminHome } from "@/components/dashboard/admin/AdminHome";
import { CreatorHome } from "@/components/dashboard/creator/CreatorHome";
import { SupporterHome } from "@/components/dashboard/supporter/SupporterHome";
import { useSessionStore } from "@/lib/store";

export default function DashboardHomePage() {
  const user = useSessionStore((s) => s.user);
  if (!user) return null; // guard in layout.tsx handles the redirect

  switch (user.role) {
    case "creator":
      return <CreatorHome />;
    case "admin":
      return <AdminHome />;
    default:
      return <SupporterHome />;
  }
}
