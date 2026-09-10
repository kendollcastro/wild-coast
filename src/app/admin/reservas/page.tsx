import type { Metadata } from "next";
import type { BookingStatus } from "@/server/db/schema.types";
import { listBookings, type BookingFilters } from "@/server/domain/admin/service";
import { formatUSD, formatDayShort } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BookingStatusForm } from "@/components/admin/AdminActions";

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
    status: (s(sp.status) as BookingStatus) || undefined,
    type: (s(sp.type) as "tour" | "property") || undefined,
  };
  const rows = await listBookings(filters);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-deep">Reservas</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Reservas</h1>
        </div>

        <form method="GET" className="flex flex-wrap items-end gap-3">
          {SELECTS.map((select) => (
            <label key={select.name} className="flex flex-col gap-1.5 text-xs font-semibold text-mute">
              {select.label}
              <select
                name={select.name}
                defaultValue={filters[select.name] ?? ""}
                className="h-10 rounded-xl border border-line bg-white px-3 text-sm text-ink shadow-soft focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral"
              >
                {select.options.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button
            type="submit"
            className="flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-coral-deep"
          >
            Filtrar
          </button>
        </form>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <table className="w-full min-w-200 text-sm">
          <thead className="border-b border-line bg-muted/50 text-left text-[11px] font-semibold uppercase tracking-wide text-mute">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Huésped</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Fechas</th>
              <th className="px-4 py-3">Personas</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Comisión</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Cambiar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line align-top">
            {rows.map((b) => {
              const dates =
                b.booking_type === "property"
                  ? `${b.check_in ?? "?"} → ${b.check_out ?? "?"}`
                  : (b.tour_date ?? "?");
              return (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-ink">{b.booking_code}</td>
                  <td className="px-4 py-3 font-mono text-xs text-mute">
                    {formatDayShort(b.created_at.slice(0, 10))}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{b.guest_name}</p>
                    <p className="font-mono text-[11px] text-mute">{b.guest_email}</p>
                    {b.guest_phone && <p className="font-mono text-[11px] text-mute">{b.guest_phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-mute">{b.item_name}</p>
                    <p className="font-mono text-[11px] text-mute">{b.booking_type}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-mute">{dates}</td>
                  <td className="px-4 py-3 font-mono text-xs text-mute">{b.party_size}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-ink">
                    {formatUSD(b.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-mute">
                    {formatUSD(b.commission_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusForm bookingId={b.id} status={b.status} />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm text-mute">
                  No hay reservas con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}