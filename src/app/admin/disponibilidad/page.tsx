import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listAvailabilityItems, getAvailabilityFor } from "@/server/domain/admin/availability";
import { monthGrid, monthLabel, addDaysISO } from "@/lib/dates";
import { AddBlockForm, DeleteBlockButton } from "@/components/admin/AvailabilityBlocks";
import { FormSelect } from "@/components/admin/FormSelect";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Disponibilidad · admin" };

const REASON_META: Record<string, { label: string; cell: string; dot: string }> = {
  booking: { label: "Reserva", cell: "bg-rojo/15 text-rojo-deep", dot: "bg-rojo" },
  blocked: { label: "Bloqueado", cell: "bg-mute text-white", dot: "bg-mute" },
  owner: { label: "Dueño", cell: "bg-pina text-ink", dot: "bg-pina" },
};

function blockedDays(blocks: { start_date: string; end_date: string }[]): Set<string> {
  const set = new Set<string>();
  for (const b of blocks) {
    let d = b.start_date;
    while (d < b.end_date) {
      set.add(d);
      d = addDaysISO(d, 1);
    }
  }
  return set;
}

export default async function AdminAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; id?: string; month?: string }>;
}) {
  const params = await searchParams;
  const { properties, tours } = await listAvailabilityItems();
  const itemType: "property" | "tour" = params.type === "tour" ? "tour" : "property";
  const items = itemType === "property" ? properties : tours;
  const itemId = params.id && items.some((i) => i.id === params.id) ? params.id : "";

  const today = new Date();
  const [selYear, selMonth] = params.month
    ? [Number(params.month.slice(0, 4)), Number(params.month.slice(5, 7)) - 1]
    : [today.getFullYear(), today.getMonth()];
  const prev = new Date(selYear, selMonth - 1, 1);
  const next = new Date(selYear, selMonth + 1, 1);
  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const blocks = itemId ? await getAvailabilityFor(itemType, itemId) : [];
  const byReason = new Map<string, Set<string>>();
  for (const reason of ["booking", "blocked", "owner"]) {
    byReason.set(reason, blockedDays(blocks.filter((b) => b.reason === reason)));
  }

  const { blanks, days } = monthGrid(selYear, selMonth);

  const blockUrl = (m: string) =>
    itemId
      ? `/admin/disponibilidad?type=${itemType}&id=${itemId}&month=${m}`
      : `/admin/disponibilidad?type=${itemType}&month=${m}`;

  const item = items.find((i) => i.id === itemId);
  const manualBlocks = blocks.filter((b) => b.reason !== "booking");

  return (
    <section className="space-y-6">
      <div>
        <p className="eyebrow text-coral-deep">Catálogo</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Disponibilidad y calendario</h1>
      </div>

      <div className="inline-flex rounded-xl border border-line bg-white p-1">
        <Link
          href={`/admin/disponibilidad?type=property${itemType === "property" && itemId ? `&id=${itemId}` : ""}`}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            itemType === "property" ? "bg-ink text-white" : "text-mute hover:bg-muted/40"
          }`}
        >
          Casas
        </Link>
        <Link
          href={`/admin/disponibilidad?type=tour${itemType === "tour" && itemId ? `&id=${itemId}` : ""}`}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            itemType === "tour" ? "bg-ink text-white" : "text-mute hover:bg-muted/40"
          }`}
        >
          Tours
        </Link>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="type" value={itemType} />
        <FormSelect
          name="id"
          defaultValue={itemId}
          placeholder={`— Elegí ${itemType === "property" ? "una casa" : "un tour"} —`}
          options={[
            { value: "", label: `— Elegí ${itemType === "property" ? "una casa" : "un tour"} —` },
            ...items.map((i) => ({ value: i.id, label: `${i.name}${i.active ? "" : " (inactivo)"}` })),
          ]}
          triggerClassName="h-11 w-full min-w-0 flex-1 rounded-xl bg-white text-sm sm:max-w-md"
        />
        <Button type="submit" size="lg" className="h-11 rounded-xl px-5">
          Ver calendario
        </Button>
      </form>

      {!itemId ? (
        <p className="rounded-2xl border border-dashed border-line bg-white/60 px-4 py-10 text-center text-sm text-mute">
          Elegí {itemType === "property" ? "una casa" : "un tour"} para ver su calendario.
        </p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={blockUrl(key(prev))}
                  aria-label="Mes anterior"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-line text-ink transition hover:bg-muted/40"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </Link>
                <h2 className="font-display text-lg font-bold capitalize text-ink">
                  {monthLabel(selYear, selMonth, "es")}
                  <span className="ml-2 text-sm font-medium text-mute">{item?.name}</span>
                </h2>
                <Link
                  href={blockUrl(key(next))}
                  aria-label="Mes siguiente"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-line text-ink transition hover:bg-muted/40"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-faint">
                {["lu", "ma", "mi", "ju", "vi", "sá", "do"].map((d) => (
                  <span key={d} className="py-1">
                    {d}
                  </span>
                ))}
                {Array.from({ length: blanks }).map((_, i) => (
                  <span key={`b${i}`} />
                ))}
                {Array.from({ length: days }).map((_, i) => {
                  const iso = `${selYear}-${String(selMonth + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                  const info = Object.entries(byReason)
                    .filter(([, set]) => set.has(iso))
                    .map(([reason]) => reason);
                  const meta = info[0] ? REASON_META[info[0]] : null;
                  return (
                    <span
                      key={iso}
                      title={meta ? `${iso} · ${meta.label}` : iso}
                      className={`flex aspect-square items-center justify-center rounded-lg text-sm tabular-nums ${
                        meta ? `${meta.cell} font-semibold` : "text-mute"
                      }`}
                    >
                      {i + 1}
                    </span>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-mute">
                {Object.entries(REASON_META).map(([reason, meta]) => (
                  <span key={reason} className="inline-flex items-center gap-1.5">
                    <span className={`size-2.5 rounded-full ${meta.dot}`} aria-hidden />
                    {meta.label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <AddBlockForm itemType={itemType} itemId={itemId} />

            <Card>
              <CardHeader>
                <CardTitle>Bloqueos manuales</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <ul className="divide-y divide-line">
                  {manualBlocks.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {b.start_date} → {b.end_date}
                        </p>
                        <p className="text-xs text-mute">{REASON_META[b.reason].label}</p>
                      </div>
                      <DeleteBlockButton blockId={b.id} />
                    </li>
                  ))}
                  {manualBlocks.length === 0 && (
                    <li className="px-5 py-4 text-sm text-mute">No hay bloqueos manuales.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </section>
  );
}