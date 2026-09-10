"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock, Users } from "lucide-react";
import type { LocalizedTour } from "@/server/domain/catalog/localize";
import { formatUSD } from "@/lib/format";
import { useI18n } from "./i18n-provider";
import { SaveButton } from "./SaveButton";

const CATEGORY_STYLE: Record<string, { chip: string; bar: string }> = {
  aventura: { chip: "bg-coral-deep text-white", bar: "from-coral to-pina" },
  naturaleza: { chip: "bg-monte-deep text-white", bar: "from-monte to-pina" },
  atardecer: { chip: "bg-pina text-ink", bar: "from-pina to-coral" },
  cultural: { chip: "bg-ink text-white", bar: "from-ink to-monte" },
};

export function TourCard({ tour }: { tour: LocalizedTour }) {
  const { locale, dict } = useI18n();
  const photo = tour.photos[0];
  const href = `/${locale}/tours/${tour.slug}`;
  const style = tour.category ? CATEGORY_STYLE[tour.category] : undefined;
  const label = tour.category
    ? (dict.explorer.tour.categories[tour.category as keyof typeof dict.explorer.tour.categories] ?? tour.category)
    : dict.card.tour.fallback;
  const chip = style?.chip ?? "bg-monte-deep text-white";
  const bar = style?.bar ?? "from-monte to-coral";
  const c = dict.card.tour;

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <Link href={href} className="relative block h-full">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink">
          {photo ? (
            <Image
              src={photo.url}
              alt={photo.alt ?? tour.name}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 23vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-ink text-sm font-medium text-white/60">
              {tour.name}
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-ink/5"
            aria-hidden
          />
        </div>

        <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-soft ${chip}`}>
            {label}
          </span>
          {tour.duration_hours != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
              <Clock className="size-3" aria-hidden /> {c.hours.replace("{count}", String(tour.duration_hours))}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          <div className="flex items-end justify-between gap-3">
            <p className="flex items-baseline gap-1.5 text-white">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                {c.from.replace("{price}", formatUSD(tour.price))}
              </span>
              <span className="text-xs text-white/70">{c.perPerson}</span>
            </p>
            <span
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition-colors duration-300 group-hover:bg-monte-deep group-hover:ring-monte-deep"
              aria-hidden
            >
              <ArrowUpRight className="size-4" />
            </span>
          </div>

          <h3 className="mt-2 line-clamp-1 font-display text-xl font-bold leading-tight text-white">
            {tour.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-white/75">
            <Users className="size-3.5 shrink-0" aria-hidden /> {c.provider.replace("{name}", tour.provider)}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-white/70">{c.view}</span>
            <span className={`h-1.5 w-9 shrink-0 rounded-full bg-gradient-to-r ${bar}`} aria-hidden />
          </div>
        </div>
      </Link>

      <div className="absolute right-3 top-3 z-20">
        <SaveButton id={`tour-${tour.id}`} />
      </div>
    </article>
  );
}