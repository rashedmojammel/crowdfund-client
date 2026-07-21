"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@gravity-ui/uikit";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { SIGNATURE_EASE } from "@/components/animations/FadeIn";
import { Pressable } from "@/components/animations/Pressable";
import { BLUR_DATA_URL } from "@/lib/constants";

const slides = [
  {
    image: "https://picsum.photos/seed/fundspark-hero-community/1920/1080",
    imageAlt: "Volunteers working together on a community project",
    heading: "Back the ideas your community needs",
    subtitle:
      "Support vetted campaigns with credits. Every contribution is reviewed by the creator, tracked in your dashboard, and refunded if it isn't accepted.",
    cta: { href: "/explore", label: "Explore campaigns" },
    secondary: { href: "/register", label: "Join as a supporter" },
  },
  {
    image: "https://picsum.photos/seed/fundspark-hero-creator/1920/1080",
    imageAlt: "A creator presenting a project plan on a whiteboard",
    heading: "Turn your project into a movement",
    subtitle:
      "Launch a campaign in minutes, reach thousands of supporters, and withdraw your earnings securely once contributions roll in.",
    cta: { href: "/register", label: "Start a campaign" },
    secondary: { href: "/explore", label: "See what's live" },
  },
  {
    image: "https://picsum.photos/seed/fundspark-hero-impact/1920/1080",
    imageAlt: "Solar panels being installed at a rural health clinic",
    heading: "Every credit counts",
    subtitle:
      "From solar kits for rural clinics to floating libraries on the Jamuna — small contributions add up to real, visible change.",
    cta: { href: "/explore", label: "Fund a campaign" },
    secondary: { href: "/#how-it-works", label: "How it works" },
  },
];

export function HeroSlider() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section aria-label="Featured">
      <Swiper
        className="hero-swiper"
        modules={[Autoplay, Pagination]}
        pagination={{ clickable: true }}
        autoplay={reduceMotion ? false : { delay: 6000, disableOnInteraction: false }}
        loop
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.heading}>
            <div className="relative flex h-[440px] items-center md:h-[540px]">
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
              {/* Scrim for WCAG-passing text contrast over photos. */}
              <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

              <motion.div
                className="container-page relative text-white"
                initial={false}
                animate={
                  activeIndex === index
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: reduceMotion ? 0 : 16 }
                }
                transition={{ duration: 0.6, ease: SIGNATURE_EASE }}
              >
                <div className="max-w-2xl">
                  <h2 className="text-balance md:text-[40px] md:leading-[1.2]">
                    {slide.heading}
                  </h2>
                  <p className="mt-4 max-w-xl text-base opacity-90">{slide.subtitle}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Pressable>
                      <Button view="action" size="xl" href={slide.cta.href}>
                        {slide.cta.label}
                      </Button>
                    </Pressable>
                    <Button view="outlined-contrast" size="xl" href={slide.secondary.href}>
                      {slide.secondary.label}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
