"use client";

// Dark mode = .dark class on <html>, persisted under "fundspark-theme".
// The no-flash script in app/layout.tsx applies the initial class before
// hydration; this hook only reads and toggles it afterwards.

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "fundspark-theme";
const CHANGE_EVENT = "fundspark-theme-change";

const readTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export function useTheme() {
  // null until mounted — the server can't know the visitor's theme.
  const [theme, setThemeState] = useState<Theme | null>(null);

  useEffect(() => {
    setThemeState(readTheme());
    const onChange = () => setThemeState(readTheme());
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

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
