import type { Metadata } from "next";
import type { BookingStatus } from "@/server/db/schema.types";
import { listBookings, type BookingFilters } from "@/server/domain/admin/service";
import { formatUSD, formatDayShort } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BookingStatusForm } from "@/components/admin/AdminActions";
import { FormSelect } from "@/components/admin/FormSelect";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { Button } from "@/components/ui/button";
import {
  Card,
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

export const metadata: Metadata = { title: "Reservas · admin" };

const SELECTS: { name: "status" | "type"; label: string; options: [string, string][] }[] = [
  {
    name: "status",
    label: "Estado",
    options: [
      ["", "Todos"],
      ["pending", "Pendiente"],
      ["confirmed", "Confirmada"],
      ["cancelled", "Cancelada"],
    ],
  },
  {
    name: "type",
    label: "Tipo",
    options: [
      ["", "Todos"],
      ["property", "Casa"],
      ["tour", "Tour"],
    ],
  },
];

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const s = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

  const filters: BookingFilters = {
    status: (s(sp.status) === "__all__" ? "" : s(sp.status)) as BookingStatus || undefined,
    type: (s(sp.type) === "__all__" ? "" : s(sp.type)) as "tour" | "property" || undefined,
    from: s(sp.from) || undefined,
    to: s(sp.to) || undefined,
  };
  const rows = await listBookings(filters);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-coral-deep">Reservas</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Reservas</h1>
        </div>

        <form method="GET" className="flex flex-wrap items-end gap-3">
          {SELECTS.map((select) => (
            <label key={select.name} className="flex flex-col gap-1.5 text-xs font-semibold text-mute">
              {select.label}
              <FormSelect
                name={select.name}
                defaultValue={filters[select.name] ?? ""}
                placeholder="Todos"
                options={select.options.map(([value, label]) => ({ value, label }))}
                triggerClassName="h-10 w-full min-w-40 rounded-xl bg-white text-sm"
              />
            </label>
          ))}
          <Button type="submit" size="lg" className="h-10 rounded-xl px-5">
            Filtrar
          </Button>
        <DateRangeFilter from={filters.from} to={filters.to} />
            <input type="hidden" name="from" defaultValue={filters.from ?? ""} />
            <input type="hidden" name="to" defaultValue={filters.to ?? ""} />
          </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de reservas</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Huésped</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Comisión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cambiar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => {
                const dates =
                  b.booking_type === "property"
                    ? `${b.check_in ?? "?"} → ${b.check_out ?? "?"}`
                    : (b.tour_date ?? "?");
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs font-bold text-ink">{b.booking_code}</TableCell>
                    <TableCell className="font-mono text-xs text-mute">
                      {formatDayShort(b.created_at.slice(0, 10))}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-ink">{b.guest_name}</p>
                      <p className="font-mono text-[11px] text-mute">{b.guest_email}</p>
                      {b.guest_phone && <p className="font-mono text-[11px] text-mute">{b.guest_phone}</p>}
                    </TableCell>
                    <TableCell>
                      <p className="text-mute">{b.item_name}</p>
                      <p className="font-mono text-[11px] text-mute">{b.booking_type}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-mute">{dates}</TableCell>
                    <TableCell className="font-mono text-xs text-mute">{b.party_size}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-bold text-ink">
                      {formatUSD(b.total_amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-mute">
                      {formatUSD(b.commission_amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell>
                      <BookingStatusForm bookingId={b.id} status={b.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="px-4 py-8 text-center text-sm text-mute">
                    No hay reservas con esos filtros.
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