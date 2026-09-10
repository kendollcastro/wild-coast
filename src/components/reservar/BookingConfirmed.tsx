"use client";

import type { BookingsRow } from "@/server/db/schema.types";
import { formatUSD, formatDateShort } from "@/lib/format";

export function BookingConfirmed({ booking }: { booking: BookingsRow }) {
  const lines: [string, string][] =
    booking.booking_type === "property"
      ? [
          ["Llegada", formatDateShort(booking.check_in!)],
          ["Salida", formatDateShort(booking.check_out!)],
          ["Personas", String(booking.party_size)],
          ["Total", formatUSD(booking.total_amount)],
        ]
      : [
          ["Fecha", formatDateShort(booking.tour_date!)],
          ["Personas", String(booking.party_size)],
          ["Total", formatUSD(booking.total_amount)],
        ];

  const name = booking.guest_name.split(" ")[0];

  return (
    <div
      aria-live="polite"
      className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-8 text-center shadow-soft-lg"
    >
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-monte-soft">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8 text-monte"
          aria-hidden="true"
        >
          <path className="draw-check" d="M20 6 9 17l-5-5" pathLength={1} />
        </svg>
      </span>

      <p className="mt-5 text-3xl font-bold tracking-tight text-ink">¡Listo, {name}!</p>
      <p className="mt-2 text-sm leading-relaxed text-mute">
        Anotamos tu reserva como pendiente de confirmación. Te llega un email y el anfitrión te avisa
        apenas esté confirmada. Sin pago adelantado.
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-muted/50 p-5 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-mute">Código de reserva</p>
        <p className="mt-1 font-mono text-2xl font-bold tracking-wide text-coral-deep">
          {booking.booking_code}
        </p>
        <dl className="mt-4 divide-y divide-line border-t border-line">
          {lines.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2.5">
              <dt className="text-sm text-mute">{k}</dt>
              <dd className="tabular-nums text-sm font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-4 text-xs text-mute">
        Guardá este código: lo usamos para confirmar tu reserva.
      </p>
    </div>
  );
}