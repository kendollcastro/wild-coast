"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useI18n } from "./i18n-provider";
import { switchLocalePathname } from "@/i18n/localized-href";
import { type Locale } from "@/i18n/config";
import { Wordmark } from "./Wordmark";

function MiniFlag({ country }: { country: "cr" | "uk" }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className="size-4 shrink-0 rounded-[3px] ring-1 ring-inset ring-ink/15"
      aria-hidden
      focusable="false"
    >
      {country === "cr" ? (
        <>
          <rect width="24" height="16" fill="#002B7F" />
          <rect y="4" width="24" height="8" fill="#FFFFFF" />
          <rect y="6" width="24" height="4" fill="#CE1126" />
        </>
      ) : (
        <>
          <rect width="24" height="16" fill="#012169" />
          <path d="M0 0 24 16 M24 0 0 16" stroke="#FFFFFF" strokeWidth="3.2" fill="none" />
          <path d="M0 0 24 16 M24 0 0 16" stroke="#C8102E" strokeWidth="1.6" fill="none" />
          <path d="M0 8 H24" stroke="#FFFFFF" strokeWidth="5" />
          <path d="M12 0 V16" stroke="#FFFFFF" strokeWidth="5" />
          <path d="M0 8 H24" stroke="#C8102E" strokeWidth="2.2" />
          <path d="M12 0 V16" stroke="#C8102E" strokeWidth="2.2" />
        </>
      )}
    </svg>
  );
}

export function MainNav() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/";

  const effectiveScrolled = isHome ? scrolled : true;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname.startsWith(`/${locale}${href}`);

  const navClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
      active
        ? effectiveScrolled
          ? "bg-ink text-white"
          : "bg-white/25 text-white"
        : effectiveScrolled
          ? "text-ink hover:bg-muted hover:text-ink"
          : "text-white hover:bg-white/15 hover:text-white"
    }`;

  const switchTo = (target: Locale) => {
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000; samesite=lax`;
    router.push(switchLocalePathname(pathname, target));
  };

  const other: Locale = locale === "es" ? "en" : "es";
  const switchTitle = locale === "es" ? dict.nav.switchToEn : dict.nav.switchToEs;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        effectiveScrolled
          ? "border-b border-line bg-paper/95 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Wordmark light={!effectiveScrolled} />

        <nav className="hidden items-center gap-1 sm:flex" aria-label={dict.nav.navAria}>
          <Link
            href={`/${locale}/casas`}
            aria-current={isActive("/casas") ? "page" : undefined}
            className={navClass(isActive("/casas"))}
          >
            {dict.nav.casas}
          </Link>
          <Link
            href={`/${locale}/tours`}
            aria-current={isActive("/tours") ? "page" : undefined}
            className={navClass(isActive("/tours"))}
          >
            {dict.nav.tours}
          </Link>
          <Link
            href={`/${locale}/combos`}
            aria-current={isActive("/combos") ? "page" : undefined}
            className={navClass(isActive("/combos"))}
          >
            {dict.nav.combos}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => switchTo(other)}
            title={switchTitle}
            aria-label={`${dict.nav.languageAria}: ${locale === "es" ? dict.nav.labelEn : dict.nav.labelEs}`}
className={`hidden min-h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold transition-colors sm:inline-flex ${
              effectiveScrolled
                ? "border border-line bg-white text-ink"
                : "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
            }`}
            >
              <MiniFlag country={other === "en" ? "uk" : "cr"} />
              {locale === "es" ? "EN" : "ES"}
            </button>
          <Link
            href={`/${locale}/casas`}
            className={`hidden rounded-full sm:inline-flex ${
              effectiveScrolled
                ? "btn-primary btn-sm"
                : "border border-coral bg-coral px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-coral-deep"
            }`}
          >
            {dict.nav.reserve}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={dict.nav.openMenu}
            className={`inline-flex size-11 items-center justify-center rounded-full sm:hidden ${
              effectiveScrolled
                ? "border border-line bg-white text-ink"
                : "border border-white/30 bg-white/10 text-white backdrop-blur-md"
            }`}
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-72 gap-0">
          <SheetTitle className="sr-only">{dict.nav.menuTitle}</SheetTitle>
          <nav className="flex flex-col gap-1 px-3 pt-16" aria-label={dict.nav.navAriaMobile}>
            <Link
              href={`/${locale}/casas`}
              onClick={() => setOpen(false)}
              aria-current={isActive("/casas") ? "page" : undefined}
              className={`rounded-xl px-4 py-3 text-base font-semibold ${
                isActive("/casas") ? "bg-ink text-white" : "text-ink/85 hover:bg-muted"
              }`}
            >
              {dict.nav.casas}
            </Link>
            <Link
              href={`/${locale}/tours`}
              onClick={() => setOpen(false)}
              aria-current={isActive("/tours") ? "page" : undefined}
              className={`rounded-xl px-4 py-3 text-base font-semibold ${
                isActive("/tours") ? "bg-ink text-white" : "text-ink/85 hover:bg-muted"
              }`}
            >
              {dict.nav.tours}
            </Link>
            <Link
              href={`/${locale}/combos`}
              onClick={() => setOpen(false)}
              aria-current={isActive("/combos") ? "page" : undefined}
              className={`rounded-xl px-4 py-3 text-base font-semibold ${
                isActive("/combos") ? "bg-ink text-white" : "text-ink/85 hover:bg-muted"
              }`}
            >
              {dict.nav.combos}
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                switchTo(other);
              }}
              className="mt-3 flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-ink/85 hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <MiniFlag country={locale === "es" ? "cr" : "uk"} />
                {locale === "es" ? "ES" : "EN"}
                <span className="text-ink/35">/</span>
                <MiniFlag country={other === "en" ? "uk" : "cr"} />
                {locale === "es" ? "EN" : "ES"}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {locale === "es" ? dict.nav.labelEn : dict.nav.labelEs}
              </span>
            </button>
            <Link
              href={`/${locale}/casas`}
              onClick={() => setOpen(false)}
              className="btn-primary mt-4 w-full rounded-full"
            >
              {dict.nav.reserve}
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}