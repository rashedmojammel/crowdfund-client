"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button, Icon } from "@gravity-ui/uikit";
import { Bars, Xmark } from "@gravity-ui/icons";
import { getDashboardNav, isNavItemActive } from "@/components/layout/dashboard-nav";
import { SIGNATURE_EASE } from "@/components/animations/FadeIn";
import { useDismissable } from "@/hooks/useDismissable";
import { useSessionStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Hamburger + slide-in drawer for dashboard navigation under 768px. */
export function MobileNav() {
  const pathname = usePathname();
  const user = useSessionStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useDismissable(panelRef, open, () => setOpen(false));

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className="md:hidden">
      <Button view="flat" size="l" onClick={() => setOpen(true)} aria-label="Open navigation menu">
        <Icon data={Bars} size={18} />
      </Button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="overlay"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <motion.aside
              key="panel"
              ref={panelRef}
              role="dialog"
              aria-label="Dashboard navigation"
              initial={{ x: reduceMotion ? 0 : "-100%", opacity: reduceMotion ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: reduceMotion ? 0 : "-100%", opacity: reduceMotion ? 0 : 1 }}
              transition={{ duration: 0.3, ease: SIGNATURE_EASE }}
              className="shadow-modal fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[var(--g-color-base-background)]"
            >
              <div className="flex h-16 items-center justify-between border-b border-[var(--g-color-line-generic)] px-4">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="text-xl font-bold"
                  aria-label="FundSpark home"
                >
                  Fund<span className="text-[var(--g-color-text-brand)]">Spark</span>
                </Link>
                <Button view="flat" size="l" onClick={() => setOpen(false)} aria-label="Close menu">
                  <Icon data={Xmark} size={18} />
                </Button>
              </div>

              <nav aria-label="Dashboard" className="flex grow flex-col gap-1 overflow-y-auto p-4">
                {getDashboardNav(user.role).map((item) => {
                  const active = isNavItemActive(item.href, pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-[var(--g-color-base-selection)] font-semibold"
                          : "hover:bg-[var(--g-color-base-simple-hover)]"
                      )}
                    >
                      <Icon data={item.icon} size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
