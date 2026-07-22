// Read-only mirror of the real BetterAuth session (see lib/auth-client.ts).
// Nothing here persists to localStorage — ~30 feature components read
// "who's the current user" via useSessionStore rather than calling
// useSession() directly, so <SessionSync> (components/auth/SessionSync.tsx,
// mounted once in app/providers.tsx) keeps this store in sync with the real
// session instead.
//
// Navbar, DashboardTopBar, the dashboard layout guard, and the role
// dispatcher read useSession() directly instead of this mirror.

import { create } from "zustand";
import type { User } from "@/types";

interface SessionState {
  user: User | null;
  token: string | null;
  /**
   * False until the real session's first isPending resolution. Route guards
   * MUST wait for this to become true before redirecting to /login —
   * redirecting earlier breaks reload on private routes (the "don't
   * redirect while session is loading" rule in CLAUDE.md).
   */
  hasHydrated: boolean;
  setSession: (user: User, token: string | null) => void;
  /** Patch the cached user, e.g. after a mutation changes their credits. */
  updateUser: (patch: Partial<User>) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  user: null,
  token: null,
  hasHydrated: false,
  setSession: (user, token) => set({ user, token }),
  updateUser: (patch) =>
    set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
  clearSession: () => set({ user: null, token: null }),
  setHasHydrated: (value) => set({ hasHydrated: value }),
}));
