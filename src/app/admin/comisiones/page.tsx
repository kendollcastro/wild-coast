import type { Metadata } from "next";
import { listCommissions } from "@/server/domain/admin/service";
import { formatUSD, formatDayShort } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MarkPaidButton } from "@/components/admin/AdminActions";

export const metadata: Metadata = { title: "Comisiones · admin" };

export default async function AdminComisionesPage() {
  const rows = await listCommissions();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-deep">Comisiones</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Comisiones</h1>
        <p className="mt-2 max-w-xl text-sm text-mute">
          Comisión calculada automáticamente al crear la reserva, según el % del dueño (casas) o del
          proveedor (tours). Pendiente hasta que la reserva se confirme y se cobre.
        </p>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <table className="w-full min-w-160 text-sm">
          <thead className="border-b border-line bg-muted/50 text-left text-[11px] font-semibold uppercase tracking-wide text-mute">
            <tr>
              <th className="px-4 py-3">Reserva</th>
              <th className="px-4 py-3">Huésped</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Comisión</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Pagada</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line align-top">
            {rows.map((row) => (
              <tr key={row.booking_id}>
                <td className="px-4 py-3 font-mono text-xs font-bold text-ink">{row.booking_code}</td>
                <td className="px-4 py-3 font-medium text-ink">{row.guest_name}</td>
                <td className="px-4 py-3 text-mute">{row.item_name}</td>
                <td className="px-4 py-3 font-mono text-xs text-mute">{row.booking_type}</td>
                <td className="px-4 py-3 text-right font-mono text-sm font-bold text-ink">
                  {formatUSD(row.total_amount)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm font-bold text-coral-deep">
                  {formatUSD(row.amount)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-mute">
                  {row.paid_at ? formatDayShort(row.paid_at.slice(0, 10)) : "—"}
                </td>
                <td className="px-4 py-3">
                  <MarkPaidButton commissionId={row.id} status={row.status} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-mute">
                  No hay comisiones cargadas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}