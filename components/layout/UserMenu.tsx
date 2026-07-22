"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { House, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDismissable } from "@/hooks/useDismissable";
import { authClient } from "@/lib/auth-client";
import { useSessionStore } from "@/lib/store";
import { cn, FOCUS_RING } from "@/lib/utils";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function UserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useSessionStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useDismissable(containerRef, open, () => setOpen(false));

  if (!user) return null;

  const handleLogout = async () => {
    await authClient.signOut();
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
        className={cn("flex cursor-pointer items-center rounded-full", FOCUS_RING)}
      >
        <Avatar>
          <AvatarImage src={user.image} alt="" />
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
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
            className="absolute right-0 top-12 z-50 w-64 origin-top-right rounded-xl border bg-popover text-popover-foreground shadow-xl"
          >
            <div className="border-b px-4 py-3">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="p-2">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                  FOCUS_RING
                )}
              >
                <House className="size-4" aria-hidden="true" />
                Back to FundSpark
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-muted",
                  FOCUS_RING
                )}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
