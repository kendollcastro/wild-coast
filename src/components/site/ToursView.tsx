"use client";

import { useMemo } from "react";
import type { LocalizedTour } from "@/server/domain/catalog/localize";
import { formatDayShort } from "@/lib/format";
import { useI18n } from "./i18n-provider";
import { TourCard } from "./TourCard";
import { InView } from "./Reveal";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function ToursView({
  tours,
  disabledByTourId,
}: {
  tours: LocalizedTour[];
  disabledByTourId: Record<string, string[]>;
}) {
  const { locale, dict } = useI18n();
  const t = dict.tours.list;

  const tourDate = useMemo(() => {
    if (typeof window === "undefined") return "";
    const raw = new URLSearchParams(window.location.search).get("check_in") ?? "";
    return DATE_RE.test(raw) ? raw : "";
  }, []);

  const visible = useMemo(() => {
    if (!tourDate) return tours;
    return tours.filter((tour) => !(disabledByTourId[tour.id] ?? []).includes(tourDate));
  }, [tours, disabledByTourId, tourDate]);

  return (
    <>
      {tourDate && (
        <p className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-pina-soft px-3.5 py-1.5 text-sm font-semibold text-ink">
          {visible.length > 0
            ? t.available
                .replace("{count}", String(visible.length))
                .replace("{date}", formatDayShort(tourDate, locale))
            : t.none.replace("{date}", formatDayShort(tourDate, locale))}
        </p>
      )}

      {visible.length > 0 ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((tour, i) => (
            <InView key={tour.id} delay={(i % 4) * 70}>
              <TourCard tour={tour} />
            </InView>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{tourDate ? t.emptyDate : t.empty}</p>
      )}
    </>
  );
}