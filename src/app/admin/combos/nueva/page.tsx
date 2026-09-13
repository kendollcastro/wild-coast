import type { Metadata } from "next";
import { listAdminProperties, listAdminTours } from "@/server/domain/admin/catalog";
import { ComboForm } from "@/components/admin/ComboForm";

export const metadata: Metadata = { title: "Nuevo combo · admin" };

export default async function NewComboPage() {
  const [properties, tours] = await Promise.all([
    listAdminProperties(true),
    listAdminTours(),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <p className="eyebrow text-coral-deep">Catálogo</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Nuevo combo</h1>
      </div>
      <ComboForm
        combo={null}
        properties={properties.map((p) => ({ id: p.id, name: p.name, price_per_night: p.price_per_night }))}
        tours={tours.map((t) => ({ id: t.id, name: t.name, price: t.price, provider: t.provider }))}
      />
    </section>
  );
}
