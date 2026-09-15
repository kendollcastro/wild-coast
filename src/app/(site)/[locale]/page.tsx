import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck,
  Check,
  Compass,
  Handshake,
  House,
  Star,
} from "lucide-react";
import { notFound } from "next/navigation";
import { listActiveProperties, listActiveTours, listActiveCombos } from "@/server/domain/catalog/service";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizeProperty, localizeTour, localizeCombo } from "@/server/domain/catalog/localize";
import { alternatesFor, ogLocale, urlFor, SITE_URL } from "@/lib/seo";
import { CinematicHero } from "@/components/site/CinematicHero";
import { websiteSchema, organizationSchema, itemListSchema } from "@/lib/jsonld";
import { PropertyCard } from "@/components/site/PropertyCard";
import { HomeSearch } from "@/components/site/HomeSearch";
import { InView } from "@/components/site/Reveal";
import { ExploreZones } from "@/components/site/ExploreZones";
import { TourExplorer } from "@/components/site/TourExplorer";
import { DealsSection } from "@/components/site/DealsSection";
import { TownTicker } from "@/components/site/TownTicker";
import { CountUp } from "@/components/site/CountUp";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const HERO_OG_IMAGE = `${SITE_URL}/images/og-img-wild-coast.jpg`;

const PILLAR_ICONS = {
  explore: { icon: House, wrap: "bg-coral-soft text-coral-deep" },
  book: { icon: CalendarCheck, wrap: "bg-viola-soft text-viola-deep" },
  deal: { icon: Handshake, wrap: "bg-pina-soft text-pina-deep" },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(locale);
  return {
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
    alternates: alternatesFor(locale, ""),
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "Wild Coast",
      title: dict.meta.homeTitle,
      description: dict.meta.homeDescription,
      url: urlFor(locale, ""),
      images: [
        {
          url: HERO_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: dict.home.hero.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.homeTitle,
      description: dict.meta.homeDescription,
      images: [HERO_OG_IMAGE],
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = await getDictionary(locale);
  const t = dict.home;

  const [properties, tours, combos] = await Promise.all([listActiveProperties(), listActiveTours(), listActiveCombos()]);
  const localizedProperties = properties.map((p) => localizeProperty(p, locale));
  const localizedTours = tours.map((tour) => localizeTour(tour, locale));
  const localizedCombos = combos.map((combo) => localizeCombo(combo, locale));

  const featured = localizedProperties.filter((p) => p.featured);
  const displayProperties = (featured.length > 0 ? featured : localizedProperties).slice(0, 3);
  const casasCount = localizedProperties.length;
  const toursCount = localizedTours.length;

  const minPrice = localizedProperties.length > 0
    ? Math.min(...localizedProperties.map((p) => Number(p.price_per_night) || Infinity).filter((n) => n < Infinity))
    : null;
  const priceFrom = minPrice != null && minPrice < Infinity ? `US$${minPrice}` : undefined;

  const tickerItems = [
    ...localizedProperties.map((p) => p.name),
    ...localizedTours.map((tour) => tour.name),
    ...t.ticker.extra,
  ].slice(0, 12);

  return (
    <>
      {/* Hero */}
      <CinematicHero
        badge={t.hero.badge}
        pre={t.hero.pre}
        accent={t.hero.accent}
        sub={t.hero.sub}
        explore={t.hero.explore}
        tours={t.hero.tours}
        proof={t.hero.proof}
        imageAlt={t.hero.imageAlt}
        priceFrom={priceFrom}
        locale={locale}
      />

      {/* Buscador superpuesto */}
      <section className="relative z-20 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-24">
        <HomeSearch />
      </section>

      {/* Propiedades destacadas */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 eyebrow">
              <House className="size-3.5 text-coral-deep" aria-hidden />
              {t.featured.eyebrow}
            </p>
            <h2 className="mt-2 section-title">{t.featured.title}</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {casasCount > 0
                ? t.featured.sub
                    .replace("{shown}", String(displayProperties.length))
                    .replace("{total}", String(casasCount))
                : t.featured.empty}
            </p>
          </div>
          <Link href={`/${locale}/casas`} className="btn-outline btn-sm shrink-0">
            {t.featured.all}
          </Link>
        </div>

        {displayProperties.length > 0 ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {displayProperties.map((property, i) => (
              <InView key={property.id} delay={(i % 3) * 70}>
                <PropertyCard property={property} />
              </InView>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.featured.empty}</p>
        )}
      </section>

      {/* Cómo funciona — pilares compactos */}
      <section id="como-funciona" className="scroll-mt-28 border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-end">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <p className="eyebrow">{t.pillarsEyebrow}</p>
              <h2 className="mt-2 section-title">{t.howTitle}</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {t.pillars.map((pillar, i) => {
                const meta = PILLAR_ICONS[pillar.key as keyof typeof PILLAR_ICONS];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <InView key={pillar.key} delay={i * 70}>
                    <span className="pillar-chip">
                      <span className={`flex size-7 items-center justify-center rounded-full ${meta.wrap}`}>
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span>
                        <span className="font-bold">{pillar.title}</span>
                        <span className="text-mute"> · {pillar.text}</span>
                      </span>
                    </span>
                  </InView>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Cinta del pueblo */}
      <TownTicker items={tickerItems} />

      {/* Tours */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 eyebrow">
              <Compass className="size-3.5 text-coral-deep" aria-hidden />
              {t.tours.eyebrow}
            </p>
            <h2 className="mt-2 section-title">{t.tours.title}</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {toursCount > 0
                ? t.tours.sub.replace("{count}", String(toursCount))
                : t.tours.empty}
            </p>
          </div>
          <Link href={`/${locale}/tours`} className="btn-outline btn-sm shrink-0">
            {t.tours.all}
          </Link>
        </div>

        <TourExplorer tours={localizedTours} />
      </section>

      {/* Destacadas de la semana */}
      <DealsSection properties={localizedProperties} tours={localizedTours} combos={localizedCombos} locale={locale} dict={dict} />

      {/* Testimonios */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow">{t.testimonials.eyebrow}</p>
            <h2 className="mt-2 section-title">{t.testimonials.title}</h2>
            <p className="mt-3 text-muted-foreground">{t.testimonials.sub}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {t.testimonials.items.map((item, i) => (
              <InView key={item.name} delay={i * 80}>
                <figure className="card-surface h-full p-6">
                  <div className="flex items-center gap-1" aria-label={t.testimonials.stars}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-4 fill-pina text-pina" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-[15px] leading-relaxed text-ink">“{item.text}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4 text-sm">
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-coral-soft font-display text-sm font-bold text-coral-deep"
                      aria-hidden
                    >
                      {item.initials}
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{item.name}</span>
                      <span className="block text-mute">{item.where}</span>
                    </span>
                  </figcaption>
                </figure>
              </InView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="grain relative overflow-hidden rounded-3xl bg-ink">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-coral/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-turquesa/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mar/20 blur-3xl"
          />

          <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15">
                <Handshake className="size-4 text-pina" aria-hidden />
                {t.cta.badge}
              </p>
              <h2 className="mt-4 section-title text-white">{t.cta.title}</h2>
              <p className="mt-3 max-w-md text-white/75">{t.cta.text}</p>

              <ul className="mt-5 space-y-2 text-sm text-white/80">
                {t.cta.list.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-pina" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/casas`}
                  className="btn-glow inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold text-ink shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {t.cta.explore}
                </Link>
                <Link
                  href={`/${locale}/tours`}
                  className="btn rounded-full border border-white/25 px-6 py-3 text-sm text-white hover:bg-white/10"
                >
                  {t.cta.tours}
                </Link>
              </div>
            </div>

            <div className="hidden lg:col-span-5 lg:flex lg:items-center lg:justify-center">
              <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur">
                <p className="flex items-center justify-between text-xs font-semibold text-white/70">
                  {t.cta.today}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-pina px-2.5 py-0.5 text-[11px] font-bold text-ink">
                    <span className="size-1.5 animate-pulse rounded-full bg-ink" aria-hidden />
                    {t.cta.live}
                  </span>
                </p>
                <p className="mt-4 font-display text-5xl font-extrabold leading-none tabular-nums">
                  <CountUp value={casasCount + toursCount} />
                </p>
                <p className="mt-2 text-sm text-white/75">{t.cta.count}</p>
                <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-white/70">{t.cta.activeCasas}</dt>
                    <dd className="font-semibold tabular-nums">{casasCount}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/70">{t.cta.townTours}</dt>
                    <dd className="font-semibold tabular-nums">{toursCount}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-faint">{t.cta.bottom}</p>
      </section>

      {/* Zonas de Wild Coast */}
      <ExploreZones properties={localizedProperties} dict={dict} locale={locale} />

      <JsonLd
        data={[
          websiteSchema(),
          organizationSchema(),
          displayProperties.length > 0
            ? itemListSchema(
                displayProperties.map((p) => ({ name: p.name, url: urlFor(locale, `casas/${p.slug}`) })),
              )
            : null,
        ].filter(Boolean)}
      />
    </>
  );
}