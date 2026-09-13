"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Updates <html lang> based on the current Next.js pathname. */
export function HtmlLang() {
  const pathname = usePathname();
  useEffect(() => {
    const lang = pathname?.startsWith("/en") ? "en" : "es";
    document.documentElement.lang = lang;
  }, [pathname]);
  return null;
}
