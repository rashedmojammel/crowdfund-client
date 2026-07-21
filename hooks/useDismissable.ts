"use client";

import { useEffect, type RefObject } from "react";

/**
 * Calls `onDismiss` when the user clicks/taps outside `ref` or presses
 * Escape. Used by popovers (notification bell, user menu) and drawers.
 */
export function useDismissable(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: () => void
) {
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (el && event.target instanceof Node && !el.contains(event.target)) {
        onDismiss();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, active, onDismiss]);
}
