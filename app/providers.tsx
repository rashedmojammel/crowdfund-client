"use client";

// TODO: add QueryClientProvider (TanStack Query) and Toaster once those
// layers come in — see ARCHITECTURE.md.

import type { ReactNode } from "react";
import { ThemeProvider } from "@gravity-ui/uikit";

export function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider theme="system">{children}</ThemeProvider>;
}
