import "server-only";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, House, MapPin } from "lucide-react";
import type { LocalizedProperty } from "@/server/domain/catalog/localize";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { InView } from "./Reveal";

type ZoneMeta = {
  key: string;
  keywords: string[];
  image: string;
};

const ZONES: ZoneMeta[] = [
  {
    key: "jaco",
    keywords: ["jacó", "jaco", "centro"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=70&w=1200&auto=format&fit=crop",
  },
  {
    key: "herradura",
    keywords: ["herradura", "marina", "los sueños"],
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=70&w=1200&auto=format&fit=crop",
  },
  {
    key: "hermosa",
    keywords: ["hermosa"],
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=70&w=1200&auto=format&fit=crop",
  },
  {
    key: "selva",
    keywords: ["selva", "manglar", "río", "monte"],
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=70&w=1200&auto=format&fit=crop",
  },
];

export function ExploreZones({
  properties,
  dict,
  locale,
}: {
  properties: LocalizedProperty[];
  dict: Dictionary;
  locale: Locale;
}) {
  const t = dict.zones;
  const zoneCards = new Map(t.cards.map((zone) => [zone.key, zone]));

  const counts = new Map<string, number>();
  for (const zone of ZONES) {
    const card = zoneCards.get(zone.key);
    if (!card) continue;
    counts.set(
      zone.key,
      properties.filter((p) => zone.keywords.some((k) => p.location_label.toLowerCase().includes(k)))
        .length,
    );
  }
  const visible = ZONES.filter((zone) => (counts.get(zone.key) ?? 0) > 0);

  return (
    <section aria-labelledby="zonas-title" className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 eyebrow">
            <MapPin className="size-3.5 text-mar-deep" aria-hidden />
            {t.eyebrow}
          </p>
          <h2 id="zonas-title" className="mt-2 section-title">
            {t.title}
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{t.sub}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((zone, i) => {
          const card = zoneCards.get(zone.key);
          if (!card) return null;
          return (
            <InView key={zone.key} delay={(i % 4) * 70} className="h-full">
              <Link
                href={`/${locale}/casas?q=${encodeURIComponent(zone.keywords[0])}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-3xl"
              >
                <Image
                  src={zone.image}
                  alt={t.alt.replace("{name}", card.name)}
                  fill
                  sizes="(max-width: 640px) 94vw, (max-width: 1024px) 46vw, 24vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-mar-deep backdrop-blur">
                    <House className="size-3" aria-hidden />
                    {counts.get(zone.key)} {counts.get(zone.key) === 1 ? t.casa.one : t.casa.other}
                  </span>
                  <h3 className="mt-2.5 font-display text-xl font-bold text-white">{card.name}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/80">{card.tagline}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white transition-colors group-hover:text-pina">
                    {t.explore}
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </InView>
          );
        })}

        <InView delay={140} className="h-full">
          <Link
            href={`mailto:hola@jaco.example?subject=${encodeURIComponent(t.mailSubject)}`}
            className="group relative flex aspect-[4/5] flex-col items-start justify-between overflow-hidden rounded-3xl border border-dashed border-line bg-white p-5 transition-all duration-200 hover:border-mar/50 hover:shadow-soft-lg"
          >
            <span className="rounded-full bg-espuma px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-mar-deep">
              {t.newTag}
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-ink">{t.noZoneTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{t.noZoneText}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-mar-deep">
              {t.writeUs}
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </span>
          </Link>
        </InView>
      </div>
    </section>
  );
}