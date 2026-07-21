"use client";

// Dark mode = .dark class on <html>, persisted under "fundspark-theme".
// The no-flash script in app/layout.tsx applies the initial class before
// hydration; this hook only reads and toggles it afterwards.
//
// Uses useSyncExternalStore (not useState+useEffect) so React itself
// manages the SSR-safe read of this browser-only value — avoids the
// "setState synchronously in an effect" anti-pattern for a value that
// doesn't exist during server rendering.

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "fundspark-theme";
const CHANGE_EVENT = "fundspark-theme-change";

const readTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CHANGE_EVENT, onStoreChange);
};

// Server has no DOM/theme — null until the client snapshot takes over.
const getServerSnapshot = (): Theme | null => null;

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private mode) — theme still applies for the session
    }
    // Keep every useTheme() instance (toggle, toaster, …) in sync.
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
