"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthGrid, monthKeyOf, monthLabel, weekdayLabels, localDateISO } from "@/lib/dates";
import { useI18n } from "./i18n-provider";

type SharedProps = {
  disabledDates: string[]; // ISO dates bloqueadas
  checkIn?: string | null;
  checkOut?: string | null;
};

type Props = SharedProps &
  (
    | { mode: "range"; onChange: (checkIn: string | null, checkOut: string | null) => void }
    | { mode: "single"; tourDate?: string | null; onChange: (date: string | null) => void }
  );

export function AvailabilityCalendar(props: Props) {
  const { locale, dict } = useI18n();
  const t = dict.calendar;
  const disabled = useMemo(() => new Set(props.disabledDates), [props.disabledDates]);
  const today = localDateISO();

  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const monthIndex = cursor.getMonth();
  const { blanks, days } = monthGrid(year, monthIndex);
  const label = monthLabel(year, monthIndex, locale);
  const weekdayLabelsForLocale = weekdayLabels(locale);

  const canPrev = monthKeyOf(`${year}-${String(monthIndex + 1).padStart(2, "0")}-01`) > monthKeyOf(today);

  const grid = useMemo(() => {
    const cells: string[] = [];
    for (let i = 0; i < blanks; i++) cells.push("");
    for (let d = 1; d <= days; d++) {
      cells.push(`${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return cells;
  }, [year, monthIndex, blanks, days]);

  function select(iso: string) {
    if (disabled.has(iso) || iso < today) return;
    if (props.mode === "single") {
      props.onChange(props.tourDate === iso ? null : iso);
      return;
    }
    if (!props.checkIn || (props.checkIn && props.checkOut)) {
      props.onChange(iso, null);
    } else if (iso > props.checkIn) {
      props.onChange(props.checkIn, iso);
    } else {
      props.onChange(iso, null);
    }
  }

  function cellClass(iso: string): string {
    if (!iso) return "";
    const isDisabled = disabled.has(iso) || iso < today;
    const isCheckIn = props.mode === "range" && iso === props.checkIn;
    const isCheckOut = props.mode === "range" && iso === props.checkOut && iso !== props.checkIn;
    const inRange =
      props.mode === "range" && props.checkIn && props.checkOut && iso > props.checkIn && iso < props.checkOut;
    const isTourDate = props.mode === "single" && iso === props.tourDate;
    const isToday = iso === today;
    const isSelected = isCheckIn || isCheckOut || isTourDate;

    const base =
      "flex aspect-square items-center justify-center rounded-full text-[13px] tabular-nums transition-colors";
    if (isDisabled) return `${base} cursor-not-allowed text-faint/80 disabled:cursor-not-allowed`;
    if (isSelected)
      return `${base} day-pop bg-coral-deep font-semibold text-white shadow-soft ${
        isToday ? "ring-2 ring-coral/40 ring-offset-1 ring-offset-white" : ""
      }`;
    if (inRange) return `${base} bg-coral-soft font-medium text-coral-deep hover:bg-coral-soft/80`;
    return `${base} cursor-pointer text-ink hover:bg-muted ${isToday ? "font-semibold text-coral-deep" : ""}`;
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <p aria-live="polite" className="font-display text-lg font-bold text-ink">
          {label}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={t.prevMonth}
            disabled={!canPrev}
            onClick={() => setCursor(new Date(year, monthIndex - 1, 1))}
            className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={t.nextMonth}
            onClick={() => setCursor(new Date(year, monthIndex + 1, 1))}
            className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-muted active:scale-95"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {weekdayLabelsForLocale.map((w) => (
          <div key={w} className="pb-1 text-center text-[11px] font-semibold uppercase text-mute">
            {w}
          </div>
        ))}
        {grid.map((iso, i) => {
          if (!iso) return <div key={`blank-${i}`} />;
          const isDisabled = disabled.has(iso) || iso < today;
          const selected =
            (props.mode === "range" && (iso === props.checkIn || iso === props.checkOut)) ||
            (props.mode === "single" && iso === props.tourDate);
          const dayNum = Number(iso.slice(8, 10));
          const dayAria = (tpl: string) =>
            tpl.replace("{day}", String(dayNum)).replace("{month}", label);
          return (
            <button
              key={iso}
              type="button"
              disabled={isDisabled}
              aria-pressed={selected}
              aria-label={isDisabled ? dayAria(t.occupiedAria) : dayAria(t.dayAria)}
              onClick={() => select(iso)}
              className={cellClass(iso)}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-[11px] text-mute">
        <span className="inline-flex items-center gap-1.5">
          <span className="relative inline-block size-2.5 rounded-full bg-faint">
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: "repeating-linear-gradient(135deg, transparent 0 1px, #BC3B27 1px 2px)" }}
            />
          </span>
          {t.occupied}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-coral-deep" /> {t.selected}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-line bg-white" /> {t.available}
        </span>
      </div>
    </div>
  );
}