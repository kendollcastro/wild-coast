import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, BedDouble, Bath, MapPin } from "lucide-react";
import { listActiveProperties, getPropertyBySlug } from "@/server/domain/catalog/service";
import { getPropertyAvailability, rangesToDisabledDates } from "@/server/domain/bookings/service";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizeProperty } from "@/server/domain/catalog/localize";
import { alternatesFor, ogLocale, seoDescription, SITE_URL, urlFor } from "@/lib/seo";
import { propertySchema, breadcrumbSchema } from "@/lib/jsonld";
import { Gallery } from "@/components/site/Gallery";
import { JsonLd } from "@/components/seo/JsonLd";
import { PropertyBookingPanel } from "@/components/site/PropertyBookingPanel";
import { SaveButton, ShareButton } from "@/components/site/SaveButton";

export const revalidate = 60;

export async function generateStaticParams() {
  const properties = await listActiveProperties();
  return locales.flatMap((locale) => properties.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(locale);
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: dict.meta.casasDetailNotFound };
  const localized = localizeProperty(property, locale);
  const cover = localized.photos[0]?.url;
  const ogImage = cover?.startsWith("http") ? cover : `${SITE_URL}${cover ?? ""}`;
  const description = seoDescription(localized.description);
  const title = `${localized.name} · ${dict.meta.casasDetailTitle}`;
  return {
    title,
    description,
    alternates: alternatesFor(locale, `casas/${slug}`),
    openGraph: {
      type: "article",
      locale: ogLocale(locale),
      siteName: "jacó",
      title,
      description,
      url: urlFor(locale, `casas/${slug}`),
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

export default async function CasaDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = await getDictionary(locale);
  const t = dict.casas.detail;

  const property = await getPropertyBySlug(slug);
  if (!property) notFound();
  const localized = localizeProperty(property, locale);

  const availability = await getPropertyAvailability(property.id);
  const disabledDates = [...rangesToDisabledDates(availability)];

  const bedrooms = localized.bedrooms ?? null;
  const bathrooms = localized.bathrooms ?? null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-20 sm:pt-8">
      <Link
        href="casas"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-mute transition-colors hover:text-coral"
      >
        <ArrowLeft className="size-4" /> {t.back}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{localized.name}</h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-mute">
            <MapPin className="size-4 text-coral" />
            {localized.location_label} {t.suffix}
          </p>
        </div>
        <div className="flex gap-2">
          <ShareButton />
          <SaveButton id={`casa-${localized.id}`} />
        </div>
      </div>

      <div className="mt-5">
        <Gallery photos={localized.photos} name={localized.name} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-line py-4 text-sm text-ink">
        <span className="inline-flex items-center gap-2">
          <Users className="size-4.5 text-mute" strokeWidth={1.75} />
          <b>{t.upTo} {localized.capacity}</b> {t.guestsWord}
        </span>
        <span className="hidden h-4 w-px bg-line sm:block" />
        <span className="inline-flex items-center gap-2">
          <BedDouble className="size-4.5 text-mute" strokeWidth={1.75} />
          <b>{bedrooms ?? "—"}</b> {bedrooms === 1 ? t.bedroom.one : t.bedroom.other}
        </span>
        <span className="hidden h-4 w-px bg-line sm:block" />
        <span className="inline-flex items-center gap-2">
          <Bath className="size-4.5 text-mute" strokeWidth={1.75} />
          <b>{bathrooms ?? "—"}</b> {bathrooms === 1 ? t.bathroom.one : t.bathroom.other}
        </span>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="text-2xl font-bold tracking-tight text-ink">{t.about}</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/85">
            {localized.description ?? t.noDescription}
          </p>

          <h3 className="mt-10 text-xl font-bold tracking-tight text-ink">{t.whatYouFind}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              `${t.upTo} ${localized.capacity} ${t.guestsWord}`,
              `${bedrooms ?? "—"} ${bedrooms === 1 ? t.bedroom.one : t.bedroom.other}`,
              `${bathrooms ?? "—"} ${bathrooms === 1 ? t.bathroom.one : t.bathroom.other}`,
              localized.location_label,
            ].map((label) => (
              <span
                key={label}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink shadow-soft"
              >
                {label}
              </span>
            ))}
          </div>

          {localized.amenities.length > 0 && (
            <>
              <h3 className="mt-10 text-xl font-bold tracking-tight text-ink">{t.amenities}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {(localized.amenities).map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink shadow-soft"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="mt-10 rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-coral-deep font-display text-xl font-bold text-white">
                {(localized.owner?.name ?? "J").charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold text-ink">
                  {localized.owner?.name ?? t.ownerFallback}
                </p>
                <p className="text-sm text-mute">{t.ownerNote}</p>
              </div>
            </div>
            {localized.lat != null && (
              <p className="mt-4 border-t border-line pt-3 font-mono text-xs text-mute">
                {Number(localized.lat).toFixed(4)}° N / {Number(localized.lng).toFixed(4)}° O
              </p>
            )}
          </div>

          <div className="mt-10 rounded-2xl border border-dashed border-line bg-muted/40 p-6 text-center">
            <p className="text-lg font-semibold text-ink">{t.noReviews}</p>
            <p className="mt-1 text-sm text-mute">{t.beFirst}</p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <PropertyBookingPanel property={localized} disabledDates={disabledDates} />
        </div>
      </div>

      <JsonLd
        data={[
          propertySchema(localized, locale),
          breadcrumbSchema(
            [
              { name: dict.casas.list.title, path: "casas" },
              { name: localized.name, path: `casas/${localized.slug}` },
            ],
            locale,
          ),
        ]}
      />
    </section>
  );
}