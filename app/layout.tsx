import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FundSpark — Crowdfund what matters",
  description:
    "FundSpark connects supporters with creators raising funds for community, education, health, environment, technology, and creative projects.",
};

// Applies the saved (or system) theme before hydration so dark mode never
// flashes. Kept tiny and inline on purpose.
const themeInitScript = `(function(){try{var t=localStorage.getItem("fundspark-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the theme script mutates <html> pre-hydration.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* App Router manages <head> itself — beforeInteractive scripts must
            be siblings of children, not nested in a hand-authored <head>,
            or Next stops hoisting them and React warns about a raw script. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
