import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTourBySlug } from "@/server/domain/catalog/service";
import { getTourAvailability, rangesToDisabledDates } from "@/server/domain/bookings/service";
import { TourBookingForm } from "@/components/reservar/TourBookingForm";
import { sanitizeDate, sanitizeGuests } from "../../casa/[slug]/sanitize";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "reservá tu tour · pide tu cupo",
  robots: { index: false, follow: false },
};

export default async function TourReservaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const availability = await getTourAvailability(tour.id);
  const disabledDates = [...rangesToDisabledDates(availability)];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:pb-20 sm:pt-10">
      <Link
        href={`/es/tours/${tour.slug}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-mute transition-colors hover:text-coral"
      >
        <ArrowLeft className="size-4" /> Volver al tour
      </Link>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-monte-deep">Reserva directa · sin pago adelantado</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Pedí tu cupo</h1>
      </div>

      <TourBookingForm
        tour={tour}
        disabledDates={disabledDates}
        initial={{
          date: sanitizeDate(sp.date),
          guests: sanitizeGuests(sp.guests, Math.min(tour.capacity, 12), 2),
        }}
      />
    </section>
  );
}