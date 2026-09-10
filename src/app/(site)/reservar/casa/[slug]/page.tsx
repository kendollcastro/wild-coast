import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPropertyBySlug } from "@/server/domain/catalog/service";
import { getPropertyAvailability, rangesToDisabledDates } from "@/server/domain/bookings/service";
import { CasaBookingForm } from "@/components/reservar/CasaBookingForm";
import { sanitizeDate, sanitizeGuests } from "./sanitize";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "reservá tu casa · pide tu estadía",
  robots: { index: false, follow: false },
};

export default async function CasaReservaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const availability = await getPropertyAvailability(property.id);
  const disabledDates = [...rangesToDisabledDates(availability)];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:pb-20 sm:pt-10">
      <Link
        href={`/casas/${property.slug}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-mute transition-colors hover:text-coral"
      >
        <ArrowLeft className="size-4" /> Volver a la casa
      </Link>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-coral-deep">
          Reserva directa · sin pago adelantado
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Pedí tu estadía</h1>
      </div>

      <CasaBookingForm
        property={property}
        disabledDates={disabledDates}
        initial={{
          checkIn: sanitizeDate(sp.check_in),
          checkOut: sanitizeDate(sp.check_out),
          guests: sanitizeGuests(sp.guests, Math.min(property.capacity, 12), 2),
        }}
      />
    </section>
  );
}