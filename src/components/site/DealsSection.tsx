import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Flame, Package, Users } from "lucide-react";
import type { LocalizedProperty, LocalizedTour, LocalizedCombo } from "@/server/domain/catalog/localize";
import { formatUSD } from "@/lib/format";
import { calculateComboPrice } from "@/lib/combo";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";

type DealItem =
  | {
      kind: "casa";
      name: string;
      location: string;
      bedrooms: number | null;
      capacity: number;
      price: number;
      unit: string;
      href: string;
      photo?: { url: string; alt?: string | null } | null;
    }
  | {
      kind: "tour";
      name: string;
      provider: string;
      price: number;
      unit: string;
      href: string;
      photo?: { url: string; alt?: string | null } | null;
    }
  | {
      kind: "combo";
      name: string;
      property: string;
      tourCount: number;
      originalPrice: number;
      comboPrice: number;
      discount: number;
      href: string;
      photo?: { url: string; alt?: string | null } | null;
    };

export function DealsSection({
  properties,
  tours,
  combos,
  locale,
  dict,
}: {
  properties: LocalizedProperty[];
  tours: LocalizedTour[];
  combos: LocalizedCombo[];
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.home.deals;

  const pick = (list: LocalizedProperty[]): LocalizedProperty[] =>
    [...list.filter((p) => p.featured), ...list.filter((p) => !p.featured)];

  const pickTours = (list: LocalizedTour[]): LocalizedTour[] =>
    [...list.filter((x) => x.featured), ...list.filter((x) => !x.featured)];

  const pickCombos = (list: LocalizedCombo[]): LocalizedCombo[] =>
    [...list.filter((c) => c.featured), ...list.filter((c) => !c.featured)];

  const items: DealItem[] = [
    ...pick(properties)
      .slice(0, 2)
      .map((p) => ({
        kind: "casa" as const,
        name: p.name,
        location: p.location_label,
        bedrooms: p.bedrooms,
        capacity: p.capacity,
        price: p.price_per_night,
        unit: dict.card.property.perNight,
        href: `/${locale}/casas/${p.slug}`,
        photo: p.photos[0] ?? null,
      })),
    ...pickTours(tours)
      .slice(0, 1)
      .map((tour) => ({
        kind: "tour" as const,
        name: tour.name,
        provider: tour.provider,
        price: tour.price,
        unit: dict.card.tour.perPerson,
        href: `/${locale}/tours/${tour.slug}`,
        photo: tour.photos[0] ?? null,
      })),
    ...pickCombos(combos)
      .slice(0, 1)
      .map((combo) => {
        const prices = calculateComboPrice(
          { discount_pct: combo.discount_pct },
          combo.property,
          combo.tours,
        );
        return {
          kind: "combo" as const,
          name: combo.name,
          property: combo.property?.name ?? "",
          tourCount: combo.tours.length,
          originalPrice: prices.original,
          comboPrice: prices.comboPrice,
          discount: combo.discount_pct,
          href: `/${locale}/combos/${combo.slug}`,
          photo: combo.photos[0] ?? combo.property?.photos[0] ?? null,
        };
      }),
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-ink to-mar-deep p-8 text-white shadow-soft-lg sm:p-10 lg:col-span-4">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-14 -top-14 size-56 rounded-full bg-coral/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-10 size-56 rounded-full bg-viola/25 blur-3xl"
          />

          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-pina px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
                <Flame className="size-3.5" aria-hidden />
                {t.eyebrow}
              </p>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight">{t.title}</h2>
              <p className="mt-3 max-w-sm text-sm text-white/75">{t.text}</p>
            </div>

            <Link
              href={`/${locale}/casas`}
              className="btn inline-flex items-center justify-center gap-2 rounded-full bg-coral-deep px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              {t.all}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {item.photo ? (
                  <Image
                    src={item.photo.url}
                    alt={item.photo.alt ?? item.name}
                    fill
                    sizes="(max-width: 1024px) 92vw, 24vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted text-sm font-medium text-muted-foreground">
                    {item.name}
                  </div>
                )}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-coral-deep px-2.5 py-1 text-[11px] font-bold text-white shadow-soft-lg">
                  {item.kind === "combo" ? `${item.discount}% off` : t.badge}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-faint">
                  {item.kind === "casa" ? item.location : item.kind === "tour" ? item.provider : item.property}
                </p>
                <h3 className="mt-1 line-clamp-2 font-display text-lg font-bold leading-snug text-ink">
                  {item.name}
                </h3>

                {item.kind === "casa" && (
                  <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-mute">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                      <BedDouble className="size-3 text-coral-deep" aria-hidden />
                      {item.bedrooms ?? 0} {dict.card.property.bedrooms}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                      <Users className="size-3 text-coral-deep" aria-hidden />
                      {item.capacity} {dict.card.property.guests}
                    </span>
                  </p>
                )}

                {item.kind === "combo" && (
                  <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-mute">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                      <Package className="size-3 text-coral-deep" aria-hidden />
                      {item.tourCount} tour{item.tourCount !== 1 ? "s" : ""}
                    </span>
                  </p>
                )}

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
                  {item.kind === "combo" ? (
                    <p className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-mute">
                        {t.from}
                      </span>
                      <span className="flex items-baseline gap-1.5">
                        <span className="font-display text-2xl font-extrabold leading-none tabular-nums text-ink">
                          {formatUSD(item.comboPrice)}
                        </span>
                        <span className="text-[10px] text-mute line-through">
                          {formatUSD(item.originalPrice)}
                        </span>
                      </span>
                    </p>
                  ) : (
                    <p className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-mute">
                        {t.from} · {item.unit}
                      </span>
                      <span className="font-display text-2xl font-extrabold leading-none tabular-nums text-ink">
                        {formatUSD(item.price)}
                      </span>
                    </p>
                  )}
                  <span
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors duration-300 group-hover:bg-coral-deep group-hover:shadow-soft"
                    aria-hidden
                  >
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}