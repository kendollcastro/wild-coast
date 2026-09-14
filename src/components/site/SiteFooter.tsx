import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/es";
import type { Locale } from "@/i18n/config";

export function SiteFooter({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <footer className="mt-auto border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Image
            src="/images/Wild-Coast-Costa-Rica-logo-header-orange.svg"
            alt="Wild Coast"
            width={200}
            height={48}
            className="h-10 w-auto"
          />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{dict.footer.tagline}</p>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5" /> {dict.footer.location}
          </p>
        </div>

        <div>
          <p className="eyebrow">{dict.footer.explore}</p>
          <nav className="mt-3 flex flex-col gap-2 text-sm" aria-label={dict.footer.explore}>
            <Link href={`/${locale}/casas`} className="text-ink/80 transition-colors hover:text-ink">
              {dict.footer.allCasas}
            </Link>
            <Link href={`/${locale}/tours`} className="text-ink/80 transition-colors hover:text-ink">
              {dict.footer.tours}
            </Link>
            <Link href={`/${locale}/combos`} className="text-ink/80 transition-colors hover:text-ink">
              {dict.footer.combos}
            </Link>
            <Link href={`/${locale}/#como-funciona`} className="text-ink/80 transition-colors hover:text-ink">
              {dict.footer.how}
            </Link>
            <Link href={`/${locale}/casas`} className="font-semibold text-coral-deep transition-colors hover:text-coral">
              {dict.footer.reserve}
            </Link>
          </nav>
        </div>

        <div>
          <p className="eyebrow">{dict.footer.about}</p>
          <nav className="mt-3 flex flex-col gap-2 text-sm" aria-label={dict.footer.contactAria}>
            <a
              href="mailto:hola@jaco.example"
              className="inline-flex items-center gap-1.5 text-ink/80 transition-colors hover:text-ink"
            >
              <Mail className="size-3.5" /> hola@jaco.example
            </a>
          </nav>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{dict.footer.copyright}</p>
          <p>{dict.footer.bottom}</p>
        </div>
      </div>
    </footer>
  );
}
