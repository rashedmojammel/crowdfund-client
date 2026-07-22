"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as GravityThemeProvider } from "@gravity-ui/uikit";
import { SessionSync } from "@/components/auth/SessionSync";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/useTheme";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );
  // Gravity UI components still in use (MIGRATION.md backlog — Select,
  // Dialog, …) throw "useTheme* hooks must be used within ThemeProvider"
  // without this. Synced to the app's own .dark-class theme (hooks/useTheme)
  // rather than Gravity's own toggle, so both systems agree.
  const { theme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <GravityThemeProvider theme={theme ?? "light"}>
        <SessionSync />
        {children}
        <Toaster />
      </GravityThemeProvider>
    </QueryClientProvider>
  );
}
