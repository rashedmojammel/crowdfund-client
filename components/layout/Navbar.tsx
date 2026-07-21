"use client";

import Link from "next/link";
import { Avatar, Button, Label, Skeleton } from "@gravity-ui/uikit";
import { useSessionStore } from "@/lib/store";

/**
 * Role-aware top navigation. The auth area renders a fixed-size skeleton
 * until the persisted session hydrates — no layout shift, and no SSR/client
 * hydration mismatch from reading localStorage.
 */
export function Navbar() {
  const user = useSessionStore((s) => s.user);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--g-color-line-generic)] bg-[var(--g-color-base-background)]">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold" aria-label="FundSpark home">
            Fund<span className="text-[var(--g-color-text-brand)]">Spark</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/" className="opacity-80 transition-opacity hover:opacity-100">
              Home
            </Link>
            <Link href="/explore" className="opacity-80 transition-opacity hover:opacity-100">
              Explore
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!hasHydrated ? (
            <Skeleton className="h-8 w-40 rounded-lg" />
          ) : user ? (
            <>
              <span className="hidden sm:block">
                <Label theme="success">{user.credits.toLocaleString("en-US")} credits</Label>
              </span>
              <Button view="action" size="m" href="/dashboard">
                Dashboard
              </Button>
              <Avatar imgUrl={user.image} text={user.name} size="m" aria-label={user.name} />
            </>
          ) : (
            <>
              <Button view="flat" size="m" href="/login">
                Log in
              </Button>
              <Button view="action" size="m" href="/register">
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
