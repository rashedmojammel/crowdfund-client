"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn, FOCUS_RING } from "@/lib/utils";

// Real, working Unsplash photos (not stand-ins for real users) — purely
// decorative social-proof avatars for the branding panel.
const PROOF = [
  {
    initials: "S",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&facepad=2&w=80&h=80&q=80",
  },
  {
    initials: "C",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&facepad=2&w=80&h=80&q=80",
  },
  {
    initials: "A",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&facepad=2&w=80&h=80&q=80",
  },
];

interface AuthSplitCardProps {
  /** Headline on the branding panel (hidden on mobile). */
  headline: string;
  formTitle: string;
  formSubtitle: string;
  /** OAuth button + divider + the actual form. */
  children: ReactNode;
  /** "New to FundSpark? / Already have an account?" line. */
  footer: ReactNode;
}

/**
 * Shared two-column shell for /login and /register: a branding panel on
 * the left (hidden below md — the form is what matters on mobile) and a
 * form slot on the right. Only copy and form content differ between the
 * two pages.
 */
export function AuthSplitCard({
  headline,
  formTitle,
  formSubtitle,
  children,
  footer,
}: AuthSplitCardProps) {
  return (
    <Card className="grid w-full gap-0 overflow-hidden p-0 md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-b from-primary to-primary/80 p-10 text-primary-foreground md:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary-foreground/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
            <div className="size-3 rotate-45 rounded-[3px] bg-primary-foreground" />
          </div>
          <Link
            href="/"
            className={cn("rounded text-sm font-semibold tracking-tight", FOCUS_RING)}
          >
            Fund<span className="opacity-80">Spark</span>
          </Link>
        </div>

        <h2 className="relative mt-auto max-w-[18ch] text-balance text-[26px] font-semibold leading-[1.15] tracking-tight text-primary-foreground">
          {headline}
        </h2>

        <div className="relative mt-8 flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {PROOF.map((p) => (
              <Avatar key={p.initials} className="ring-2 ring-primary/60" size="sm">
                <AvatarImage src={p.src} alt="" className="object-cover" />
                <AvatarFallback className="bg-primary-foreground text-[10px] font-medium text-primary">
                  {p.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-xs text-primary-foreground/85">
            Supporters and creators funding real projects
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-5 p-8">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold">{formTitle}</span>
          <span className="text-xs text-muted-foreground">{formSubtitle}</span>
        </div>

        {children}

        {footer}
      </div>
    </Card>
  );
}
