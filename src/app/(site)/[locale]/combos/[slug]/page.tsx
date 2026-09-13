import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComboBySlug } from "@/server/domain/catalog/service";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizeCombo } from "@/server/domain/catalog/localize";
import { alternatesFor, ogLocale, urlFor, SITE_URL } from "@/lib/seo";
import { comboSchema, breadcrumbSchema } from "@/lib/jsonld";
import { calculateComboPrice } from "@/lib/combo";
import { ComboDetail } from "@/components/site/ComboDetail";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(locale);
  const combo = await getComboBySlug(slug);
  if (!combo) {
    return { title: dict.meta.comboDetailNotFound };
  }
  const localized = localizeCombo(combo, locale);
  const description = localized.description ?? dict.meta.combosDescription;
  const imageUrl = combo.photos[0]?.url
    ? (combo.photos[0].url.startsWith("http") ? combo.photos[0].url : `${SITE_URL}${combo.photos[0].url}`)
    : undefined;
  return {
    title: `${localized.name} · ${dict.meta.comboDetailTitle}`,
    description,
    alternates: alternatesFor(locale, `combos/${slug}`),
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "Wild Coast",
      title: `${localized.name} · ${dict.meta.comboDetailTitle}`,
      description,
      url: urlFor(locale, `combos/${slug}`),
      images: imageUrl ? [{ url: imageUrl, alt: combo.photos[0].alt ?? combo.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${localized.name} · ${dict.meta.comboDetailTitle}`,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ComboDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = await getDictionary(locale);

  const combo = await getComboBySlug(slug);
  if (!combo) notFound();

  const localized = localizeCombo(combo, locale);
  const { comboPrice } = calculateComboPrice(
    combo,
    combo.property ?? null,
    combo.tours ?? [],
  );

  return (
    <>
      <ComboDetail combo={localized} />
      <JsonLd
        data={comboSchema(localized, locale, comboPrice)}
      />
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.combos ?? "Paquetes", path: "combos" },
            { name: localized.name, path: `combos/${slug}` },
          ],
          locale,
        )}
      />
    </>
  );
}
