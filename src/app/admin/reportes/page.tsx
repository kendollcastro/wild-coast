import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { getAdminStats, getBookingsTrend } from "@/server/domain/admin/service";
import {
  getRevenueByZone,
  getRevenueByTourCategory,
  getOccupancyRoster,
} from "@/server/domain/admin/reporting";
import { formatUSD } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import { TrendChart } from "@/components/admin/TrendChart";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {groups.length === 0 && <li className="text-sm text-mute">Sin datos todavía.</li>}
          {groups.map((g) => (
            <li key={g.key}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className="font-semibold text-ink">{g.key}</span>
                <span className="tabular-nums text-mute">
                  {g.bookings} reservas · {formatUSD(g.revenue)} · {formatUSD(g.commission)} comisión
                </span>
              </div>
              <Progress
                value={(g.revenue / max) * 100}
                className="h-2.5 bg-muted/70"
                indicatorClassName="rounded-full bg-gradient-to-r from-coral to-coral-deep"
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
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

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-coral-deep">Reportes</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Reservas · últimos 30 días</CardTitle>
          <CardAction>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mute">
              <BarChart3 className="size-3.5 text-coral" aria-hidden />
              {trend.reduce((a, b) => a + b.count, 0)} reservas
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4">
          <TrendChart data={trend} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ocupación por casa</CardTitle>
          <CardAction>
            <p className="text-xs text-mute">Solo reservas confirmadas</p>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Casa</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Reservas</TableHead>
                <TableHead className="text-right">Noches</TableHead>
                <TableHead className="text-right">Prom. días</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((r) => (
                <TableRow key={r.name}>
                  <TableCell className="font-medium text-ink">{r.name}</TableCell>
                  <TableCell className="text-mute">{r.zone}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-ink">{r.bookings}</TableCell>
                  <TableCell className="text-right tabular-nums text-ink">{r.nights}</TableCell>
                  <TableCell className="text-right tabular-nums text-mute">{r.avgNights.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}