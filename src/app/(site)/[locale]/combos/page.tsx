import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listActiveCombos } from "@/server/domain/catalog/service";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizeCombo } from "@/server/domain/catalog/localize";
import { alternatesFor, ogLocale, urlFor } from "@/lib/seo";
import { itemListSchema } from "@/lib/jsonld";
import { ComboCard } from "@/components/site/ComboCard";
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
  const description = dict.meta.combosDescription;
  return {
    title: dict.meta.combosTitle,
    description,
    alternates: alternatesFor(locale, "combos"),
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "Wild Coast",
      title: dict.meta.combosTitle,
      description,
      url: urlFor(locale, "combos"),
      images: [
        {
          url: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200&q=80",
          width: 1200,
          height: 630,
          alt: "Paquetes casa + tour en Jacó, Costa Rica",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.combosTitle,
      description,
      images: ["https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200&q=80"],
    },
  };
}

export default async function CombosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = await getDictionary(locale);
  const t = dict.combos.list;

  const combos = (await listActiveCombos()).map((combo) => localizeCombo(combo, locale));

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="mt-2 section-title text-4xl sm:text-5xl">{t.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.sub}</p>
      </div>

      {combos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-line bg-white/60 px-4 py-10 text-center text-sm text-mute">
          {t.empty}
        </p>
      )}

      <JsonLd
        data={itemListSchema(
          combos.map((c) => ({ name: c.name, url: urlFor(locale, `combos/${c.slug}`) })),
          "Product",
        )}
      />
    </section>
  );
}
