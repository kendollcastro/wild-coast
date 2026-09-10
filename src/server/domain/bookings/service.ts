import "server-only";
import { getSupabaseAdmin } from "@/server/db/server";
import type { BookingsRow } from "@/server/db/schema.types";
import type { CreateBookingArgs } from "@/server/db/schema.types";
import {
  mapBookingError,
  propertyBookingSchema,
  tourBookingSchema,
  type BookingErrorCode,
  type BookingInput,
} from "./schema";
import { getPaymentAdapter } from "../payments/noop-adapter";
import type { PaymentCheckoutResult } from "../payments/types";
import { sendBookingNotifications } from "./notifications";
import { addDaysISO, localDateISO } from "@/lib/dates";

export type CreateBookingOutcome =
  | { ok: true; booking: BookingsRow; payment: PaymentCheckoutResult }
  | {
      ok: false;
      errorCode: BookingErrorCode;
      message: string;
    };

export async function createBookingRequest(input: BookingInput): Promise<CreateBookingOutcome> {
  // -------------------------------------------------------------------------
  // TODO: payment gateway integration point (Fygaro).
  // El adapter de pago se invoca más abajo tras crear la reserva 'pending'.
  // -------------------------------------------------------------------------

  let args: CreateBookingArgs;

  if (input.booking_type === "property") {
    const result = propertyBookingSchema.safeParse(input);
    if (!result.success) return invalid(result);
    const d = result.data;
    args = {
      p_booking_type: "property",
      p_property_id: d.property_id,
      p_tour_id: null,
      p_guest_name: d.guest_name,
      p_guest_email: d.guest_email,
      p_guest_phone: d.guest_phone || null,
      p_party_size: d.party_size,
      p_check_in: d.check_in,
      p_check_out: d.check_out,
      p_tour_date: null,
      p_notes: d.notes || null,
    };
  } else {
    const result = tourBookingSchema.safeParse(input);
    if (!result.success) return invalid(result);
    const d = result.data;
    args = {
      p_booking_type: "tour",
      p_property_id: null,
      p_tour_id: d.tour_id,
      p_guest_name: d.guest_name,
      p_guest_email: d.guest_email,
      p_guest_phone: d.guest_phone || null,
      p_party_size: d.party_size,
      p_check_in: null,
      p_check_out: null,
      p_tour_date: d.tour_date,
      p_notes: d.notes || null,
    };
  }

  // El RPC es la transacción atómica: sin solapamiento posible
  // (constraint EXCLUDE + lock SELECT ... FOR UPDATE dentro del RPC).
  const { data: booking, error } = await getSupabaseAdmin().rpc("create_booking", args);

  if (error || !booking) {
    const code = mapBookingError(error?.message);
    const message =
      code === "dates_not_available"
        ? "Alguna de esas fechas ya no está disponible. Elegí otras y probá de nuevo."
        : code === "tour_not_available_on_date"
          ? "Ese tour ya no tiene cupo para la fecha elegida."
          : code === "guest_count_exceeds_capacity"
            ? "El número de personas supera la capacidad."
            : "No pudimos procesar tu solicitud. Volvé a intentar, por favor.";
    return { ok: false, errorCode: code as BookingErrorCode, message };
  }

  // Aquí se invoca el adapter de pago. En el MVP devuelve 'not_required'
  // (la reserva queda pendiente de confirmación). Cuando exista proveedor
  // (Fygaro), acá se crea el checkout y se redirige al huésped.
  const payment = await getPaymentAdapter().createCheckout({
    booking,
    returnUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "/",
  });

  // Notificaciones al dueño/proveedor y al cliente (mejor esfuerzo).
  await sendBookingNotifications(booking);

  return { ok: true, booking, payment };
}

function invalid(result: { error: { issues: { message: string }[] } }): CreateBookingOutcome {
  const first = result.error.issues[0]?.message ?? "Datos inválidos";
  return { ok: false, errorCode: "invalid_booking_type", message: first };
}

// ---------------------------------------------------------------------------
// Disponibilidad (usado por calendarios del catálogo y del formulario)
// ---------------------------------------------------------------------------

export interface AvailabilityRange {
  start: string;
  end: string;
  reason: "booking" | "blocked" | "owner";
}

export async function getPropertyAvailability(propertyId: string): Promise<AvailabilityRange[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("availability_calendar")
    .select("start_date, end_date, reason")
    .eq("property_id", propertyId)
    .gte("end_date", localDateISO());

  if (error) return [];
  return (data ?? []).map((row) => ({
    start: row.start_date,
    end: row.end_date,
    reason: row.reason,
  }));
}

export async function getTourAvailability(tourId: string): Promise<AvailabilityRange[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("availability_calendar")
    .select("start_date, end_date, reason")
    .eq("tour_id", tourId)
    .gte("end_date", localDateISO());

  if (error) return [];
  return (data ?? []).map((row) => ({
    start: row.start_date,
    end: row.end_date,
    reason: row.reason,
  }));
}

/** Set de fechas ISO (yyyy-mm-dd) bloqueadas para pintar el calendario. */
export function rangesToDisabledDates(ranges: AvailabilityRange[]): Set<string> {
  const set = new Set<string>();
  for (const range of ranges) {
    let cursor = range.start;
    while (cursor < range.end) {
      set.add(cursor);
      cursor = addDaysISO(cursor, 1);
    }
  }
  return set;
}