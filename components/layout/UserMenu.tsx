"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, Icon } from "@gravity-ui/uikit";
import { ArrowRightFromSquare, House } from "@gravity-ui/icons";
import { useDismissable } from "@/hooks/useDismissable";
import { useSessionStore } from "@/lib/store";

export function UserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useSessionStore((s) => s.user);
  const clearSession = useSessionStore((s) => s.clearSession);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useDismissable(containerRef, open, () => setOpen(false));

  if (!user) return null;

  const handleLogout = () => {
    clearSession();
    queryClient.clear(); // drop the previous user's cached data
    router.replace("/login");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Account menu for ${user.name}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex cursor-pointer items-center rounded-full"
      >
        <Avatar imgUrl={user.image} text={user.name} size="m" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Account menu"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }}
            transition={{ duration: 0.2 }}
            className="shadow-modal absolute right-0 top-12 z-50 w-64 origin-top-right rounded-xl bg-[var(--g-color-base-float)]"
          >
            <div className="border-b border-[var(--g-color-line-generic)] px-4 py-3">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-sm opacity-60">{user.email}</p>
            </div>
            <div className="p-2">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--g-color-base-simple-hover)]"
              >
                <Icon data={House} size={16} />
                Back to FundSpark
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--g-color-text-danger)] transition-colors hover:bg-[var(--g-color-base-simple-hover)]"
              >
                <Icon data={ArrowRightFromSquare} size={16} />
                Log out
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
