"use client";

import Link from "next/link";
import { Icon } from "@gravity-ui/uikit";
import { LogoFacebook, LogoLinkedin, LogoTelegram } from "@gravity-ui/icons";

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
  { href: "https://facebook.com/fundspark", label: "FundSpark on Facebook", icon: LogoFacebook },
  { href: "https://linkedin.com/company/fundspark", label: "FundSpark on LinkedIn", icon: LogoLinkedin },
  { href: "https://t.me/fundspark", label: "FundSpark on Telegram", icon: LogoTelegram },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--g-color-line-generic)]">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4 md:gap-6">
        <div className="md:col-span-2">
          <p className="text-xl font-bold">
            Fund<span className="text-[var(--g-color-text-brand)]">Spark</span>
          </p>
          <p className="mt-3 max-w-sm text-sm opacity-70">
            A crowdfunding platform where supporters back vetted campaigns with credits and
            creators deliver real change — from solar kits for rural clinics to floating
            libraries.
          </p>
          <div className="mt-6 flex items-center gap-4">
            {socialLinks.map(({ href, label, icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="opacity-60 transition-opacity hover:opacity-100"
              >
                <Icon data={icon} size={20} />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Explore">
          <h4 className="text-sm font-medium uppercase tracking-wide opacity-60">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {exploreLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="opacity-80 transition-opacity hover:opacity-100">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h4 className="text-sm font-medium uppercase tracking-wide opacity-60">Account</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {accountLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="opacity-80 transition-opacity hover:opacity-100">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-[var(--g-color-line-generic)]">
        <div className="container-page py-4 text-sm opacity-60">
          © 2026 FundSpark. Crowdfund what matters.
        </div>
      </div>
    </footer>
  );
}
