"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitBooking } from "@/app/(site)/reservar/actions";
import type { PropertyWithPhotos } from "@/server/db/schema.types";
import { formatUSD, formatDateShort } from "@/lib/format";
import { nightsBetween } from "@/lib/dates";
import { AvailabilityCalendar } from "@/components/site/AvailabilityCalendar";
import { BookingConfirmed } from "./BookingConfirmed";
import { GuestFields } from "./GuestFields";

export function CasaBookingForm({
  property,
  disabledDates,
  initial,
}: {
  property: PropertyWithPhotos;
  disabledDates: string[];
  initial: { checkIn: string; checkOut: string; guests: number };
}) {
  const [state, formAction] = useActionState(submitBooking, null);
  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [guests, setGuests] = useState(initial.guests);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const total = nights > 0 ? nights * property.price_per_night : 0;
  const datesReady = nights > 0;

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
            <p className="font-semibold text-ink">Tu casa</p>
            <p className="truncate text-sm text-mute">{property.name}</p>
          </div>
          <span className="ml-auto shrink-0 text-lg font-bold text-ink">
            {formatUSD(property.price_per_night)}
            <span className="text-xs font-normal text-mute"> /noche</span>
          </span>
        </header>

        <div className="space-y-4 p-5">
          <AvailabilityCalendar
            mode="range"
            disabledDates={disabledDates}
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(inDate, outDate) => {
              setCheckIn(inDate ?? "");
              setCheckOut(outDate ?? "");
            }}
          />

          <div>
            <label htmlFor="ck-guests" className="field-label">
              Personas
            </label>
            <select
              id="ck-guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="field mt-1.5"
            >
              {Array.from({ length: Math.min(property.capacity, 12) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "persona" : "personas"}
                </option>
              ))}
            </select>
          </div>

          <dl className="grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
            <div className="rounded-2xl bg-muted/60 px-2 py-3">
              <dt className="text-[11px] uppercase tracking-wide text-mute">Llegada</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {checkIn ? formatDateShort(checkIn) : "—"}
              </dd>
            </div>
            <div className="rounded-2xl bg-muted/60 px-2 py-3">
              <dt className="text-[11px] uppercase tracking-wide text-mute">Salida</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {checkOut ? formatDateShort(checkOut) : "—"}
              </dd>
            </div>
            <div className="rounded-2xl bg-coral-soft px-2 py-3">
              <dt className="text-[11px] uppercase tracking-wide text-coral-deep">Total</dt>
              <dd className="mt-1 text-base font-bold text-coral-deep">
                {datesReady ? formatUSD(total) : "—"}
              </dd>
            </div>
          </dl>

          {!datesReady && (
            <p className="rounded-xl bg-muted/70 px-3 py-2.5 text-center text-[13px] text-mute">
              Elegí las fechas para continuar con tus datos.
            </p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
        <header className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-coral-deep font-display text-lg font-bold text-white">
            2
          </span>
          <div>
            <p className="font-semibold text-ink">Tus datos</p>
            <p className="text-sm text-mute">Te confirmamos por email, sin pago adelantado</p>
          </div>
        </header>

        <form action={formAction} className="p-5">
          <input type="hidden" name="booking_type" value="property" />
          <input type="hidden" name="property_id" value={property.id} />
          <input type="hidden" name="check_in" value={checkIn} />
          <input type="hidden" name="check_out" value={checkOut} />
          <input type="hidden" name="party_size" value={guests} />

          <GuestFields error={state && !state.ok ? state.message : null} disabled={!datesReady} />
        </form>
      </section>

      <p className="text-center text-sm text-mute">
        ¿Cambiaron los planes?{" "}
        <Link
          href={`/casas/${property.slug}`}
          className="font-semibold text-coral-deep underline underline-offset-2 hover:text-coral"
        >
          Volver a la casa
        </Link>
      </p>
    </div>
  );
}