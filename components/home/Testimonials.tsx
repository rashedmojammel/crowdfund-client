"use client";

import { useReducedMotion } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function Testimonials() {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="testimonials-heading" className="container-fs">
      <FadeIn className="text-center">
        <h2 id="testimonials-heading">What our community says</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Supporters and creators on what funding through FundSpark feels like.
        </p>
      </FadeIn>

      <div className="mt-12">
        <Swiper
          modules={[Autoplay]}
          autoplay={reduceMotion ? false : { delay: 5000, disableOnInteraction: false }}
          loop
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.name} className="h-auto">
              <figure className="card-elevate flex h-full flex-col gap-4 rounded-xl bg-card p-6">
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
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
