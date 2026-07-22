"use client";

// AUTH GUARD for the whole /dashboard tree. Waits for the real BetterAuth
// session to resolve (isPending) before deciding anything — redirecting
// while it's still pending would bounce every reload back to /login
// (forbidden by CLAUDE.md).

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/lib/auth-client";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, isPending, refetch: refetchSession } = useSession();
  const user = data?.user;
  const bonusRequested = useRef(false);

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  // Safety net for the signup bonus: RegisterForm calls this right after
  // sign-up, but Google sign-in redirects through Google with no in-page
  // callback to hook, so it never gets a chance to. Idempotent on the
  // server, so it's safe to call again here whenever a session shows up
  // without its bonus flag set.
  useEffect(() => {
    if (user && user.signupBonusGranted === false && !bonusRequested.current) {
      bonusRequested.current = true;
      apiFetch("/auth/grant-signup-bonus", { method: "POST" })
        .then(() => refetchSession())
        .catch(() => {
          bonusRequested.current = false;
        });
    }
  }, [user, refetchSession]);

  if (isPending || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Loading your session…</span>
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
      <CommandPalette />
    </div>
  );
}
