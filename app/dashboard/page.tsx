"use client";

// Role-aware dashboard home dispatcher. CreatorHome and AdminHome replace
// the placeholder branches as those flows are built.

import { FadeIn } from "@/components/animations/FadeIn";
import { SupporterHome } from "@/components/dashboard/supporter/SupporterHome";
import { formatCredits } from "@/lib/format";
import { useSessionStore } from "@/lib/store";

export default function DashboardHomePage() {
  const user = useSessionStore((s) => s.user);
  if (!user) return null; // guard in layout.tsx handles the redirect

  if (user.role === "supporter") {
    return <SupporterHome />;
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
