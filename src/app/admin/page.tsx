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
import { TrendChart } from "@/components/admin/TrendChart";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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

export const metadata: Metadata = { title: "Resumen · admin" };

export default async function AdminDashboardPage() {
  const [stats, trend, recent] = await Promise.all([
    getAdminStats(),
    getBookingsTrend(14),
    listBookings({}).then((rows) => rows.slice(0, 8)),
  ]);

  const total = Math.max(1, stats.total);
  const pendingPct = Math.round((stats.pending / total) * 100);
  const confirmedPct = Math.round((stats.confirmed / total) * 100);
  const cancelledPct = Math.round((stats.cancelled / total) * 100);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-coral-deep">Resumen</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Panel de administración</h1>
        </div>
      </div>

      {/* Ingresos — lo primero que se mira */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="grid gap-2">
            <div aria-hidden className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-coral" />
              <p className="text-xs font-semibold uppercase tracking-widest text-mute">
                Ingresos confirmados
              </p>
            </div>
            <p className="font-display text-3xl font-extrabold tabular-nums tracking-tight text-ink sm:text-4xl">
              {formatUSD(stats.revenueConfirmed)}
            </p>
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-monte-deep">
              <CheckCircle2 className="size-4" aria-hidden />
              {stats.confirmed} reservas confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-2">
            <div aria-hidden className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-pina" />
              <p className="text-xs font-semibold uppercase tracking-widest text-mute">
                Comisiones por cobrar
              </p>
            </div>
            <p className="font-display text-3xl font-extrabold tabular-nums tracking-tight text-ink sm:text-4xl">
              {formatUSD(stats.commissionsPending)}
            </p>
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-pina-deep">
              <Wallet className="size-4" aria-hidden />
              cobradas: {formatUSD(stats.commissionsPaid)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Embudo operativo */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de reservas</CardTitle>
          <CardAction>
            <p className="text-sm tabular-nums text-mute">{stats.total} en total</p>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3" role="img" aria-label="Proporción por estado">
            {[
              { label: "Pendientes", count: stats.pending, bar: "bg-pina", text: "text-pina-deep", pct: pendingPct },
              { label: "Confirmadas", count: stats.confirmed, bar: "bg-monte", text: "text-monte-deep", pct: confirmedPct },
              { label: "Canceladas", count: stats.cancelled, bar: "bg-rojo", text: "text-rojo-deep", pct: cancelledPct },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-muted/40 px-4 py-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-xs font-semibold text-mute">
                    <span aria-hidden className={`size-2 rounded-full ${f.bar}`} />
                    {f.label}
                  </p>
                  <span className="text-xs tabular-nums text-faint">{f.pct}%</span>
                </div>
                <Progress value={f.pct} className="h-2 bg-muted/70 [&>div]:rounded-full" indicatorClassName={f.bar} />
                <p className={`mt-2 text-2xl font-extrabold tabular-nums ${f.text}`}>{f.count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Acciones pendientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mañana pendiente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
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
          </CardContent>
        </Card>

        {/* Tendencia últimos 14 días */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Reservas · últimos 14 días</CardTitle>
            <CardAction>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-monte-deep">
                <TrendingUp className="size-3.5" aria-hidden />
                {trend.reduce((a, b) => a + b.count, 0)} reservas
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-4">
            <TrendChart data={trend} />
          </CardContent>
        </Card>
      </div>

      {/* Últimas reservas */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas reservas</CardTitle>
          <CardAction>
            <Button asChild variant="ghost" size="sm" className="text-coral-deep hover:text-ink">
              <Link href="/admin/reservas">
                Ver todas
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Huésped</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Comisión</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs font-bold text-ink">{b.booking_code}</TableCell>
                  <TableCell className="font-mono text-xs text-mute">
                    {formatDayShort(b.created_at.slice(0, 10))}
                  </TableCell>
                  <TableCell className="font-medium text-ink">{b.guest_name}</TableCell>
                  <TableCell className="text-mute">{b.item_name}</TableCell>
                  <TableCell className="font-mono text-xs text-mute">{b.booking_type}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold text-ink">
                    {formatUSD(b.total_amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-mute">
                    {formatUSD(b.commission_amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                </TableRow>
              ))}
              {recent.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="px-4 py-8 text-center text-sm text-mute">
                    Todavía no hay reservas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}