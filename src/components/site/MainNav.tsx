"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BadgeCheck, Clock, Handshake, Menu } from "lucide-react";
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
  const [howActive, setHowActive] = useState(false);

  useEffect(() => {
    const el = document.getElementById("como-funciona");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHowActive(entry.isIntersecting),
      { rootMargin: "0px 0px -85% 0px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isActive = (href: string) =>
    href === "/#como-funciona" ? howActive : pathname.startsWith(`/${locale}${href}`);

  const navClass = (active: boolean) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
      active ? "bg-ink text-white" : "text-ink/80 hover:bg-muted hover:text-ink"
    }`;

  const switchTo = (target: Locale) => {
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000; samesite=lax`;
    router.push(switchLocalePathname(pathname, target));
  };

  const other: Locale = locale === "es" ? "en" : "es";
  const switchTitle = locale === "es" ? dict.nav.switchToEn : dict.nav.switchToEs;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="hidden border-b border-line bg-white/60 sm:block" aria-hidden>
        <div className="mx-auto flex h-9 max-w-6xl items-center gap-6 px-4">
          {dict.nav.trustBar.map((label, i) => {
            const TrustIcon = [BadgeCheck, Handshake, Clock][i % 3];
            return (
              <p key={label} className="flex items-center gap-1.5 text-xs font-medium text-mute">
                <TrustIcon className="size-3.5 text-coral-deep" aria-hidden />
                {label}
              </p>
            );
          })}
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Wordmark />

        <nav className="hidden items-center gap-1 sm:flex" aria-label={dict.nav.navAria}>
          <Link
            href="casas"
            aria-current={isActive("/casas") ? "page" : undefined}
            className={navClass(isActive("/casas"))}
          >
            {dict.nav.casas}
          </Link>
          <Link
            href="tours"
            aria-current={isActive("/tours") ? "page" : undefined}
            className={navClass(isActive("/tours"))}
          >
            {dict.nav.tours}
          </Link>
          <Link
            href="#como-funciona"
            aria-current={isActive("/#como-funciona") ? "page" : undefined}
            className={navClass(isActive("/#como-funciona"))}
          >
            {dict.nav.how}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => switchTo(other)}
            title={switchTitle}
            aria-label={`${dict.nav.languageAria}: ${locale === "es" ? dict.nav.labelEn : dict.nav.labelEs}`}
className="hidden min-h-11 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-sm font-bold text-ink transition-colors hover:bg-muted sm:inline-flex"
            >
              <MiniFlag country={other === "en" ? "uk" : "cr"} />
              {locale === "es" ? "EN" : "ES"}
            </button>
          <Link
            href="casas"
            className="btn-primary btn-sm hidden rounded-full sm:inline-flex"
          >
            {dict.nav.reserve}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={dict.nav.openMenu}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-white text-ink sm:hidden"
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
              href="casas"
              onClick={() => setOpen(false)}
              aria-current={isActive("/casas") ? "page" : undefined}
              className={`rounded-xl px-4 py-3 text-base font-semibold ${
                isActive("/casas") ? "bg-ink text-white" : "text-ink/85 hover:bg-muted"
              }`}
            >
              {dict.nav.casas}
            </Link>
            <Link
              href="tours"
              onClick={() => setOpen(false)}
              aria-current={isActive("/tours") ? "page" : undefined}
              className={`rounded-xl px-4 py-3 text-base font-semibold ${
                isActive("/tours") ? "bg-ink text-white" : "text-ink/85 hover:bg-muted"
              }`}
            >
              {dict.nav.tours}
            </Link>
            <Link
              href="#como-funciona"
              onClick={() => setOpen(false)}
              aria-current={isActive("/#como-funciona") ? "page" : undefined}
              className={`rounded-xl px-4 py-3 text-base font-semibold ${
                isActive("/#como-funciona") ? "bg-ink text-white" : "text-ink/85 hover:bg-muted"
              }`}
            >
              {dict.nav.how}
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
              href="casas"
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