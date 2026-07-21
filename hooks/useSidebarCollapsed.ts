"use client";

// Persisted icon-only/expanded toggle for the desktop dashboard sidebar.
// Uses useSyncExternalStore so the SSR-unsafe localStorage read doesn't
// need a setState-in-effect (React manages the safe server/client
// snapshot split itself — see hooks/useTheme.ts for the same pattern).

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "fundspark-sidebar-collapsed";
const CHANGE_EVENT = "fundspark-sidebar-collapsed-change";

const readCollapsed = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CHANGE_EVENT, onStoreChange);
};

// Server has no localStorage — report expanded so SSR matches the full sidebar.
const getServerSnapshot = () => false;

export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, getServerSnapshot);

  const toggle = useCallback(() => {
    const next = !readCollapsed();
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { collapsed, toggle };
}
