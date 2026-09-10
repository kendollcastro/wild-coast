"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { LocalizedTour } from "@/server/domain/catalog/localize";
import { formatUSD } from "@/lib/format";
import { useI18n } from "./i18n-provider";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function readTourParams(capacity: number) {
  if (typeof window === "undefined") return { date: null, guests: 2 };
  const p = new URLSearchParams(window.location.search);
  const d = p.get("date");
  const g = p.get("guests");
  const date = d && DATE_RE.test(d) ? d : null;
  const n = Number.parseInt(g ?? "", 10);
  const guests = Number.isFinite(n) ? Math.min(Math.max(n, 1), capacity) : 2;
  return { date, guests };
}

export function TourBookingPanel({
  tour,
  disabledDates,
}: {
  tour: LocalizedTour;
  disabledDates: string[];
}) {
  const { dict } = useI18n();
  const t = dict.panel.tour;
  const [params] = useState(() => readTourParams(tour.capacity));
  const [date, setDate] = useState<string | null>(params.date);
  const [guests, setGuests] = useState(params.guests);

  const total = date ? tour.price * guests : 0;
  const checkoutHref = useMemo(() => {
    if (!date) return null;
    const params = new URLSearchParams({ date, guests: String(guests) });
    return `/reservar/tour/${tour.slug}?${params.toString()}`;
  }, [date, guests, tour.slug]);

  const ready = Boolean(checkoutHref);

  const panel = (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="tabular-nums text-2xl font-bold text-ink">
          {formatUSD(tour.price)}
          <span className="text-sm font-medium text-mute"> {t.perPerson}</span>
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-monte-soft px-2.5 py-1 text-[11px] font-semibold text-monte-deep">
          {t.limited}
        </span>
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-mute">
        <p className="inline-flex items-center gap-1.5">
          <Check className="size-3.5 text-monte" aria-hidden /> {t.noPrepay}
        </p>
        <p className="inline-flex items-center gap-1.5">
          <Check className="size-3.5 text-monte" aria-hidden /> {t.emailConfirm}
        </p>
        <p className="inline-flex items-center gap-1.5">
          <Check className="size-3.5 text-monte" aria-hidden /> {t.locals}
        </p>
      </div>

      <div className="mt-4">
        <AvailabilityCalendar mode="single" disabledDates={disabledDates} tourDate={date} onChange={setDate} />
      </div>

      <div className="mt-4">
        <label htmlFor="panel-tour-guests" className="field-label">
          {t.travelers}
        </label>
        <select
          id="panel-tour-guests"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="field mt-1.5"
        >
          {Array.from({ length: Math.min(tour.capacity, 12) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? t.person.one : t.person.other}
            </option>
          ))}
        </select>
      </div>

      {ready && (
        <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm tabular-nums">
          <div className="flex justify-between text-mute">
            <span>
              {formatUSD(tour.price)} × {guests} {guests === 1 ? t.person.one : t.person.other}
            </span>
            <span>{formatUSD(total)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-2.5">
            <span className="font-semibold text-ink">{t.total}</span>
            <span className="tabular-nums text-lg font-bold text-ink">{formatUSD(total)}</span>
          </div>
        </div>
      )}

      {!ready && (
        <p className="mt-4 rounded-xl bg-muted/70 px-3 py-2.5 text-center text-[13px] text-mute">
          {t.chooseDate}
        </p>
      )}

      {checkoutHref ? (
        <Link href={checkoutHref} className="btn-primary mt-4 w-full">
          {t.bookTour}
        </Link>
      ) : (
        <button type="button" disabled className="btn-primary mt-4 w-full">
          {t.book}
        </button>
      )}

      <p className="mt-3 text-center text-xs text-mute">{t.bottom}</p>
    </div>
  );

  return (
    <>
      <div className="hidden lg:sticky lg:top-24 lg:block">{panel}</div>

      <div className="rail-up fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-line bg-white/95 px-4 pb-4 pt-3 shadow-soft-xl backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div>
            <p className="tabular-nums text-lg font-bold text-ink">
              {total > 0 ? formatUSD(total) : t.from.replace("{price}", formatUSD(tour.price))}
            </p>
            <p className="text-xs text-mute">
              {total > 0 ? `${guests} ${guests === 1 ? t.person.one : t.person.other}` : t.perPersonShort}
            </p>
          </div>
          {checkoutHref ? (
            <Link href={checkoutHref} className="btn-primary btn-sm">
              {t.book}
            </Link>
          ) : (
            <button type="button" disabled className="btn-primary btn-sm">
              {t.book}
            </button>
          )}
        </div>
      </div>
      <div className="h-24 lg:hidden" />
    </>
  );
}