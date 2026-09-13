"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BadgePercent, BedDouble, MapPin, Package } from "lucide-react";
import type { LocalizedCombo } from "@/server/domain/catalog/localize";
import { calculateComboPrice } from "@/lib/combo";
import { formatUSD } from "@/lib/format";
import { useI18n } from "./i18n-provider";

export function ComboDetail({ combo }: { combo: LocalizedCombo }) {
  const { locale, dict } = useI18n();
  const t = dict.combos.detail;
  const c = dict.card.property;

  const prices = calculateComboPrice(
    { discount_pct: combo.discount_pct },
    combo.property,
    combo.tours,
  );

  const propertyHref = combo.property ? `/${locale}/casas/${combo.property.slug}` : "#";

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <Link
          href={`/${locale}/combos`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-mute transition hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t.back}
        </Link>
        <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          {combo.name}
        </h1>
        <p className="mt-1 text-sm text-mute">{t.suffix}</p>
      </div>

      {/* Gallery */}
      {combo.photos.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {combo.photos.slice(0, 3).map((photo, i) => (
            <div
              key={photo.id}
              className={`relative overflow-hidden rounded-2xl bg-muted ${
                i === 0 && combo.photos.length > 1 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
              }`}
            >
              <Image
                src={photo.url}
                alt={photo.alt ?? combo.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {combo.description && (
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-ink">{t.included}</h2>
          <p className="text-sm leading-relaxed text-mute">{combo.description}</p>
        </section>
      )}

      {/* Included items */}
      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">{t.included}</h2>

        {/* Property card */}
        {combo.property && (
          <div className="mb-4 overflow-hidden rounded-xl border border-line">
            <div className="flex items-start gap-4 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {combo.property.photos[0] ? (
                  <Image
                    src={combo.property.photos[0].url}
                    alt={combo.property.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BedDouble className="size-6 text-faint" aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-coral-deep">{t.yourCasa}</p>
                <Link href={propertyHref} className="mt-0.5 block text-sm font-bold text-ink hover:text-coral-deep">
                  {combo.property.name}
                </Link>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-mute">
                  <MapPin className="size-3" aria-hidden />
                  {combo.property.location_label}
                </p>
                <p className="mt-1 text-xs text-mute">
                  {combo.property.bedrooms} {c.bedrooms} · {combo.property.capacity} {c.guests}
                </p>
              </div>
              <p className="shrink-0 text-right">
                <span className="text-[10px] font-semibold uppercase text-mute">{t.perNight}</span>
                <br />
                <span className="font-display text-lg font-bold text-ink">{formatUSD(combo.property.price_per_night)}</span>
              </p>
            </div>
          </div>
        )}

        {/* Tours cards */}
        {combo.tours.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-coral-deep">{t.yourTours}</p>
            {combo.tours.map((tour) => (
              <div key={tour.id} className="flex items-start gap-4 rounded-xl border border-line p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {tour.photos[0] ? (
                    <Image
                      src={tour.photos[0].url}
                      alt={tour.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="size-5 text-faint" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/${locale}/tours/${tour.slug}`}
                    className="text-sm font-bold text-ink hover:text-coral-deep"
                  >
                    {tour.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-mute">{tour.provider}</p>
                </div>
                <p className="shrink-0 text-right">
                  <span className="text-[10px] font-semibold uppercase text-mute">{dict.panel.tour.perPerson}</span>
                  <br />
                  <span className="font-display text-lg font-bold text-ink">{formatUSD(tour.price)}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Price breakdown */}
      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">{t.comboTotal}</h2>

        <div className="space-y-3">
          <div className="flex justify-between text-sm text-mute">
            <span>{combo.property?.name ?? "Casa"} ({t.perNight})</span>
            <span className="tabular-nums">{formatUSD(combo.property?.price_per_night ?? 0)}</span>
          </div>
          {combo.tours.map((tour) => (
            <div key={tour.id} className="flex justify-between text-sm text-mute">
              <span>{tour.name} ({t.perPerson})</span>
              <span className="tabular-nums">{formatUSD(tour.price)}</span>
            </div>
          ))}

          <div className="border-t border-line pt-3">
            <div className="flex justify-between text-sm">
              <span>{t.originalTotal}</span>
              <span className="tabular-nums text-mute line-through">{formatUSD(prices.original)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-monte">
              <span className="inline-flex items-center gap-1 font-semibold">
                <BadgePercent className="size-3.5" aria-hidden />
                {t.savings} ({combo.discount_pct}% off)
              </span>
              <span className="tabular-nums font-bold">-{formatUSD(prices.savings)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="font-display text-lg font-bold text-ink">{t.comboTotal}</span>
            <span className="font-display text-2xl font-extrabold tabular-nums text-ink">
              {formatUSD(prices.comboPrice)}
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-ink via-ink to-mar-deep p-6 text-center text-white shadow-soft-lg sm:p-8">
        <Package className="mx-auto mb-3 size-8 text-pina" aria-hidden />
        <h2 className="font-display text-xl font-bold">{t.bookCombo}</h2>
        <p className="mt-2 text-sm text-white/70">{t.bookNote}</p>
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {combo.property && (
            <Link
              href={`/${locale}/casas/${combo.property.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-coral-deep px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              <BedDouble className="size-4" aria-hidden />
              {t.yourCasa}
            </Link>
          )}
          {combo.tours[0] && (
            <Link
              href={`/${locale}/tours/${combo.tours[0].slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition-all duration-200 hover:bg-white/25"
            >
              <Package className="size-4" aria-hidden />
              {t.yourTours}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
