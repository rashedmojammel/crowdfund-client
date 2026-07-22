"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useSession } from "@/lib/auth-client";
import { formatCredits } from "@/lib/format";
import { cn, FOCUS_RING } from "@/lib/utils";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/**
 * Role-aware top navigation. The auth area renders a fixed-size skeleton
 * while the BetterAuth session is resolving — no layout shift, and no
 * flash between "logged out" and "logged in" while that resolves.
 */
export function Navbar() {
  const { data, isPending } = useSession();
  const user = data?.user;

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container-fs flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className={cn("rounded text-xl font-bold", FOCUS_RING)}
            aria-label="FundSpark home"
          >
            Fund<span className="text-primary">Spark</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="/"
              className={cn(
                "rounded text-muted-foreground transition-colors hover:text-foreground",
                FOCUS_RING
              )}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={cn(
                "rounded text-muted-foreground transition-colors hover:text-foreground",
                FOCUS_RING
              )}
            >
              Explore
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isPending ? (
            <Skeleton className="h-9 w-40 rounded-lg" />
          ) : user ? (
            <>
              <Badge
                variant="outline"
                className="hidden border-[var(--fs-success)]/40 text-[var(--fs-success)] sm:inline-flex"
              >
                {formatCredits(user.credits)}
              </Badge>
              <Button asChild size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Avatar aria-label={user.name}>
                <AvatarImage src={user.image ?? undefined} alt="" />
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
