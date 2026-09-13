import type { Metadata } from "next";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { listAdminCombos } from "@/server/domain/admin/catalog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { RowActions } from "@/components/admin/RowActions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Combos · admin" };

export default async function AdminCombosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const all = await listAdminCombos();
  const query = (params.q ?? "").trim().toLowerCase();
  const byStatus = params.status === "active" || params.status === "inactive" ? params.status : null;

  const rows = all.filter((c) => {
    if (byStatus && c.status !== byStatus) return false;
    if (query && !`${c.name} ${c.slug}`.toLowerCase().includes(query)) return false;
    return true;
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-coral-deep">Catálogo</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Combos</h1>
        </div>
        <Button asChild size="lg" className="rounded-xl px-4">
          <Link href="/admin/combos/nueva">
            <Plus className="size-4" aria-hidden />
            Nuevo combo
          </Link>
        </Button>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Buscar por nombre o slug…"
          className="h-11 w-full min-w-0 flex-1 rounded-xl border border-input bg-white px-3.5 text-sm text-ink focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral sm:max-w-xs"
        />
        <div className="inline-flex rounded-xl border border-line bg-white p-1">
          {[
            { value: "", label: "Todas" },
            { value: "active", label: "Activos" },
            { value: "inactive", label: "Inactivos" },
          ].map((f) => (
            <label key={f.label} className="cursor-pointer">
              <input type="radio" name="status" value={f.value} defaultChecked={(byStatus ?? "") === f.value} className="peer sr-only" />
              <span className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold text-mute transition peer-checked:bg-ink peer-checked:text-white">
                {f.label}
              </span>
            </label>
          ))}
        </div>
        <Button type="submit" size="lg" className="h-11 rounded-xl px-5">
          Filtrar
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => (
          <article
            key={c.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <div className="relative h-44 overflow-hidden bg-muted">
              {c.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.photos[0].url}
                  alt={c.photos[0].alt ?? c.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/60 text-faint">
                  <Package className="size-8" aria-hidden />
                </div>
              )}
              <div className="absolute left-3 top-3">
                <StatusBadge status={c.status} />
              </div>
              {c.badge_text && (
                <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-coral-deep px-2.5 py-1 text-[11px] font-bold text-white shadow-soft-lg">
                  {c.badge_text}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <Link href={`/admin/combos/${c.id}`} className="text-lg font-bold leading-tight text-ink hover:text-coral-deep">
                {c.name}
              </Link>
              <p className="text-sm text-mute">
                {c.property?.name ?? "Sin casa"} · {c.tours.length} tour{c.tours.length !== 1 ? "s" : ""}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-mute">
                <span>{c.discount_pct}% descuento</span>
                <span>·</span>
                <span>{c.tours.length} tour{c.tours.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <p className="text-sm font-bold text-monte">
                  {c.featured ? "Destacado" : ""}
                </p>
                <RowActions
                  siteHref={`/combos/${c.slug}`}
                  siteLabel="Ver en el sitio"
                  editHref={`/admin/combos/${c.id}`}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line bg-white/60 px-4 py-10 text-center text-sm text-mute">
          No hay combos que coincidan. Creá el primero desde &quot;Nuevo combo&quot;.
        </p>
      )}
    </section>
  );
}
