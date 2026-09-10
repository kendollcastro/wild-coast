import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminTour } from "@/server/domain/admin/catalog";
import { TourForm } from "@/components/admin/TourForm";
import { DeleteTourButton } from "@/components/admin/AdminActions";

export const metadata: Metadata = { title: "Editar tour · admin" };

export default async function AdminTourEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getAdminTour(id);
  if (!tour) notFound();

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-deep">Catálogo</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Editar tour</h1>
          <p className="mt-1 text-sm text-mute">
            <Link href={`/tours/${tour.slug}`} className="text-coral-deep hover:underline" target="_blank">
              Ver en el sitio
            </Link>
            {" · "}
            {tour.bookingCount} reservas · {tour.revenue.toLocaleString()} USD
          </p>
        </div>
        {tour.bookingCount === 0 && <DeleteTourButton tourId={tour.id} />}
      </div>
      <TourForm tour={tour} />
    </section>
  );
}