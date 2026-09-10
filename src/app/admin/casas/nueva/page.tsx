import type { Metadata } from "next";
import { getOwners } from "@/server/domain/admin/catalog";
import { PropertyForm } from "@/components/admin/PropertyForm";

export const metadata: Metadata = { title: "Nueva casa · admin" };

export default async function AdminPropertyNewPage() {
  const owners = await getOwners();
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-deep">Catálogo</p>
      <h1 className="text-2xl font-bold tracking-tight text-ink">Nueva casa</h1>
      <PropertyForm property={null} owners={owners} />
    </section>
  );
}