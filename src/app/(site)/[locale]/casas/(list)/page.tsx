import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listActiveProperties } from "@/server/domain/catalog/service";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizeProperty } from "@/server/domain/catalog/localize";
import { alternatesFor, ogLocale, urlFor } from "@/lib/seo";
import { itemListSchema } from "@/lib/jsonld";
import { PropertyExplorer } from "@/components/site/PropertyExplorer";
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
  const description = dict.meta.casasDescription;
  return {
    title: dict.meta.casasTitle,
    description,
    alternates: alternatesFor(locale, "casas"),
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "jacó",
      title: dict.meta.casasTitle,
      description,
      url: urlFor(locale, "casas"),
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.casasTitle,
      description,
    },
  };
}

export default async function CasasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = await getDictionary(locale);
  const t = dict.casas.list;

  const properties = (await listActiveProperties()).map((p) => localizeProperty(p, locale));

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="mt-2 section-title text-4xl sm:text-5xl">{t.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.sub}</p>
      </div>

      <PropertyExplorer properties={properties} />

      <JsonLd
        data={itemListSchema(
          properties.map((p) => ({ name: p.name, url: urlFor(locale, `casas/${p.slug}`) })),
          "LodgingBusiness",
        )}
      />
    </section>
  );
}