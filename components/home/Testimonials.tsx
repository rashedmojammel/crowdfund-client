"use client";

// Marquee testimonial wall (replaces the Swiper carousel) — two rows
// scrolling opposite directions, edge-faded via mask-image. Pattern
// referenced from 21st.dev's "Testimonials with Marquee" listings during
// research; implementation is original (see MIGRATION.md).

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Marquee } from "@/components/ui/marquee";
import { FadeIn } from "@/components/animations/FadeIn";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const testimonials = [
  {
    name: "Samiha Noor",
    role: "Supporter since May 2026",
    image: "https://i.pravatar.cc/150?u=supporter@test.com",
    quote:
      "I backed the SolarBridge clinic kits with 200 credits and got field photos from Kanaighat two weeks later. It's the first platform where I actually saw where my money went.",
  },
  {
    name: "Farhan Kabir",
    role: "Creator — Pages for All",
    image: "https://i.pravatar.cc/150?u=creator@test.com",
    quote:
      "Pages for All reached 97% of its goal in eleven weeks. The credit system kept contributions small and steady instead of one big spike, which made planning the boat conversion much easier.",
  },
  {
    name: "Nadia Rahman",
    role: "Creator — CodeCamp Chattogram",
    image: "https://i.pravatar.cc/150?u=nadia.rahman@fundspark.dev",
    quote:
      "Reviewing each contribution by hand sounded tedious. It's actually what builds trust — my backers know a person acknowledged every single credit.",
  },
  {
    name: "Mehnaz Karim",
    role: "Supporter since June 2026",
    image: "https://i.pravatar.cc/150?u=mehnaz.karim@fundspark.dev",
    quote:
      "The category pages make it easy to find the causes I follow. I set aside 300 credits a month and split them between education and environment campaigns.",
  },
  {
    name: "Arif Chowdhury",
    role: "Creator — Mangrove Guardians",
    image: "https://i.pravatar.cc/150?u=arif.chowdhury@fundspark.dev",
    quote:
      "I requested my first payout on a Monday and it was marked paid by Wednesday. Transparent rates, no surprises — 20 credits to the dollar, exactly as advertised.",
  },
];

function TestimonialCard({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <figure className="card-elevate flex w-80 shrink-0 flex-col gap-4 rounded-xl bg-card p-6">
      <blockquote className="grow text-sm leading-relaxed text-foreground/90">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <Avatar aria-label={t.name}>
          <AvatarImage src={t.image} alt="" />
          <AvatarFallback>{initials(t.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-sm text-muted-foreground">{t.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const reversed = [...testimonials].reverse();

  return (
    <section aria-labelledby="testimonials-heading" className="container-fs">
      <FadeIn className="text-center">
        <h2 id="testimonials-heading">What our community says</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Supporters and creators on what funding through FundSpark feels like.
        </p>
      </FadeIn>

      <div
        className="mt-12 flex flex-col gap-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      >
        <Marquee durationSeconds={45}>
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </Marquee>
        <Marquee reverse durationSeconds={50}>
          {reversed.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
