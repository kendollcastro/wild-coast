import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminProperty, getOwners } from "@/server/domain/admin/catalog";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { DeletePropertyButton } from "@/components/admin/AdminActions";

export const metadata: Metadata = { title: "Editar casa · admin" };

export default async function AdminPropertyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getAdminProperty(id);
  if (!property) notFound();

  const owners = await getOwners();
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-deep">Catálogo</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Editar casa</h1>
        </div>
        {property.bookingCount === 0 && <DeletePropertyButton propertyId={property.id} />}
      </div>
      <PropertyForm property={property} owners={owners} />
    </section>
  );
}