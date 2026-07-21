"use client";

// AUTH GUARD for the whole /dashboard tree. Waits for the persisted session
// to hydrate before deciding anything — redirecting while hasHydrated is
// false would bounce every reload back to /login (forbidden by CLAUDE.md).
// DashboardSidebar / DashboardTopBar slot in here later.

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@gravity-ui/uikit";
import { useSessionStore } from "@/lib/store";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace("/login");
    }
  }, [hasHydrated, user, router]);

  if (!hasHydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader size="l" />
      </div>
    );
  }

  return <>{children}</>;
}
