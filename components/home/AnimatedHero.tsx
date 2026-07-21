"use client";

// Hand-built hero (21st.dev's paid marketplace tier didn't have a free-tier
// match that fit our warm-neutral/coral palette — see MIGRATION.md for the
// evaluation notes). Layered gradient blobs give it motion without photos;
// three headlines cycle on the same signature easing as the rest of the app.

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNATURE_EASE } from "@/components/animations/FadeIn";
import { Pressable } from "@/components/animations/Pressable";
import { cn, FOCUS_RING } from "@/lib/utils";

const slides = [
  {
    heading: "Back the ideas your community needs",
    subtitle:
      "Support vetted campaigns with credits. Every contribution is reviewed by the creator, tracked in your dashboard, and refunded if it isn't accepted.",
    cta: { href: "/explore", label: "Explore campaigns" },
    secondary: { href: "/register", label: "Join as a supporter" },
  },
  {
    heading: "Turn your project into a movement",
    subtitle:
      "Launch a campaign in minutes, reach thousands of supporters, and withdraw your earnings securely once contributions roll in.",
    cta: { href: "/register", label: "Start a campaign" },
    secondary: { href: "/explore", label: "See what's live" },
  },
  {
    heading: "Every credit counts",
    subtitle:
      "From solar kits for rural clinics to floating libraries on the Jamuna — small contributions add up to real, visible change.",
    cta: { href: "/explore", label: "Fund a campaign" },
    secondary: { href: "/#how-it-works", label: "How it works" },
  },
];

const AUTOPLAY_MS = 6000;

/** Slow-drifting blurred color fields — decorative, aria-hidden, static under reduced motion. */
function GradientBlobs({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-24 -top-32 size-[420px] rounded-full bg-primary/25 blur-3xl dark:bg-primary/20"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 40, -10, 0], y: [0, 30, 60, 0], scale: [1, 1.08, 0.96, 1] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-32 top-10 size-[380px] rounded-full bg-[var(--fs-accent-subtle)] blur-3xl dark:bg-primary/10"
        animate={
          reduceMotion ? undefined : { x: [0, -30, 20, 0], y: [0, 40, -20, 0] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-140px] left-1/3 size-[460px] rounded-full bg-secondary blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, 25, -25, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function AnimatedHero() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  const slide = slides[index];

  return (
    <section aria-label="Featured" className="relative overflow-hidden bg-background">
      <GradientBlobs reduceMotion={Boolean(reduceMotion)} />

      <div className="container-fs relative flex min-h-[480px] flex-col items-center justify-center py-20 text-center md:min-h-[560px]">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: SIGNATURE_EASE }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground"
        >
          12,480+ supporters already backing projects
        </motion.span>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -16 }}
            transition={{ duration: 0.5, ease: SIGNATURE_EASE }}
            className="max-w-3xl"
          >
            <h1 className="text-balance">{slide.heading}</h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Pressable>
            <Button size="lg" asChild>
              <Link href={slide.cta.href}>
                {slide.cta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Pressable>
          <Button size="lg" variant="outline" asChild>
            <Link href={slide.secondary.href}>{slide.secondary.label}</Link>
          </Button>
        </div>

        <div className="mt-10 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.heading}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show headline ${i + 1} of ${slides.length}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground",
                FOCUS_RING
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
