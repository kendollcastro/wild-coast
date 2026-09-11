import type { Metadata } from "next";
import Link from "next/link";
import { BedDouble, Home, Plus } from "lucide-react";
import { listAdminProperties } from "@/server/domain/admin/catalog";
import { formatUSD } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { RowActions } from "@/components/admin/RowActions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Casas · admin" };

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const all = await listAdminProperties();
  const query = (params.q ?? "").trim().toLowerCase();
  const byStatus = params.status === "active" || params.status === "inactive" ? params.status : null;

  const rows = all.filter((p) => {
    if (byStatus && p.status !== byStatus) return false;
    if (query && !`${p.name} ${p.slug} ${p.location_label}`.toLowerCase().includes(query)) return false;
    return true;
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-coral-deep">Catálogo</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Casas</h1>
        </div>
        <Button asChild size="lg" className="rounded-xl px-4">
          <Link href="/admin/casas/nueva">
            <Plus className="size-4" aria-hidden />
            Nueva casa
          </Link>
        </Button>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Buscar por nombre, slug o zona…"
          className="h-11 w-full min-w-0 flex-1 rounded-xl border border-input bg-white px-3.5 text-sm text-ink focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral sm:max-w-xs"
        />
        <div className="inline-flex rounded-xl border border-line bg-white p-1">
          {[
            { value: "", label: "Todas" },
            { value: "active", label: "Activas" },
            { value: "inactive", label: "Inactivas" },
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
        {rows.map((p) => (
          <article
            key={p.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <div className="relative h-44 overflow-hidden bg-muted">
              {p.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photos[0].url}
                  alt={p.photos[0].alt ?? p.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/60 text-faint">
                  <Home className="size-8" aria-hidden />
                </div>
              )}
              <div className="absolute left-3 top-3">
                <StatusBadge status={p.status} />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <Link href={`/admin/casas/${p.id}`} className="text-lg font-bold leading-tight text-ink hover:text-coral-deep">
                {p.name}
              </Link>
              <p className="text-sm text-mute">{p.location_label}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-mute">
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="size-3.5" aria-hidden /> {p.bedrooms ?? "—"} hab
                </span>
                <span>·</span>
                <span>{p.capacity} huéspedes</span>
                <span>·</span>
                <span>{p.bookingCount} reservas</span>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <p className="tabular-nums text-xl font-extrabold text-ink">
                  {formatUSD(p.price_per_night)}
                  <span className="text-xs font-medium text-mute">/noche</span>
                </p>
                <RowActions
                  siteHref={`/casas/${p.slug}`}
                  siteLabel="Ver en el sitio"
                  editHref={`/admin/casas/${p.id}`}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line bg-white/60 px-4 py-10 text-center text-sm text-mute">
          No hay casas que coincidan. Creá la primera desde “Nueva casa”.
        </p>
      )}
    </section>
  );
}