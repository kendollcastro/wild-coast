import "server-only";
import { getSupabaseAdmin } from "@/server/db/server";

export type ReportGroup = {
  key: string;
  bookings: number;
  revenue: number;
  commission: number;
};

const groupRows = (
  rows: { status: string; total_amount: number | null; commission_amount: number | null; label: string }[],
): ReportGroup[] => {
  const map = new Map<string, ReportGroup>();
  for (const r of rows) {
    const key = r.label || "Sin clasificar";
    const g = map.get(key) ?? { key, bookings: 0, revenue: 0, commission: 0 };
    g.bookings += 1;
    if (r.status === "confirmed") {
      g.revenue += Number(r.total_amount ?? 0);
      g.commission += Number(r.commission_amount ?? 0);
    }
    map.set(key, g);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
};

export async function getRevenueByZone(): Promise<ReportGroup[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select(
      "status, total_amount, commission_amount, property:properties(location_label)",
    )
    .not("property_id", "is", null);
  if (error) {
    console.error("[admin.reporting] getRevenueByZone:", error);
    return [];
  }
  return groupRows(
    (data ?? []).map((r) => ({
      status: r.status,
      total_amount: r.total_amount,
      commission_amount: r.commission_amount,
      label: (r.property as { location_label?: string } | null)?.location_label ?? "",
    })),
  );
}

export async function getRevenueByTourCategory(): Promise<ReportGroup[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select("status, total_amount, commission_amount, tour:tours(category)")
    .not("tour_id", "is", null);
  if (error) {
    console.error("[admin.reporting] getRevenueByTourCategory:", error);
    return [];
  }
  return groupRows(
    (data ?? []).map((r) => ({
      status: r.status,
      total_amount: r.total_amount,
      commission_amount: r.commission_amount,
      label: (r.tour as { category?: string | null } | null)?.category ?? "Sin categoría",
    })),
  );
}

export type RosterRow = {
  name: string;
  zone: string;
  status: "active" | "inactive";
  bookings: number;
  nights: number;
  avgNights: number;
};

export async function getOccupancyRoster(): Promise<RosterRow[]> {
  const supabase = getSupabaseAdmin();
  const [props, bookings] = await Promise.all([
    supabase.from("properties").select("id, name, name_es, name_en, location_label, status"),
    supabase
      .from("bookings")
      .select("property_id, check_in, check_out, status")
      .not("property_id", "is", null),
  ]);

  const nightsBy = new Map<string, number>();
  const countBy = new Map<string, number>();
  for (const b of bookings.data ?? []) {
    if (!b.property_id) continue;
    countBy.set(b.property_id, (countBy.get(b.property_id) ?? 0) + 1);
    if (b.status === "confirmed" && b.check_in && b.check_out) {
      const nights = (Date.parse(b.check_out) - Date.parse(b.check_in)) / 86_400_000;
      nightsBy.set(b.property_id, (nightsBy.get(b.property_id) ?? 0) + Math.max(0, nights));
    }
  }

  return (props.data ?? [])
    .map((p) => {
      const bookingsCount = countBy.get(p.id) ?? 0;
      const nights = Math.round(nightsBy.get(p.id) ?? 0);
      return {
        name: p.name_es ?? p.name_en ?? p.name,
        zone: p.location_label,
        status: p.status,
        bookings: bookingsCount,
        nights,
        avgNights: bookingsCount ? nights / bookingsCount : 0,
      };
    })
    .sort((a, b) => b.nights - a.nights);
}

export async function getCsvExport(): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select(
      "booking_code, booking_type, status, guest_name, guest_email, party_size, check_in, check_out, tour_date, total_amount, commission_amount, currency, created_at, property:properties(name_es, name_en, location_label), tour:tours(name_es, name_en, category)",
    )
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin.reporting] getCsvExport:", error);
    return "";
  }

  const esc = (v: string | number | boolean | null) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = [
    "codigo",
    "tipo",
    "estado",
    "huesped",
    "email",
    "personas",
    "desde",
    "hasta",
    "fecha_tour",
    "total",
    "comision",
    "moneda",
    "item",
    "zona/categoria",
    "creada",
  ].join(",");

  const lines = (data ?? []).map((b) =>
    [
      b.booking_code,
      b.booking_type,
      b.status,
      b.guest_name,
      b.guest_email,
      b.party_size,
      b.check_in,
      b.check_out,
      b.tour_date,
      b.total_amount,
      b.commission_amount,
      b.currency,
      (b.property as { name_es?: string; name_en?: string } | null)?.name_es ??
        (b.tour as { name_es?: string; name_en?: string } | null)?.name_es ??
        "",
      (b.property as { location_label?: string } | null)?.location_label ??
        (b.tour as { category?: string | null } | null)?.category ??
        "",
      b.created_at,
    ]
      .map(esc)
      .join(","),
  );

  return [header, ...lines].join("\n");
}