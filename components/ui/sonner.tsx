"use client";

// shadcn's generated sonner wrapper depends on next-themes; this one wires
// into our class-based useTheme instead so toasts match the active theme.

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "@/hooks/useTheme";

export function Toaster(props: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme ?? "system"}
      className="toaster group"
      position="bottom-right"
      richColors
      closeButton
      {...props}
    />
  );
}
