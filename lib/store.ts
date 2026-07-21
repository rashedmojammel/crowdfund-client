// Session store for the mock-auth phase. When BetterAuth goes live, its
// useSession() hook replaces this — components should already read the
// session through here so the swap stays contained.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "@/types";

const SESSION_STORAGE_KEY = "fundspark-mock-session";

interface SessionState {
  user: User | null;
  token: string | null;
  /**
   * False until the persisted session has been read back from localStorage.
   * Route guards MUST wait for this to become true before redirecting to
   * /login — redirecting earlier breaks reload on private routes
   * (the "don't redirect while session is loading" rule in CLAUDE.md).
   */
  hasHydrated: boolean;
  setSession: (user: User, token: string) => void;
  /** Patch the cached user, e.g. after a mutation changes their credits. */
  updateUser: (patch: Partial<User>) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasHydrated: false,
      setSession: (user, token) => set({ user, token }),
      updateUser: (patch) =>
        set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
      clearSession: () => set({ user: null, token: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ user, token }) => ({ user, token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
