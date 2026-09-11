import type { Metadata } from "next";
import { listCommissions } from "@/server/domain/admin/service";
import { formatUSD, formatDayShort } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MarkPaidButton } from "@/components/admin/AdminActions";
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

export const metadata: Metadata = { title: "Comisiones · admin" };

export default async function AdminComisionesPage() {
  const rows = await listCommissions();

  return (
    <section className="space-y-6">
      <div>
        <p className="eyebrow text-coral-deep">Comisiones</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Comisiones</h1>
        <p className="mt-2 max-w-xl text-sm text-mute">
          Comisión calculada automáticamente al crear la reserva, según el % del dueño (casas) o del
          proveedor (tours). Pendiente hasta que la reserva se confirme y se cobre.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de comisiones</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Reserva</TableHead>
                <TableHead>Huésped</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Comisión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pagada</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.booking_id}>
                  <TableCell className="font-mono text-xs font-bold text-ink">{row.booking_code}</TableCell>
                  <TableCell className="font-medium text-ink">{row.guest_name}</TableCell>
                  <TableCell className="text-mute">{row.item_name}</TableCell>
                  <TableCell className="font-mono text-xs text-mute">{row.booking_type}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold text-ink">
                    {formatUSD(row.total_amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold text-coral-deep">
                    {formatUSD(row.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-mute">
                    {row.paid_at ? formatDayShort(row.paid_at.slice(0, 10)) : "—"}
                  </TableCell>
                  <TableCell>
                    <MarkPaidButton commissionId={row.id} status={row.status} />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="px-4 py-8 text-center text-sm text-mute">
                    No hay comisiones cargadas todavía.
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