"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { CalendarCheck } from "lucide-react";
import { useI18n } from "./i18n-provider";

export function StickyCTA() {
  const { dict, locale } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 sm:hidden"
        >
          <Link
            href={`/${locale}/casas`}
            className="flex items-center gap-2 rounded-full bg-coral-deep px-6 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-2xl"
          >
            <CalendarCheck className="size-4" aria-hidden />
            {dict.nav.reserve}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
