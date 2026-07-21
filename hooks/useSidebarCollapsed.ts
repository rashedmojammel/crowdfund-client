"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "fundspark-sidebar-collapsed";

/** Persisted icon-only/expanded toggle for the desktop dashboard sidebar. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // localStorage unavailable — default to expanded for the session
    }
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Report expanded until mounted so SSR/first paint matches the full sidebar.
  return { collapsed: mounted && collapsed, toggle, mounted };
}
