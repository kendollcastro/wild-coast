import "server-only";
import { Resend } from "resend";
import type { BookingsRow } from "@/server/db/schema.types";
import { getSupabaseAdmin } from "@/server/db/server";

/**
 * Notificaciones de reserva (gmail/HTTP simples, mejor esfuerzo).
 * Sin RESEND_API_KEY en dev: log y no falla el flujo.
 */

const NOTIFICATION_FROM = process.env.RESEND_FROM ?? "Reservas Jacó <onboarding@resend.dev>";

interface BookingContext {
  itemName: string;
  ownerOrProviderEmail: string | null;
  ownerOrProviderName: string;
  details: string;
}

async function resolveContext(booking: BookingsRow): Promise<BookingContext> {
  const supabase = getSupabaseAdmin();

  if (booking.booking_type === "property") {
    const { data: property } = await supabase
      .from("properties")
      .select("id, name, owner:owners(name, email)")
      .eq("id", booking.property_id!)
      .single();
    const owner = property?.owner as { name?: string; email?: string } | undefined;
    return {
      itemName: property?.name ?? "la propiedad",
      ownerOrProviderEmail: owner?.email ?? null,
      ownerOrProviderName: owner?.name ?? "dueño",
      details: `Check-in: ${booking.check_in} · Check-out: ${booking.check_out}`,
    };
  }

  const { data: tour } = await supabase
    .from("tours")
    .select("id, name, provider")
    .eq("id", booking.tour_id!)
    .single();
  return {
    itemName: tour?.name ?? "el tour",
    ownerOrProviderEmail: null, // por ahora se avisa por email institucional
    ownerOrProviderName: tour?.provider ?? "proveedor",
    details: `Fecha del tour: ${booking.tour_date} · Personas: ${booking.party_size}`,
  };
}

export async function sendBookingNotifications(booking: BookingsRow): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const resend = apiKey ? new Resend(apiKey) : null;

  if (!resend) {
    // Dev sin credenciales: registramos y seguimos. La reserva ya está en la DB.
    console.log(`[notify:dev] Booking ${booking.booking_code} creado (${
      booking.booking_type
    }). Email no enviado: falta RESEND_API_KEY.`);
    return;
  }

  try {
    const ctx = await resolveContext(booking);

    await resend.emails.send({
      from: NOTIFICATION_FROM,
      to: booking.guest_email,
      subject: `Solicitud recibida · Reserva ${booking.booking_code} (${ctx.itemName})`,
      text:
        `Hola ${booking.guest_name},\n\n` +
        `Recibimos tu solicitud de reserva para ${ctx.itemName} (código ${booking.booking_code}).\n\n` +
        `${ctx.details}\nMonto total: $${booking.total_amount} USD.\n\n` +
        `Te confirmamos por este medio apenas esté aprobada. ¡Pura vida!`,
    });

    if (ctx.ownerOrProviderEmail) {
      await resend.emails.send({
        from: NOTIFICATION_FROM,
        to: ctx.ownerOrProviderEmail,
        subject: `Nueva solicitud de reserva · ${booking.booking_code}`,
        text:
          `Tienes una solicitud de ${booking.guest_name} (${booking.guest_email}) para ${ctx.itemName}.\n\n` +
          `${ctx.details}\nMonto total: $${booking.total_amount} USD.\n\n` +
          `Confirmá o cancelá esta reserva desde el panel de administración.`,
      });
    }
  } catch (error) {
    // Mejor esfuerzo: nunca romper el flujo de reserva por un email.
    console.error("[notify] error enviando notificaciones:", error);
  }
}

/** Email de confirmación/cancelación al huésped (+ anfitrión) cuando el admin cambia el estado. */
export async function sendBookingStatusNotification(
  booking: BookingsRow,
  status: "confirmed" | "cancelled",
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const resend = apiKey ? new Resend(apiKey) : null;

  if (!resend) {
    console.log(
      `[notify:dev] Booking ${booking.booking_code} marcada como ${status}. Email no enviado: falta RESEND_API_KEY.`,
    );
    return;
  }

  try {
    const ctx = await resolveContext(booking);
    const confirmed = status === "confirmed";
    const subject = confirmed
      ? `Reserva confirmada · ${booking.booking_code} (${ctx.itemName})`
      : `Reserva cancelada · ${booking.booking_code} (${ctx.itemName})`;
    const body = confirmed
      ? `Hola ${booking.guest_name},\n\n` +
        `Tu reserva para ${ctx.itemName} (código ${booking.booking_code}) fue confirmada.\n\n` +
        `${ctx.details}\nMonto total: $${booking.total_amount} USD.\n\n` +
        `¡Te esperamos en Jacó!`
      : `Hola ${booking.guest_name},\n\n` +
        `Tu reserva para ${ctx.itemName} (código ${booking.booking_code}) fue cancelada.\n\n` +
        `${ctx.details}\n\nPodés escribirnos si querés reservar otra fecha. ¡Pura vida!`;

    await resend.emails.send({ from: NOTIFICATION_FROM, to: booking.guest_email, subject, text: body });

    if (ctx.ownerOrProviderEmail) {
      await resend.emails.send({
        from: NOTIFICATION_FROM,
        to: ctx.ownerOrProviderEmail,
        subject: `Reserva ${confirmed ? "confirmada" : "cancelada"} · ${booking.booking_code}`,
        text:
          `La reserva de ${booking.guest_name} (${booking.guest_email}) para ${ctx.itemName} fue ${confirmed ? "confirmada" : "cancelada"}.\n\n` +
          `${ctx.details}\nMonto total: $${booking.total_amount} USD.`,
      });
    }
  } catch (error) {
    console.error("[notify] error enviando cambio de estado:", error);
  }
}