import type { Metadata } from "next";
import { TourForm } from "@/components/admin/TourForm";

export const metadata: Metadata = { title: "Nuevo tour · admin" };

export default function AdminTourNewPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-deep">Catálogo</p>
      <h1 className="text-2xl font-bold tracking-tight text-ink">Nuevo tour</h1>
      <TourForm tour={null} />
    </section>
  );
}