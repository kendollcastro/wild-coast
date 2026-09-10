"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitBooking } from "@/app/(site)/reservar/actions";
import type { TourWithPhotos } from "@/server/db/schema.types";
import { formatUSD, formatDateShort } from "@/lib/format";
import { AvailabilityCalendar } from "@/components/site/AvailabilityCalendar";
import { BookingConfirmed } from "./BookingConfirmed";
import { GuestFields } from "./GuestFields";

export function TourBookingForm({
  tour,
  disabledDates,
  initial,
}: {
  tour: TourWithPhotos;
  disabledDates: string[];
  initial: { date: string; guests: number };
}) {
  const [state, formAction] = useActionState(submitBooking, null);
  const [date, setDate] = useState(initial.date);
  const [guests, setGuests] = useState(initial.guests);

  const total = date ? tour.price * guests : 0;

  if (state?.ok) {
    return <BookingConfirmed booking={state.booking} />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
        <header className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg font-bold text-white">
            1
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink">El tour</p>
            <p className="truncate text-sm text-mute">
              {tour.name} · operado por {tour.provider}
            </p>
          </div>
          <span className="ml-auto shrink-0 text-lg font-bold text-ink">
            {formatUSD(tour.price)}
            <span className="text-xs font-normal text-mute"> /persona</span>
          </span>
        </header>

        <div className="space-y-4 p-5">
          <AvailabilityCalendar
            mode="single"
            disabledDates={disabledDates}
            tourDate={date}
            onChange={(value) => setDate(value ?? "")}
          />

          <div>
            <label htmlFor="tk-guests" className="field-label">
              Personas
            </label>
            <select
              id="tk-guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="field mt-1.5"
            >
              {Array.from({ length: Math.min(tour.capacity, 12) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "persona" : "personas"}
                </option>
              ))}
            </select>
          </div>

          <dl className="grid grid-cols-2 gap-2 border-t border-line pt-4 text-center">
            <div className="rounded-2xl bg-muted/60 px-2 py-3">
              <dt className="text-[11px] uppercase tracking-wide text-mute">Fecha</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{date ? formatDateShort(date) : "—"}</dd>
            </div>
            <div className="rounded-2xl bg-coral-soft px-2 py-3">
              <dt className="text-[11px] uppercase tracking-wide text-coral-deep">Total</dt>
              <dd className="mt-1 text-base font-bold text-coral-deep">
                {date ? formatUSD(total) : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
        <header className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-coral-deep font-display text-lg font-bold text-white">
            2
          </span>
          <div>
            <p className="font-semibold text-ink">Tus datos</p>
            <p className="text-sm text-mute">Confirmamos el cupo por email, sin pago adelantado</p>
          </div>
        </header>

        <form action={formAction} className="p-5">
          <input type="hidden" name="booking_type" value="tour" />
          <input type="hidden" name="tour_id" value={tour.id} />
          <input type="hidden" name="tour_date" value={date} />
          <input type="hidden" name="party_size" value={guests} />

          <GuestFields error={state && !state.ok ? state.message : null} disabled={!date} />
        </form>
      </section>

      <p className="text-center text-sm text-mute">
        ¿Cambiaron los planes?{" "}
        <Link
          href={`/tours/${tour.slug}`}
          className="font-semibold text-coral-deep underline underline-offset-2 hover:text-coral"
        >
          Volver al tour
        </Link>
      </p>
    </div>
  );
}