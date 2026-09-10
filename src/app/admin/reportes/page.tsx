import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { getAdminStats, getBookingsTrend } from "@/server/domain/admin/service";
import {
  getRevenueByZone,
  getRevenueByTourCategory,
  getOccupancyRoster,
} from "@/server/domain/admin/reporting";
import { formatUSD, formatDayShort } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";

export const metadata: Metadata = { title: "Reportes · admin" };

function BarList({
  title,
  groups,
}: {
  title: string;
  groups: { key: string; bookings: number; revenue: number; commission: number }[];
}) {
  const max = Math.max(1, ...groups.map((g) => g.revenue));
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
      <ul className="mt-4 space-y-3">
        {groups.length === 0 && <li className="text-sm text-mute">Sin datos todavía.</li>}
        {groups.map((g) => (
          <li key={g.key}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="font-semibold text-ink">{g.key}</span>
              <span className="tabular-nums text-mute">
                {g.bookings} reservas · {formatUSD(g.revenue)} · {formatUSD(g.commission)} comisión
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-coral to-coral-deep"
                style={{ width: `${Math.max(3, (g.revenue / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function AdminReportsPage() {
  const [stats, trend, zones, categories, roster] = await Promise.all([
    getAdminStats(),
    getBookingsTrend(30),
    getRevenueByZone(),
    getRevenueByTourCategory(),
    getOccupancyRoster(),
  ]);
  const maxTrend = Math.max(1, ...trend.map((d) => d.count));

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-deep">Reportes</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Reportes</h1>
        </div>
        <ExportCsvButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ingresos confirmados" value={stats.revenueConfirmed} formatType="usd" tone="text-monte-deep" />
        <StatCard label="Reservas totales" value={stats.total} />
        <StatCard
          label="Ticket promedio"
          value={stats.confirmed ? stats.revenueConfirmed / stats.confirmed : 0}
          formatType="usd"
        />
        <StatCard label="Comisiones pagadas" value={stats.commissionsPaid} formatType="usd" tone="text-mar-deep" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarList title="Ingresos por zona" groups={zones} />
        <BarList title="Ingresos por categoría de tour" groups={categories} />
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight text-ink">Reservas · últimos 30 días</h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mute">
            <BarChart3 className="size-3.5 text-coral" aria-hidden />
            {trend.reduce((a, b) => a + b.count, 0)} reservas
          </span>
        </div>
        <div className="mt-5 flex h-32 items-end gap-1">
          {trend.map((d) => (
            <div key={d.date} className="flex-1">
              <div
                className="w-full rounded-t-md bg-coral transition-colors duration-150 hover:bg-coral-deep"
                style={{ height: `${Math.max(5, (d.count / maxTrend) * 100)}%` }}
                title={`${d.date}: ${d.count}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium text-faint">
          <span>{formatDayShort(trend[0]?.date ?? "")}</span>
          <span>hoy</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-soft">
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 className="text-base font-bold tracking-tight text-ink">Ocupación por casa</h2>
          <p className="text-xs text-mute">Solo reservas confirmadas</p>
        </div>
        <table className="mt-3 w-full min-w-140 text-sm">
          <thead className="border-b border-line bg-muted/50 text-left text-[11px] font-semibold uppercase tracking-wide text-mute">
            <tr>
              <th className="px-5 py-3">Casa</th>
              <th className="px-5 py-3">Zona</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Reservas</th>
              <th className="px-5 py-3 text-right">Noches</th>
              <th className="px-5 py-3 text-right">Prom. días</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {roster.map((r) => (
              <tr key={r.name}>
                <td className="px-5 py-3 font-medium text-ink">{r.name}</td>
                <td className="px-5 py-3 text-mute">{r.zone}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-ink">{r.bookings}</td>
                <td className="px-5 py-3 text-right tabular-nums text-ink">{r.nights}</td>
                <td className="px-5 py-3 text-right tabular-nums text-mute">{r.avgNights.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}