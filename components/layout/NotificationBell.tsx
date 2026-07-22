"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDismissable } from "@/hooks/useDismissable";
import { apiFetch } from "@/lib/api-client";
import { formatTimeAgo } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types";

export function NotificationBell() {
  const user = useSessionStore((s) => s.user);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useDismissable(containerRef, open, () => setOpen(false));

  const { data: unread } = useQuery({
    queryKey: ["notifications", "unread-count", user?.email],
    queryFn: () => apiFetch<{ count: number }>("/notifications/unread-count"),
    enabled: Boolean(user),
    refetchInterval: 30_000,
  });

  const {
    data: notificationsData,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["notifications", "list", user?.email],
    queryFn: () => apiFetch<{ notifications: AppNotification[] }>("/notifications"),
    enabled: Boolean(user) && open,
  });
  const notifications = notificationsData?.notifications;

  // The real PATCH /notifications marks specific ids read (no bare
  // "mark everything" call) — send every currently-unread id from the list
  // already fetched for this open panel.
  const markAllRead = useMutation({
    mutationFn: () =>
      apiFetch("/notifications", {
        method: "PATCH",
        body: { ids: (notifications ?? []).filter((n) => !n.read).map((n) => n._id) },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const count = unread?.count ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="size-5" aria-hidden="true" />
      </Button>
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground"
        >
          {count > 9 ? "9+" : count}
        </span>
      ) : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 z-50 w-80 origin-top-right rounded-xl border bg-popover text-popover-foreground shadow-xl"
          >
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
              <span className="font-semibold">Notifications</span>
              {count > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={markAllRead.isPending || !notifications}
                  onClick={() => markAllRead.mutate()}
                >
                  {markAllRead.isPending ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : null}
                  Mark all read
                </Button>
              ) : null}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isError ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <TriangleAlert className="size-5 text-destructive" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">Couldn&rsquo;t load notifications.</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Try again
                  </Button>
                </div>
              ) : isPending ? (
                <div className="flex flex-col gap-3 p-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !notifications || notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  You&rsquo;re all caught up — nothing new right now.
                </p>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      className="flex gap-3 border-b px-4 py-3 last:border-b-0"
                    >
                      <span
                        aria-label={n.read ? undefined : "Unread"}
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          n.read ? "bg-transparent" : "bg-primary"
                        )}
                      />
                      <div className="min-w-0">
                        <p className={cn("text-sm leading-snug", !n.read && "font-medium")}>
                          {n.message}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatTimeAgo(n.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
