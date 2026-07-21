"use client";

// AUTH GUARD for the whole /dashboard tree. Waits for the persisted session
// to hydrate before deciding anything — redirecting while hasHydrated is
// false would bounce every reload back to /login (forbidden by CLAUDE.md).

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@gravity-ui/uikit";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
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

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex min-w-0 grow flex-col">
        <DashboardTopBar />
        <main className="grow px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
