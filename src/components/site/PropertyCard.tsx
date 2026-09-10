"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BedDouble, Handshake, Star, Users } from "lucide-react";
import type { LocalizedProperty } from "@/server/domain/catalog/localize";
import { formatUSD } from "@/lib/format";
import { useI18n } from "./i18n-provider";
import { SaveButton } from "./SaveButton";

export function PropertyCard({
  property,
  checkIn = "",
  checkOut = "",
}: {
  property: LocalizedProperty;
  checkIn?: string;
  checkOut?: string;
}) {
  const { locale, dict } = useI18n();
  const photo = property.photos[0];
  const params = new URLSearchParams();
  if (checkIn) params.set("check_in", checkIn);
  if (checkOut) params.set("check_out", checkOut);
  const qs = params.toString();
  const href = `/${locale}/casas/${property.slug}${qs ? `?${qs}` : ""}`;
  const c = dict.card.property;

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <Link href={href} className="relative block h-full">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
          {photo ? (
            <Image
              src={photo.url}
              alt={photo.alt ?? property.name}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-sm font-medium text-muted-foreground">
              {property.name}
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-ink/5"
            aria-hidden
          />
        </div>

        {property.featured && (
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-pina px-2.5 py-1 text-[11px] font-bold text-ink shadow-soft">
              <Star className="size-3 fill-ink" aria-hidden />
              {c.featured}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          <div className="flex items-end justify-between gap-3">
            <p className="flex items-baseline gap-1.5 text-white">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                {c.from}
              </span>
              <span className="font-display text-2xl font-extrabold leading-none tabular-nums">
                {formatUSD(property.price_per_night)}
              </span>
              <span className="text-xs text-white/70">{c.perNight}</span>
            </p>
            <span
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition-colors duration-300 group-hover:bg-coral-deep group-hover:ring-coral-deep"
              aria-hidden
            >
              <ArrowUpRight className="size-4" />
            </span>
          </div>

          <h3 className="mt-2 line-clamp-1 font-display text-xl font-bold leading-tight text-white">
            {property.name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-white/75">{property.location_label}</p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-white">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 backdrop-blur">
              <BedDouble className="size-3" aria-hidden /> {property.bedrooms} {c.bedrooms}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 backdrop-blur">
              <Users className="size-3" aria-hidden /> {property.capacity} {c.guests}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-coral-deep/90 px-2 py-1 backdrop-blur">
              <Handshake className="size-3" aria-hidden /> {c.direct}
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute right-3 top-3 z-20">
        <SaveButton id={`casa-${property.id}`} />
      </div>
    </article>
  );
}