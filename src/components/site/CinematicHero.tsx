"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Compass, House, Check, ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform, MotionConfig, AnimatePresence } from "motion/react";

const HERO_IMAGES = [
  { src: "/images/villa-esperanza-01.jpeg", alt: "Villa frente a la playa en Wild Coast" },
  { src: "/images/flyboard-vamos-jaco-tours-001.jpg", alt: "Flyboard en el Pacífico de Jacó" },
  { src: "/images/toucan-house-02.jpeg", alt: "Casa moderna con piscina en Wild Coast" },
  { src: "/images/banana-vamos-jaco-tours-001.jpg", alt: "Aventura en bote por la costa de Jacó" },
  { src: "/images/buddha-house-02.jpeg", alt: "Casa de diseño con vista al océano" },
];

const SLIDESHOW_INTERVAL = 5000;

interface CinematicHeroProps {
  badge: string;
  pre: string;
  accent: string;
  sub: string;
  explore: string;
  tours: string;
  proof: string[];
  imageAlt: string;
  priceFrom?: string;
  locale: string;
}

export function CinematicHero({
  badge,
  pre,
  accent,
  sub,
  explore,
  tours,
  proof,
  imageAlt,
  priceFrom,
  locale,
}: CinematicHeroProps) {
  const [current, setCurrent] = useState(0);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 150]);
  const fgY = useTransform(scrollY, [0, 600], [0, -80]);
  const fgOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, SLIDESHOW_INTERVAL);
    return () => clearInterval(id);
  }, [next]);

  const words = pre.split(" ");

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative -mt-16 flex min-h-[calc(85svh+4rem)] items-center overflow-clip pt-[160px] lg:-mt-[100px] lg:min-h-[calc(85svh+100px)] lg:pt-[196px]">
        {/* Background — rotating images with crossfade */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <AnimatePresence mode="sync">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.2, ease: "easeInOut" }, scale: { duration: 6, ease: "easeOut" } }}
              className="absolute inset-0"
            >
              <Image
                src={HERO_IMAGES[current].src}
                alt={HERO_IMAGES[current].alt}
                priority={current === 0}
                fill
                sizes="100vw"
                quality={80}
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Parallax layer for depth */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 pointer-events-none"
          aria-hidden
        />

        {/* Gradient overlays */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-turquesa/15 via-transparent to-transparent" />

        {/* Grain texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />

        {/* Content — parallax + staggered entrance */}
        <motion.div
          style={{ y: fgY, opacity: fgOpacity }}
          className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-12 items-center gap-10 px-4 pb-28 pt-24 text-center lg:pb-36 lg:text-left"
        >
          <div className="col-span-12 lg:col-span-8">
            {/* Badge */}
            <motion.p
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-md"
            >
              <BadgeCheck className="size-4 text-pina" aria-hidden />
              {badge}
            </motion.p>

            {/* Headline — word-by-word kinetic entrance */}
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40, rotateX: -40, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.7,
                    delay: 0.4 + i * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block mr-[0.3em]"
                  style={{ perspective: "600px" }}
                >
                  {word}
                </motion.span>
              ))}
              <span className="relative inline-block">
                <motion.span
                  initial={{ opacity: 0, y: 40, rotateX: -40, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.7,
                    delay: 0.4 + words.length * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="font-serif italic"
                  style={{ perspective: "600px" }}
                >
                  {accent}
                </motion.span>
                <svg
                  viewBox="0 0 250 12"
                  aria-hidden
                  className="absolute -bottom-1.5 left-0 h-3 w-full text-coral sm:h-4"
                  fill="none"
                >
                  <motion.path
                    d="M3 9C60 2.5 180 2 247 9"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-xl text-base text-white/85 sm:text-lg lg:text-xl"
            >
              {sub}
            </motion.p>

            {/* Price badge + CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              {priceFrom && (
                <div className="flex items-baseline gap-2 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-md ring-1 ring-white/20">
                  <span className="text-xs font-medium text-white/70">Desde</span>
                  <span className="font-display text-xl font-extrabold text-white sm:text-2xl">{priceFrom}</span>
                  <span className="text-xs text-white/70">/noche</span>
                </div>
              )}
              <Link
                href={`/${locale}/casas`}
                className="group inline-flex items-center gap-2 rounded-full bg-coral-deep px-7 py-3.5 text-sm font-semibold text-white shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl"
              >
                <House className="size-4 transition-transform duration-300 group-hover:scale-110" aria-hidden />
                {explore}
                <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href={`/${locale}/tours`}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:ring-2 hover:ring-white/20"
              >
                <Compass className="size-4" aria-hidden />
                {tours}
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-white/75 lg:justify-start"
            >
              {proof.map((label) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-pina" aria-hidden />
                  {label}
                </span>
              ))}
            </motion.p>
          </div>
        </motion.div>

        {/* Slideshow indicators */}
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2 lg:bottom-12" aria-hidden>
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Imagen ${i + 1}`}
            />
          ))}
        </div>
      </section>
    </MotionConfig>
  );
}
