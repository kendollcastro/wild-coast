import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, TrendingUp, Wallet } from "lucide-react";
import {
  getAdminStats,
  getBookingsTrend,
  listBookings,
} from "@/server/domain/admin/service";
import { formatUSD, formatDayShort } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Resumen · admin" };

export default async function AdminDashboardPage() {
  const [stats, trend, recent] = await Promise.all([
    getAdminStats(),
    getBookingsTrend(14),
    listBookings({}).then((rows) => rows.slice(0, 8)),
  ]);

  const maxTrend = Math.max(1, ...trend.map((d) => d.count));
  const total = Math.max(1, stats.total);
  const pendingPct = Math.round((stats.pending / total) * 100);
  const confirmedPct = Math.round((stats.confirmed / total) * 100);
  const cancelledPct = Math.round((stats.cancelled / total) * 100);

  const funnel = [
    { label: "Pendientes", count: stats.pending, bar: "bg-pina", text: "text-pina-deep", pct: pendingPct },
    { label: "Confirmadas", count: stats.confirmed, bar: "bg-monte", text: "text-monte-deep", pct: confirmedPct },
    { label: "Canceladas", count: stats.cancelled, bar: "bg-rojo", text: "text-rojo-deep", pct: cancelledPct },
  ];

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-deep">Resumen</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Panel de administración</h1>
      </div>

      {/* Ingresos — lo primero que se mira */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink to-mar-deep p-6 text-white shadow-soft-lg">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-coral/25 blur-3xl"
          />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
            Ingresos confirmados
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold tabular-nums tracking-tight sm:text-4xl">
            {formatUSD(stats.revenueConfirmed)}
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
            <CheckCircle2 className="size-3.5 text-coral" aria-hidden />
            {stats.confirmed} reservas confirmadas
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft-lg ring-1 ring-line">
          <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-pina" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-mute">
            Comisiones por cobrar
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold tabular-nums tracking-tight text-ink sm:text-4xl">
            {formatUSD(stats.commissionsPending)}
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-pina-deep">
            <Wallet className="size-3.5" aria-hidden />
            cobradas: {formatUSD(stats.commissionsPaid)}
          </p>
        </div>
      </div>

      {/* Embudo operativo */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight text-ink">Estado de reservas</h2>
          <p className="text-sm tabular-nums text-mute">{stats.total} en total</p>
        </div>

        <div
          className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted/70"
          role="img"
          aria-label="Proporción por estado"
        >
          {funnel.map((f) =>
            f.pct > 0 ? (
              <span
                key={f.label}
                className={`h-full ${f.bar}`}
                style={{ width: `${f.pct}%` }}
                title={`${f.label}: ${f.pct}%`}
              />
            ) : null,
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {funnel.map((f) => (
            <div key={f.label} className="rounded-xl bg-muted/40 px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-mute">
                <span aria-hidden className={`size-2 rounded-full ${f.bar}`} />
                {f.label}
              </p>
              <p className={`mt-1 text-2xl font-extrabold tabular-nums ${f.text}`}>{f.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Acciones pendientes */}
        <div className="space-y-3 rounded-2xl border border-line bg-white p-5 shadow-soft lg:col-span-2">
          <h2 className="text-base font-bold tracking-tight text-ink">Mañana pendiente</h2>
          <Link
            href="/admin/reservas?status=pending"
            className="flex items-center justify-between gap-3 rounded-xl bg-pina-soft px-4 py-3 transition-colors duration-150 hover:bg-pina/15"
          >
            <span className="flex items-center gap-3">
              <CalendarDays className="size-5 shrink-0 text-pina-deep" strokeWidth={1.75} aria-hidden />
              <span className="text-sm font-semibold text-ink">
                Reservas por confirmar
                <span className="ml-2 rounded-full bg-pina px-2 py-0.5 text-[11px] font-bold text-ink">
                  {stats.pending}
                </span>
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-pina-deep" aria-hidden />
          </Link>
          <div className="space-y-3">
            {[stats.commissionsPending, stats.confirmed].map((v, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3"
              >
                <span className="text-sm font-medium text-mute">
                  {i === 0 ? "Comisiones por cobrar" : "Reservas confirmadas"}
                </span>
                <span className="text-base font-extrabold tabular-nums text-ink">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tendencia últimos 14 días */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-soft lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold tracking-tight text-ink">Reservas · últimos 14 días</h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-monte-deep">
              <TrendingUp className="size-3.5" aria-hidden />
              {trend.reduce((a, b) => a + b.count, 0)} reservas
            </span>
          </div>
          <div className="mt-5 flex h-32 items-end gap-1.5">
            {trend.map((d) => (
              <div key={d.date} className="group relative flex-1">
                <div
                  className="w-full rounded-t-md bg-espuma transition-colors duration-150 group-hover:bg-coral/70"
                  style={{ height: `${Math.max(6, (d.count / maxTrend) * 100)}%` }}
                  title={`${d.date}: ${d.count}`}
                />
                <span className="pointer-events-none absolute -top-1 left-1/2 z-10 hidden -translate-x-1/2 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white group-hover:block">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-medium text-faint">
            <span>{formatDayShort(trend[0]?.date ?? "")}</span>
            <span>hoy</span>
          </div>
        </div>
      </div>

      {/* Últimas reservas */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight text-ink">Últimas reservas</h2>
          <Link
            href="/admin/reservas"
            className="inline-flex items-center gap-1 text-sm font-semibold text-coral-deep transition-colors hover:text-ink"
          >
            Ver todas
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-soft">
          <table className="w-full min-w-160 text-sm">
            <thead className="border-b border-line bg-muted/50 text-left text-[11px] font-semibold uppercase tracking-wide text-mute">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Huésped</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Comisión</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recent.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-ink">{b.booking_code}</td>
                  <td className="px-4 py-3 font-mono text-xs text-mute">
                    {formatDayShort(b.created_at.slice(0, 10))}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{b.guest_name}</td>
                  <td className="px-4 py-3 text-mute">{b.item_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-mute">{b.booking_type}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-ink">
                    {formatUSD(b.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-mute">
                    {formatUSD(b.commission_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-mute">
                    Todavía no hay reservas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}