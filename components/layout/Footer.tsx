"use client";

import Link from "next/link";
import { Facebook, Linkedin, Send } from "lucide-react";

const exploreLinks = [
  { href: "/explore", label: "All campaigns" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#categories", label: "Categories" },
];

const accountLinks = [
  { href: "/register", label: "Start a campaign" },
  { href: "/login", label: "Log in" },
  { href: "/dashboard", label: "Dashboard" },
];

const socialLinks = [
  { href: "https://facebook.com/fundspark", label: "FundSpark on Facebook", icon: Facebook },
  { href: "https://linkedin.com/company/fundspark", label: "FundSpark on LinkedIn", icon: Linkedin },
  { href: "https://t.me/fundspark", label: "FundSpark on Telegram", icon: Send },
];

export function Footer() {
  return (
    <footer className="relative border-t">
      {/* Subtle accent line — decorative only. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="container-fs grid gap-10 py-16 md:grid-cols-4 md:gap-8">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
              F
            </span>
            Fund<span className="text-primary">Spark</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A crowdfunding platform where supporters back vetted campaigns with credits and
            creators deliver real change — from solar kits for rural clinics to floating
            libraries.
          </p>
          <div className="mt-6 flex items-center gap-2">
            {socialLinks.map(({ href, label, icon: SocialIcon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <SocialIcon className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Explore">
          <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Explore
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {exploreLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Account
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {accountLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t">
        <div className="container-fs flex flex-col items-center justify-between gap-2 py-4 text-sm text-muted-foreground sm:flex-row">
          <span>© 2026 FundSpark. Crowdfund what matters.</span>
        </div>
      </div>
    </footer>
  );
}
