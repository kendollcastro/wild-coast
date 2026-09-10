import { z } from "zod";
import { addDaysISO, compareDates, localDateISO } from "@/lib/dates";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Elimina caracteres que puedan romper HTML/correos. */
function sanitize(value: string): string {
  return value.replace(/[<>]/g, "");
}

export const guestSchema = z.object({
  guest_name: z
    .string({ message: "Nombre requerido" })
    .trim()
    .transform(sanitize)
    .pipe(z.string().min(2, "Ingresá tu nombre completo")),
  guest_email: z.string({ message: "Email requerido" }).trim().email("Email inválido"),
  guest_phone: z
    .string()
    .trim()
    .transform(sanitize)
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .transform(sanitize)
    .pipe(z.string().max(500, "El mensaje es muy largo"))
    .optional()
    .or(z.literal("")),
});

export const propertyBookingSchema = guestSchema
  .extend({
    booking_type: z.literal("property"),
    property_id: z.string().uuid("Propiedad inválida"),
    check_in: z.string().regex(ISO_DATE, "Elegí la fecha de llegada"),
    check_out: z.string().regex(ISO_DATE, "Elegí la fecha de salida"),
    party_size: z.coerce.number().int().min(1).max(20),
  })
  .refine((d) => compareDates(d.check_in, localDateISO()) >= 0, {
    message: "La llegada no puede ser en el pasado",
    path: ["check_in"],
  })
  .refine((d) => compareDates(d.check_out, d.check_in) > 0, {
    message: "La salida debe ser después de la llegada",
    path: ["check_out"],
  });

export const tourBookingSchema = guestSchema
  .extend({
    booking_type: z.literal("tour"),
    tour_id: z.string().uuid("Tour inválido"),
    tour_date: z.string().regex(ISO_DATE, "Elegí la fecha del tour"),
    party_size: z.coerce.number().int().min(1).max(50),
  })
  .refine((d) => compareDates(d.tour_date, addDaysISO(localDateISO(), 1)) >= 0, {
    message: "La fecha del tour debe ser a partir de mañana",
    path: ["tour_date"],
  });

export type PropertyBookingInput = z.infer<typeof propertyBookingSchema>;
export type TourBookingInput = z.infer<typeof tourBookingSchema>;
export type BookingInput = PropertyBookingInput | TourBookingInput;

/** Errores de dominio que el front puede traducir a mensajes. */
export type BookingErrorCode =
  | "dates_not_available"
  | "tour_not_available_on_date"
  | "property_not_available"
  | "tour_not_available"
  | "guest_count_exceeds_capacity"
  | "check_out_must_be_after_check_in"
  | "tour_date_must_be_future"
  | "check_in_must_be_future"
  | "invalid_booking_type"
  | "unknown";

export function mapBookingError(message: string | undefined): BookingErrorCode {
  const known: BookingErrorCode[] = [
    "dates_not_available",
    "tour_not_available_on_date",
    "property_not_available",
    "tour_not_available",
    "guest_count_exceeds_capacity",
    "check_out_must_be_after_check_in",
    "tour_date_must_be_future",
    "check_in_must_be_future",
    "invalid_booking_type",
  ];
  if (!message) return "unknown";
  const hit = known.find((code) => message.includes(code));
  return hit ?? "unknown";
}