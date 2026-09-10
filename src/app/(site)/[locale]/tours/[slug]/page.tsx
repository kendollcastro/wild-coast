import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Users, MapPin } from "lucide-react";
import { listActiveTours, getTourBySlug } from "@/server/domain/catalog/service";
import { getTourAvailability, rangesToDisabledDates } from "@/server/domain/bookings/service";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizeTour } from "@/server/domain/catalog/localize";
import { alternatesFor, ogLocale, seoDescription, SITE_URL, urlFor } from "@/lib/seo";
import { tourSchema, breadcrumbSchema } from "@/lib/jsonld";
import { Gallery } from "@/components/site/Gallery";
import { JsonLd } from "@/components/seo/JsonLd";
import { TourBookingPanel } from "@/components/site/TourBookingPanel";
import { SaveButton, ShareButton } from "@/components/site/SaveButton";

export const revalidate = 60;

export async function generateStaticParams() {
  const tours = await listActiveTours();
  return locales.flatMap((locale) => tours.map((tour) => ({ locale, slug: tour.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(locale);
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: dict.meta.tourDetailNotFound };
  const localized = localizeTour(tour, locale);
  const cover = localized.photos[0]?.url;
  const ogImage = cover?.startsWith("http") ? cover : `${SITE_URL}${cover ?? ""}`;
  const description = seoDescription(localized.description);
  const title = `${localized.name} · ${dict.meta.tourDetailTitle}`;
  return {
    title,
    description,
    alternates: alternatesFor(locale, `tours/${slug}`),
    openGraph: {
      type: "article",
      locale: ogLocale(locale),
      siteName: "jacó",
      title,
      description,
      url: urlFor(locale, `tours/${slug}`),
      images: cover ? [{ url: ogImage, alt: localized.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [ogImage] : undefined,
    },
  };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = await getDictionary(locale);
  const t = dict.tours.detail;

  const tour = await getTourBySlug(slug);
  if (!tour) notFound();
  const localized = localizeTour(tour, locale);

  const availability = await getTourAvailability(tour.id);
  const disabledDates = [...rangesToDisabledDates(availability)];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-20 sm:pt-8">
      <Link
        href="tours"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-mute transition-colors hover:text-coral"
      >
        <ArrowLeft className="size-4" /> {t.back}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mute">
            <span className="rounded-full bg-monte-soft px-2.5 py-1 text-monte-deep no-underline">
              {localized.category
                ? (dict.explorer.tour.categories[
                    localized.category as keyof typeof dict.explorer.tour.categories
                  ] ?? localized.category)
                : t.categoryFallback}
            </span>
            {t.operatedBy.replace("{name}", localized.provider)}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{localized.name}</h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-mute">
            <MapPin className="size-4 text-monte" /> {t.startFrom}
          </p>
        </div>
        <div className="flex gap-2">
          <ShareButton />
          <SaveButton id={`tour-${localized.id}`} />
        </div>
      </div>

      <div className="mt-5">
        <Gallery photos={localized.photos} name={localized.name} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-line py-4 text-sm text-ink">
        <span className="inline-flex items-center gap-2">
          <Clock className="size-4.5 text-mute" strokeWidth={1.75} />
          <b>{localized.duration_hours} {t.hoursUnit}</b> {t.hoursSuffix}
        </span>
        <span className="hidden h-4 w-px bg-line sm:block" />
        <span className="inline-flex items-center gap-2">
          <Users className="size-4.5 text-mute" strokeWidth={1.75} />
          {t.capacity.replace("{count}", String(localized.capacity))}
        </span>
        <span className="hidden h-4 w-px bg-line sm:block" />
        <span className="inline-flex items-center gap-2">
          <span className="rounded-full bg-monte-soft px-2.5 py-0.5 font-semibold text-monte-deep">
            {t.perPerson.replace("{price}", String(localized.price))}
          </span>
        </span>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="text-2xl font-bold tracking-tight text-ink">{t.experience}</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/85">
            {localized.description ?? t.noDescription}
          </p>

          <h3 className="mt-10 text-xl font-bold tracking-tight text-ink">{t.includes}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(localized.includes.length > 0 ? localized.includes : t.includesDefault).map((label) => (
              <span
                key={label}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink shadow-soft"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-monte-deep font-display text-xl font-bold text-white">
                {localized.provider.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold text-ink">{t.operatedByTitle.replace("{name}", localized.provider)}</p>
                <p className="text-sm text-mute">{t.operatedNote}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-dashed border-line bg-muted/40 p-6 text-center">
            <p className="text-lg font-semibold text-ink">{t.noReviews}</p>
            <p className="mt-1 text-sm text-mute">{t.beFirst}</p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <TourBookingPanel tour={localized} disabledDates={disabledDates} />
        </div>
      </div>

      <JsonLd
        data={[
          tourSchema(localized, locale),
          breadcrumbSchema(
            [
              { name: dict.tours.list.title, path: "tours" },
              { name: localized.name, path: `tours/${localized.slug}` },
            ],
            locale,
          ),
        ]}
      />
    </section>
  );
}