"use client";

// Placeholder role-aware dashboard home — replaced by the
// SupporterHome / CreatorHome / AdminHome dispatcher later.

import { FadeIn } from "@/components/animations/FadeIn";
import { formatCredits } from "@/lib/format";
import { useSessionStore } from "@/lib/store";

export default function DashboardHomePage() {
  const user = useSessionStore((s) => s.user);
  if (!user) return null; // guard in layout.tsx handles the redirect

  return (
    <FadeIn>
      <h2>Welcome back, {user.name.split(" ")[0]}</h2>
      <p className="mt-2 max-w-xl text-sm opacity-70">
        You have {formatCredits(user.credits)} available. Your {user.role} tools are in the
        sidebar — role-specific stats and tables land on this page next.
      </p>
    </FadeIn>
  );
}
