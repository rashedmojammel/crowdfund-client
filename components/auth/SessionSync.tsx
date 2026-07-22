"use client";

// Mirrors the real BetterAuth session into lib/store.ts for the
// still-mock-backed feature components that read the current user from
// there. See lib/store.ts for why this bridge exists. Renders nothing.

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useSessionStore } from "@/lib/store";
import type { User, UserRole } from "@/types";

export function SessionSync() {
  const { data, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (data?.user) {
      const sessionUser = data.user;
      const user: User = {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role as UserRole,
        credits: sessionUser.credits,
        image: sessionUser.image ?? undefined,
        signupBonusGranted: sessionUser.signupBonusGranted,
        createdAt: new Date(sessionUser.createdAt).toISOString(),
      };
      useSessionStore.getState().setSession(user, null);
    } else {
      useSessionStore.getState().clearSession();
    }
    useSessionStore.getState().setHasHydrated(true);
  }, [data, isPending]);

  return null;
}
