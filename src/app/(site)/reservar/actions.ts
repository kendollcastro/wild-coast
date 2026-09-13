"use server";

import { createBookingRequest, type CreateBookingOutcome } from "@/server/domain/bookings/service";
import { createPaymentIntent } from "@/lib/onvo";
import { rateLimitByIp } from "@/server/lib/rate-limit";

/**
 * Server Action de reserva. Crea la reserva y, si ONVO está configurado,
 * genera un payment intent para el paso de pago.
 */
export async function submitBooking(_prev: CreateBookingOutcome | null, form: FormData) {
  const allowed = await rateLimitByIp("booking", 5, 60 * 60);
  if (!allowed) {
    return {
      ok: false as const,
      errorCode: "dates_not_available" as const,
      message: "Hiciste demasiadas solicitudes en poco tiempo. Probalo en una hora.",
    };
  }

  const bookingType = String(form.get("booking_type") ?? "");

  let result: CreateBookingOutcome;

  if (bookingType === "tour") {
    result = await createBookingRequest({
      booking_type: "tour",
      tour_id: String(form.get("tour_id") ?? ""),
      tour_date: String(form.get("tour_date") ?? ""),
      party_size: Number(form.get("party_size") ?? 1),
      guest_name: String(form.get("guest_name") ?? ""),
      guest_email: String(form.get("guest_email") ?? ""),
      guest_phone: String(form.get("guest_phone") ?? ""),
      notes: String(form.get("notes") ?? ""),
    });
  } else {
    result = await createBookingRequest({
      booking_type: "property",
      property_id: String(form.get("property_id") ?? ""),
      check_in: String(form.get("check_in") ?? ""),
      check_out: String(form.get("check_out") ?? ""),
      party_size: Number(form.get("party_size") ?? 1),
      guest_name: String(form.get("guest_name") ?? ""),
      guest_email: String(form.get("guest_email") ?? ""),
      guest_phone: String(form.get("guest_phone") ?? ""),
      notes: String(form.get("notes") ?? ""),
    });
  }

  return result;
}

/**
 * Crea un payment intent de ONVO para una reserva existente.
 */
export async function createPaymentIntentAction({
  amount,
  currency,
  description,
  bookingId,
}: {
  amount: number;
  currency?: string;
  description: string;
  bookingId: string;
}) {
  const intent = await createPaymentIntent({
    amount,
    currency: currency ?? "USD",
    description,
    metadata: { bookingId },
  });
  return { paymentIntentId: intent.id };
}
