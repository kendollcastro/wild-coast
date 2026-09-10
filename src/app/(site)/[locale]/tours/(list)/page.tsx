import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listActiveTours } from "@/server/domain/catalog/service";
import { getTourAvailability, rangesToDisabledDates } from "@/server/domain/bookings/service";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizeTour } from "@/server/domain/catalog/localize";
import { alternatesFor, ogLocale, urlFor } from "@/lib/seo";
import { itemListSchema } from "@/lib/jsonld";
import { ToursView } from "@/components/site/ToursView";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(locale);
  const description = dict.meta.toursDescription;
  return {
    title: dict.meta.toursTitle,
    description,
    alternates: alternatesFor(locale, "tours"),
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "jacó",
      title: dict.meta.toursTitle,
      description,
      url: urlFor(locale, "tours"),
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.toursTitle,
      description,
    },
  };
}

export default async function ToursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = await getDictionary(locale);
  const t = dict.tours.list;

  const tours = (await listActiveTours()).map((tour) => localizeTour(tour, locale));

  // Fechas bloqueadas por tour (los filtros de fecha corren en el cliente).
  const disabledByTourId: Record<string, string[]> = {};
  await Promise.all(
    tours.map(async (tour) => {
      const availability = await getTourAvailability(tour.id);
      disabledByTourId[tour.id] = [...rangesToDisabledDates(availability)];
    }),
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="mt-2 section-title text-4xl sm:text-5xl">{t.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.sub}</p>
      </div>

      <ToursView tours={tours} disabledByTourId={disabledByTourId} />

      <JsonLd
        data={itemListSchema(
          tours.map((tour) => ({ name: tour.name, url: urlFor(locale, `tours/${tour.slug}`) })),
        )}
      />
    </section>
  );
}