import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Compass, Plus } from "lucide-react";
import { listAdminTours } from "@/server/domain/admin/catalog";
import { formatUSD } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Tours · admin" };

export default async function AdminToursPage() {
  const tours = await listAdminTours();

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-deep">Catálogo</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Tours</h1>
        </div>
        <Link
          href="/admin/tours/nueva"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-coral-deep"
        >
          <Plus className="size-4" aria-hidden />
          Nuevo tour
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tours.map((t) => (
          <article
            key={t.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <div className="relative h-44 overflow-hidden bg-muted">
              {t.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.photos[0].url}
                  alt={t.photos[0].alt ?? t.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/60 text-faint">
                  <Compass className="size-8" aria-hidden />
                </div>
              )}
              <div className="absolute left-3 top-3 flex gap-2">
                {t.badge_text && (
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ backgroundColor: t.badge_color ?? "#e8e6df", color: "#171f38" }}
                  >
                    {t.badge_text}
                  </span>
                )}
                <StatusBadge status={t.status} />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h2 className="text-lg font-bold leading-tight text-ink">{t.name}</h2>
              <p className="text-sm text-mute">
                {t.category ?? "Tour"} · {t.duration ?? `${t.duration_hours ?? "—"} h`}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-mute">
                <span>{t.bookingCount} reservas</span>
                <span>·</span>
                <span>ingresos {formatUSD(t.revenue)}</span>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <p className="tabular-nums text-xl font-extrabold text-ink">
                  {formatUSD(t.price)}
                  <span className="text-xs font-medium text-mute">/persona</span>
                </p>
                <Link
                  href={`/admin/tours/${t.id}`}
                  aria-label={`Editar ${t.name}`}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-ink text-white transition group-hover:bg-coral-deep"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {tours.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line bg-white/60 px-4 py-10 text-center text-sm text-mute">
          No hay tours todavía. Creá el primero desde “Nuevo tour”.
        </p>
      )}
    </section>
  );
}