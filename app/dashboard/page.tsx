"use client";

// Role-aware dashboard home dispatcher: one URL, three role homes.

import { AdminHome } from "@/components/dashboard/admin/AdminHome";
import { CreatorHome } from "@/components/dashboard/creator/CreatorHome";
import { SupporterHome } from "@/components/dashboard/supporter/SupporterHome";
import { useSession } from "@/lib/auth-client";

export default function DashboardHomePage() {
  const { data } = useSession();
  const user = data?.user;
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
