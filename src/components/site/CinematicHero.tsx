"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Compass, House, Check, ChevronRight, Waves } from "lucide-react";
import { motion, useScroll, useTransform, MotionConfig, AnimatePresence } from "motion/react";

const HERO_IMAGES = [
  { src: "/images/villa-esperanza-08.jpeg", alt: "Villa frente a la playa en Wild Coast" },
  { src: "/images/toucan-house-04.jpeg", alt: "Casa moderna con piscina en Wild Coast" },
  { src: "/images/jetski-vamos-jaco-tours-005.webp", alt: "Jet ski en el Pacífico de Jacó" },
  { src: "/images/flyboard-vamos-jaco-tours-001.jpg", alt: "Flyboard en el Pacífico de Jacó" },
  { src: "/images/costacat-vamos-jaco-tours-002.jpg", alt: "Catamarán por la costa de Jacó" },
  { src: "/images/buddha-house-04.jpeg", alt: "Casa de diseño con vista al océano" },
  { src: "/images/buddha-house-02.jpeg", alt: "Terraza con vista al atardecer" },
];

const SLIDESHOW_INTERVAL = 6000;

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
  const [entered, setEntered] = useState(false);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 200]);
  const fgY = useTransform(scrollY, [0, 600], [0, -100]);
  const fgOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const bgScale = useTransform(scrollY, [0, 800], [1, 1.15]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, SLIDESHOW_INTERVAL);
    return () => clearInterval(id);
  }, [next]);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const words = pre.split(" ");

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative -mt-16 flex min-h-[calc(85svh+4rem)] items-center overflow-clip pt-[140px] pb-20 lg:-mt-[100px] lg:min-h-[calc(85svh+100px)] lg:pt-[196px] lg:pb-36">
        {/* ═══════════════ BACKGROUND ═══════════════ */}
        <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 overflow-hidden" aria-hidden>
          <AnimatePresence mode="sync">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.2, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              transition={{
                opacity: { duration: 1.0, ease: "easeInOut" },
                scale: { duration: 8, ease: "easeOut" },
                filter: { duration: 1.0 },
              }}
              className="absolute inset-0"
            >
              <Image
                src={HERO_IMAGES[current].src}
                alt={HERO_IMAGES[current].alt}
                priority={current === 0}
                fill
                sizes="100vw"
                quality={85}
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ═══════════════ GRADIENTS ═══════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-coral/10 via-transparent to-turquesa/10" />

        {/* Animated grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />

        {/* ═══════════════ DECORATIVE LINES ═══════════════ */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {/* Diagonal accent line */}
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={entered ? { x: "200%", opacity: [0, 0.3, 0] } : {}}
            transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut" }}
            className="absolute -left-20 top-[40%] h-px w-[60%] rotate-[-20deg] bg-gradient-to-r from-transparent via-coral to-transparent"
          />
          {/* Second accent line */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={entered ? { x: "-200%", opacity: [0, 0.2, 0] } : {}}
            transition={{ duration: 3, delay: 0.8, ease: "easeInOut" }}
            className="absolute -right-20 top-[55%] h-px w-[50%] rotate-[-15deg] bg-gradient-to-l from-transparent via-pina to-transparent"
          />
          {/* Floating orbs */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={entered ? { scale: 1, opacity: 0.15 } : {}}
            transition={{ duration: 2, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-[15%] top-[20%] size-64 rounded-full bg-coral blur-[100px]"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={entered ? { scale: 1, opacity: 0.1 } : {}}
            transition={{ duration: 2.5, delay: 2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[25%] right-[25%] size-48 rounded-full bg-turquesa blur-[80px]"
          />
        </div>

        {/* ═══════════════ CONTENT ═══════════════ */}
        <motion.div
          style={{ y: fgY, opacity: fgOpacity }}
          className="relative z-10 w-full px-5 lg:px-8"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center text-center lg:items-start lg:text-left">
            {/* Badge — slides in from left with spring */}
            <motion.div
              initial={{ opacity: 0, x: -60, filter: "blur(12px)" }}
              animate={entered ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-md">
                <BadgeCheck className="size-4 text-pina" aria-hidden />
                {badge}
              </span>
            </motion.div>

            {/* Headline — dramatic word-by-word with 3D perspective */}
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl" style={{ perspective: "1000px" }}>
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 80, rotateX: -60, rotateZ: -3, filter: "blur(16px)" }}
                  animate={entered ? { opacity: 1, y: 0, rotateX: 0, rotateZ: 0, filter: "blur(0px)" } : {}}
                  transition={{
                    duration: 0.9,
                    delay: 0.5 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block mr-[0.3em]"
                >
                  {word}
                </motion.span>
              ))}
              {/* Accent word — dramatic entrance with glow */}
              <span className="relative inline-block">
                <motion.span
                  initial={{ opacity: 0, y: 60, scale: 0.6, rotateX: -40, filter: "blur(20px)" }}
                  animate={entered ? { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" } : {}}
                  transition={{
                    duration: 1.0,
                    delay: 0.5 + words.length * 0.1 + 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="font-serif italic"
                >
                  {accent}
                </motion.span>
                {/* Glow behind accent */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={entered ? { opacity: 0.4, scale: 1.2 } : {}}
                  transition={{ duration: 1.5, delay: 0.5 + words.length * 0.1 + 0.3, ease: "easeOut" }}
                  className="absolute inset-0 -z-10 rounded-full bg-coral blur-[30px]"
                  aria-hidden
                />
                {/* Animated underline */}
                <svg
                  viewBox="0 0 300 14"
                  aria-hidden
                  className="absolute -bottom-2 left-0 h-3.5 w-full sm:h-4"
                  fill="none"
                >
                  <motion.path
                    d="M4 10C80 3 220 3 296 10"
                    stroke="url(#underline-gradient)"
                    strokeLinecap="round"
                    strokeWidth="4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={entered ? { pathLength: 1, opacity: 1 } : {}}
                    transition={{ duration: 1.2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <defs>
                    <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF6B4A" />
                      <stop offset="50%" stopColor="#FFB347" />
                      <stop offset="100%" stopColor="#FF6B4A" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subtitle — slides in from right */}
            <motion.p
              initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
              animate={entered ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-base text-white/85 sm:text-lg lg:text-xl"
            >
              {sub}
            </motion.p>

            {/* Price + CTAs — pop in with spring bounce */}
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={entered ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.8, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              {priceFrom && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={entered ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 1.5, type: "spring", stiffness: 200, damping: 15 }}
                  className="flex items-baseline gap-2 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-md ring-1 ring-white/20"
                >
                  <span className="text-xs font-medium text-white/70">Desde</span>
                  <span className="font-display text-xl font-extrabold text-white sm:text-2xl">{priceFrom}</span>
                  <span className="text-xs text-white/70">/noche</span>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={entered ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.6, type: "spring", stiffness: 200, damping: 15 }}
              >
                <Link
                  href={`/${locale}/casas`}
                  className="group inline-flex items-center gap-2 rounded-full bg-coral-deep px-7 py-3.5 text-sm font-semibold text-white shadow-soft-lg transition-all duration-300 hover:-translate-y-1 hover:brightness-110 hover:shadow-2xl hover:shadow-coral/25"
                >
                  <House className="size-4 transition-transform duration-300 group-hover:scale-110" aria-hidden />
                  {explore}
                  <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={entered ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.7, type: "spring", stiffness: 200, damping: 15 }}
              >
                <Link
                  href={`/${locale}/tours`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:ring-2 hover:ring-white/20"
                >
                  <Compass className="size-4" aria-hidden />
                  {tours}
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust — staggered fade in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={entered ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.9 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-white/75 lg:justify-start"
            >
              {proof.map((label, i) => (
                <motion.span
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={entered ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 2.0 + i * 0.1 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="size-3.5 text-pina" aria-hidden />
                  {label}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* ═══════════════ SLIDESHOW INDICATORS ═══════════════ */}
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 lg:bottom-12" aria-hidden>
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className="group relative flex items-center justify-center"
              aria-label={`Imagen ${i + 1}`}
            >
              <div className={`h-1 rounded-full transition-all duration-700 ${
                i === current ? "w-10 bg-white" : "w-2 bg-white/30 group-hover:bg-white/50"
              }`} />
              {i === current && (
                <motion.div
                  layoutId="hero-indicator"
                  className="absolute h-1 w-10 rounded-full bg-coral"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════ SCROLL HINT ═══════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={entered ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 2.5 }}
          className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 lg:bottom-24"
          aria-hidden
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5"
          >
            <Waves className="size-5 text-white/40" />
            <div className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent" />
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}
