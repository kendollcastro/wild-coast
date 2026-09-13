import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminCombo, listAdminProperties, listAdminTours } from "@/server/domain/admin/catalog";
import { ComboForm } from "@/components/admin/ComboForm";

export const metadata: Metadata = { title: "Editar combo · admin" };

export default async function EditComboPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [combo, properties, tours] = await Promise.all([
    getAdminCombo(id),
    listAdminProperties(true),
    listAdminTours(),
  ]);

  if (!combo) notFound();

  return (
    <section className="space-y-6">
      <div>
        <p className="eyebrow text-coral-deep">Catálogo</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Editar combo</h1>
      </div>
      <ComboForm
        combo={combo}
        properties={properties.map((p) => ({ id: p.id, name: p.name, price_per_night: p.price_per_night }))}
        tours={tours.map((t) => ({ id: t.id, name: t.name, price: t.price, provider: t.provider }))}
      />
    </section>
  );
}
