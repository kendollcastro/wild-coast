"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, Tag, Users } from "lucide-react";
import type { LocalizedCombo } from "@/server/domain/catalog/localize";
import { formatUSD } from "@/lib/format";
import { calculateComboPrice } from "@/lib/combo";
import { useI18n } from "./i18n-provider";

export function ComboCard({ combo }: { combo: LocalizedCombo }) {
  const { locale, dict } = useI18n();
  const photo = combo.photos[0] ?? combo.property?.photos[0];
  const href = `/${locale}/combos/${combo.slug}`;
  const c = dict.combos.card;

  const prices = calculateComboPrice(
    { discount_pct: combo.discount_pct },
    combo.property,
    combo.tours,
  );

  const tourCount = combo.tours.length;
  const tourLabel = tourCount === 1 ? "tour" : "tours";

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <Link href={href} className="relative block h-full">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
          {photo ? (
            <Image
              src={photo.url}
              alt={photo.alt ?? combo.name}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-sm font-medium text-muted-foreground">
              <Package className="size-8 text-faint" aria-hidden />
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-ink/5"
            aria-hidden
          />
        </div>

        {combo.badge_text && (
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-coral-deep px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
              <Tag className="size-3" aria-hidden />
              {combo.badge_text}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          <div className="flex items-end justify-between gap-3">
            <p className="flex flex-col text-white">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
                {c.discount.replace("{pct}", String(combo.discount_pct))}
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-extrabold leading-none tabular-nums">
                  {formatUSD(prices.comboPrice)}
                </span>
                <span className="text-[10px] text-white/60 line-through">
                  {formatUSD(prices.original)}
                </span>
              </span>
            </p>
            <span
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition-colors duration-300 group-hover:bg-coral-deep group-hover:ring-coral-deep"
              aria-hidden
            >
              <ArrowRight className="size-4" />
            </span>
          </div>

          <h3 className="mt-2 line-clamp-1 font-display text-xl font-bold leading-tight text-white">
            {combo.name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-white/75">
            {combo.property?.name ?? "Casa"} · {tourCount} {tourLabel}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-white">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 backdrop-blur">
              <Users className="size-3" aria-hidden /> {c.casa}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 backdrop-blur">
              <Package className="size-3" aria-hidden /> {c.tours.replace("{count}", String(tourCount)).replace("{plural}", tourCount !== 1 ? "s" : "")}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
