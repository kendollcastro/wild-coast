import type { Metadata } from "next";
import Link from "next/link";
import { BedDouble, ChevronRight, Home, Plus } from "lucide-react";
import { listAdminProperties } from "@/server/domain/admin/catalog";
import { formatUSD } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";

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
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-deep">Catálogo</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Casas</h1>
        </div>
        <Link
          href="/admin/casas/nueva"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-coral-deep"
        >
          <Plus className="size-4" aria-hidden />
          Nueva casa
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Buscar por nombre, slug o zona…"
          className="h-11 w-full min-w-0 flex-1 rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-1 outline-transparent transition focus:border-coral focus:outline-coral sm:max-w-xs"
        />
        <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-line bg-white">
          {[
            { value: "", label: "Todas" },
            { value: "active", label: "Activas" },
            { value: "inactive", label: "Inactivas" },
          ].map((f) => (
            <label key={f.label} className="cursor-pointer">
              <input type="radio" name="status" value={f.value} defaultChecked={(byStatus ?? "") === f.value} className="peer sr-only" />
              <span className="inline-flex h-11 items-center justify-center px-4 text-sm font-semibold text-mute transition peer-checked:bg-ink peer-checked:text-white">
                {f.label}
              </span>
            </label>
          ))}
        </div>
        <button type="submit" className="btn-primary h-11 rounded-xl px-5">
          Filtrar
        </button>
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
              <h2 className="text-lg font-bold leading-tight text-ink">{p.name}</h2>
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
                <Link
                  href={`/admin/casas/${p.id}`}
                  aria-label={`Editar ${p.name}`}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-ink text-white transition group-hover:bg-coral-deep"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
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