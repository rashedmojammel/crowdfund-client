"use client";

import Link from "next/link";
// import { Facebook, Linkedin, Send } from "lucide-react";

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

// const socialLinks = [
//   { href: "https://facebook.com/fundspark", label: "FundSpark on Facebook", icon: Facebook },
//   { href: "https://linkedin.com/company/fundspark", label: "FundSpark on LinkedIn", icon: Linkedin },
//   { href: "https://t.me/fundspark", label: "FundSpark on Telegram", icon: Send },
// ];

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container-fs grid gap-8 py-12 md:grid-cols-4 md:gap-6">
        <div className="md:col-span-2">
          <p className="text-xl font-bold">
            Fund<span className="text-primary">Spark</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            A crowdfunding platform where supporters back vetted campaigns with credits and
            creators deliver real change — from solar kits for rural clinics to floating
            libraries.
          </p>
          <div className="mt-6 flex items-center gap-4">
            {/* {socialLinks.map(({ href, label, icon: SocialIcon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <SocialIcon className="size-5" aria-hidden="true" />
              </a>
            ))} */}
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
                  className="text-muted-foreground transition-colors hover:text-foreground"
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
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t">
        <div className="container-fs py-4 text-sm text-muted-foreground">
          © 2026 FundSpark. Crowdfund what matters.
        </div>
      </div>
    </footer>
  );
}
