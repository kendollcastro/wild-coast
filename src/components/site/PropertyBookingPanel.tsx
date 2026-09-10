"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import type { LocalizedProperty } from "@/server/domain/catalog/localize";
import { formatUSD } from "@/lib/format";
import { nightsBetween } from "@/lib/dates";
import { useI18n } from "./i18n-provider";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function readPropertyParams(capacity: number) {
  if (typeof window === "undefined") return { checkIn: null, checkOut: null, guests: 2 };
  const p = new URLSearchParams(window.location.search);
  const ci = p.get("check_in");
  const co = p.get("check_out");
  const g = p.get("guests");
  const checkIn = ci && DATE_RE.test(ci) ? ci : null;
  const checkOut = co && DATE_RE.test(co) ? co : null;
  const n = Number.parseInt(g ?? "", 10);
  const guests = Number.isFinite(n) ? Math.min(Math.max(n, 1), capacity) : 2;
  return { checkIn, checkOut, guests };
}

export function PropertyBookingPanel({
  property,
  disabledDates,
}: {
  property: LocalizedProperty;
  disabledDates: string[];
}) {
  const { dict } = useI18n();
  const t = dict.panel.property;
  const [params] = useState(() => readPropertyParams(property.capacity));
  const [checkIn, setCheckIn] = useState<string | null>(params.checkIn);
  const [checkOut, setCheckOut] = useState<string | null>(params.checkOut);
  const [guests, setGuests] = useState(params.guests);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const total = nights > 0 ? nights * property.price_per_night : 0;

  const checkoutHref = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const params = new URLSearchParams({ check_in: checkIn, check_out: checkOut, guests: String(guests) });
    return `/reservar/casa/${property.slug}?${params.toString()}`;
  }, [checkIn, checkOut, guests, property.slug]);

  const ready = Boolean(checkoutHref);

  const panel = (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="tabular-nums text-2xl font-bold text-ink">
          {formatUSD(property.price_per_night)}
          <span className="text-sm font-medium text-mute"> {t.perNight}</span>
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-coral-soft px-2.5 py-1 text-[11px] font-semibold text-coral-deep">
          <Sparkles className="size-3" aria-hidden /> {t.new}
        </span>
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-mute">
        <p className="inline-flex items-center gap-1.5">
          <Check className="size-3.5 text-monte" aria-hidden /> {t.noPrepay}
        </p>
        <p className="inline-flex items-center gap-1.5">
          <Check className="size-3.5 text-monte" aria-hidden /> {t.email24}
        </p>
        <p className="inline-flex items-center gap-1.5">
          <Check className="size-3.5 text-monte" aria-hidden /> {t.direct}
        </p>
      </div>

      <div className="mt-4">
        <AvailabilityCalendar
          mode="range"
          disabledDates={disabledDates}
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={(inDate, outDate) => {
            setCheckIn(inDate);
            setCheckOut(outDate);
          }}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="panel-guests" className="field-label">
          {t.guests}
        </label>
        <select
          id="panel-guests"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="field mt-1.5"
        >
          {Array.from({ length: Math.min(property.capacity, 12) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? t.guest.one : t.guest.other}
            </option>
          ))}
        </select>
      </div>

      {ready && (
        <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm tabular-nums">
          <div className="flex justify-between text-mute">
            <span>
              {formatUSD(property.price_per_night)} × {nights} {nights === 1 ? t.night.one : t.night.other}
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
          {checkIn && !checkOut ? t.chooseOut : t.chooseDates}
        </p>
      )}

      {checkoutHref ? (
        <Link href={checkoutHref} className="btn-primary mt-4 w-full">
          {t.bookDates}
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

      {/* Rail móvil sticky */}
      <div className="rail-up fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-line bg-white/95 px-4 pb-4 pt-3 shadow-soft-xl backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div>
            <p className="tabular-nums text-lg font-bold text-ink">
              {total > 0 ? formatUSD(total) : formatUSD(property.price_per_night)}
            </p>
            <p className="text-xs text-mute">
              {total > 0 ? `${nights} ${nights === 1 ? t.night.one : t.night.other}` : t.perNightShort}
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