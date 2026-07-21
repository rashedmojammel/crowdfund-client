"use client";

// Role-aware dashboard home dispatcher. AdminHome replaces the placeholder
// branch when the admin flow is built.

import { FadeIn } from "@/components/animations/FadeIn";
import { CreatorHome } from "@/components/dashboard/creator/CreatorHome";
import { SupporterHome } from "@/components/dashboard/supporter/SupporterHome";
import { formatCredits } from "@/lib/format";
import { useSessionStore } from "@/lib/store";

export default function DashboardHomePage() {
  const user = useSessionStore((s) => s.user);
  if (!user) return null; // guard in layout.tsx handles the redirect

  if (user.role === "supporter") {
    return <SupporterHome />;
  }

  if (user.role === "creator") {
    return <CreatorHome />;
  }

  return (
    <FadeIn>
      <h2>Welcome back, {user.name.split(" ")[0]}</h2>
      <p className="mt-2 max-w-xl text-sm opacity-70">
        You have {formatCredits(user.credits)} available. Your {user.role} tools are in the
        sidebar — the {user.role} overview with stats and tables lands here next.
      </p>
    </FadeIn>
  );
}
