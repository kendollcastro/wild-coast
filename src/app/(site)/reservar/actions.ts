"use server";

import { createBookingRequest, type CreateBookingOutcome } from "@/server/domain/bookings/service";
import { rateLimitByIp } from "@/server/lib/rate-limit";

/**
 * Server Action de reserva. La mutación (crear booking + bloquear fechas) ocurre
 * en el RPC atómico de Supabase; acá solo se orquesta validación, adapter de pago
 * y notificaciones. Ver también: TODO payment gateway integration point.
 */
export async function submitBooking(_prev: CreateBookingOutcome | null, form: FormData) {
  // Máximo 5 solicitudes por IP cada hora (anti-spam / anti-bloqueo de fechas).
  const allowed = await rateLimitByIp("booking", 5, 60 * 60);
  if (!allowed) {
    return {
      ok: false as const,
      errorCode: "dates_not_available" as const,
      message: "Hiciste demasiadas solicitudes en poco tiempo. Probalo en una hora.",
    };
  }

  const bookingType = String(form.get("booking_type") ?? "");

  if (bookingType === "tour") {
    return createBookingRequest({
      booking_type: "tour",
      tour_id: String(form.get("tour_id") ?? ""),
      tour_date: String(form.get("tour_date") ?? ""),
      party_size: Number(form.get("party_size") ?? 1),
      guest_name: String(form.get("guest_name") ?? ""),
      guest_email: String(form.get("guest_email") ?? ""),
      guest_phone: String(form.get("guest_phone") ?? ""),
      notes: String(form.get("notes") ?? ""),
    });
  }

  return createBookingRequest({
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