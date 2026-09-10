import "server-only";
import { getSupabaseAdmin } from "@/server/db/server";
import type { BookingStatus, BookingsRow } from "@/server/db/schema.types";
import { sendBookingStatusNotification } from "@/server/domain/bookings/notifications";

// ---------------------------------------------------------------------------
// Admin: consultas densas para el panel. Sin exposición pública (service_role).
// ---------------------------------------------------------------------------

export type BookingFilters = {
  status?: BookingStatus;
  type?: "tour" | "property";
  from?: string;
  query?: string;
};

export interface AdminStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  revenueConfirmed: number;
  commissionsPending: number;
  commissionsPaid: number;
}

const sum = (rows: { amount?: number; total_amount?: number }[] | null, key: "amount" | "total_amount") =>
  (rows ?? []).reduce((acc, r) => acc + Number(r[key] ?? 0), 0);

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = getSupabaseAdmin();

  const countOf = (status?: BookingStatus) => {
    let q = supabase.from("bookings").select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    return q;
  };

  const [total, pending, confirmed, cancelled, confirmedRows, pendingCom, paidCom] =
    await Promise.all([
      countOf(),
      countOf("pending"),
      countOf("confirmed"),
      countOf("cancelled"),
      supabase.from("bookings").select("total_amount, commission_amount").eq("status", "confirmed"),
      supabase.from("commissions").select("amount").eq("status", "pending"),
      supabase.from("commissions").select("amount").eq("status", "paid"),
    ]);

  return {
    total: total.count ?? 0,
    pending: pending.count ?? 0,
    confirmed: confirmed.count ?? 0,
    cancelled: cancelled.count ?? 0,
    revenueConfirmed: sum(confirmedRows.data as { total_amount?: number }[] | null, "total_amount"),
    commissionsPending: sum(pendingCom.data as { amount?: number }[] | null, "amount"),
    commissionsPaid: sum(paidCom.data as { amount?: number }[] | null, "amount"),
  };
}

/** Contadores livianos para los badges del sidebar (sin sumas). */
export async function getAdminBadgeCounts(): Promise<{
  pendingBookings: number;
  pendingCommissions: number;
}> {
  const supabase = getSupabaseAdmin();
  const [bookings, commissions] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("commissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return { pendingBookings: bookings.count ?? 0, pendingCommissions: commissions.count ?? 0 };
}

/** Tendencia de reservas (count por día) de los últimos N días, agrupada en JS. */
export async function getBookingsTrend(days = 14): Promise<{ date: string; count: number }[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select("created_at")
    .gte("created_at", since.toISOString());

  if (error) return [];

  const buckets = new Map<string, number>();
  for (const row of data ?? []) {
    const day = (row.created_at ?? "").slice(0, 10);
    buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }

  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: buckets.get(key) ?? 0 });
  }
  return out;
}

export interface AdminBookingRow extends BookingsRow {
  item_name: string;
}

export async function listBookings(filters: BookingFilters = {}): Promise<AdminBookingRow[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("bookings")
    .select("*, property:properties(name), tour:tours(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.type) query = query.eq("booking_type", filters.type);
  if (filters.from) query = query.gte("created_at", filters.from);

  const { data, error } = await query;
  if (error) {
    console.error("[admin] listBookings:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const property = row.property as { name?: string } | null;
    const tour = row.tour as { name?: string } | null;
    return {
      ...row,
      item_name: property?.name ?? tour?.name ?? "—",
    };
  });
}

export async function setBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<{ ok: boolean; message?: string }> {
  const supabase = getSupabaseAdmin();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, booking_code, status, booking_type, property_id, tour_id, check_in, check_out, tour_date, party_size, guest_name, guest_email, total_amount, commission_amount",
    )
    .eq("id", bookingId)
    .single();

  if (!booking) return { ok: false, message: "Reserva no encontrada" };

  const prev = booking.status as BookingStatus;
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);
  if (error) return { ok: false, message: error.message };

  if (status === "cancelled") {
    // Liberar fechas (el bloqueo queda referenciado por booking_id) y limpiar
    // la comisión pendiente para que no figure como deuda. Las comisiones ya
    // pagadas se conservan como historial.
    await supabase.from("availability_blocks").delete().eq("booking_id", bookingId);
    await supabase.from("commissions").delete().eq("booking_id", bookingId).eq("status", "pending");
  } else if (status === "confirmed" && prev === "pending") {
    // Garantizar la comisión registrada (booking_id es único en commissions;
    // se re-crea si la reserva volvió de un cancel/re-confirm).
    const { data: existing } = await supabase
      .from("commissions")
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle();
    if (!existing) {
      await supabase.from("commissions").insert({
        booking_id: bookingId,
        amount: booking.commission_amount ?? 0,
      });
    }
  }

  // Notificación al huésped (y anfitrión) con la confirmación o cancelación.
  if (status === "confirmed" || status === "cancelled") {
    await sendBookingStatusNotification(booking as BookingsRow, status);
  }

  return { ok: true };
}

export interface CommissionViewRow {
  id: string;
  booking_id: string;
  booking_code: string;
  guest_name: string;
  item_name: string;
  booking_type: "tour" | "property";
  total_amount: number;
  amount: number;
  status: "pending" | "paid";
  paid_at: string | null;
  created_at: string;
}

export async function listCommissions(): Promise<CommissionViewRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("commissions")
    .select(
      "id, amount, status, paid_at, created_at, bookings:bookings(*, property:properties(name), tour:tours(name))",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin] listCommissions:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const booking = Array.isArray(row.bookings) ? row.bookings[0] : row.bookings;
    const property = booking?.property as { name?: string } | null;
    const tour = booking?.tour as { name?: string } | null;
    return {
      id: row.id,
      booking_id: booking?.id ?? "",
      booking_code: booking?.booking_code ?? "—",
      guest_name: booking?.guest_name ?? "—",
      item_name: property?.name ?? tour?.name ?? "—",
      booking_type: booking?.booking_type ?? "tour",
      total_amount: booking?.total_amount ?? 0,
      amount: row.amount,
      status: row.status,
      paid_at: row.paid_at,
      created_at: row.created_at,
    };
  });
}

export async function markCommissionPaid(
  commissionId: string,
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await getSupabaseAdmin()
    .from("commissions")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", commissionId);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}