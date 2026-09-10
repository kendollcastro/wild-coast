import "server-only";
import { getSupabaseAdmin } from "@/server/db/server";
import type { AvailabilityKind } from "@/server/db/schema.types";

export type AvailabilityItem = { id: string; name: string; active: boolean };

export async function listAvailabilityItems(): Promise<{
  properties: AvailabilityItem[];
  tours: AvailabilityItem[];
}> {
  const supabase = getSupabaseAdmin();
  const [props, tours] = await Promise.all([
    supabase.from("properties").select("id, name, name_es, name_en, status"),
    supabase.from("tours").select("id, name, name_es, name_en, status"),
  ]);
  return {
    properties: (props.data ?? []).map((p) => ({
      id: p.id,
      name: p.name_es ?? p.name_en ?? p.name,
      active: p.status === "active",
    })),
    tours: (tours.data ?? []).map((t) => ({
      id: t.id,
      name: t.name_es ?? t.name_en ?? t.name,
      active: t.status === "active",
    })),
  };
}

export type AdminBlock = {
  id: string;
  start_date: string;
  end_date: string;
  reason: AvailabilityKind;
  booking_code: string | null;
};

export async function getAvailabilityFor(
  itemType: "property" | "tour",
  itemId: string,
): Promise<AdminBlock[]> {
  const supabase = getSupabaseAdmin();
  const col = itemType === "property" ? "property_id" : "tour_id";
  const { data, error } = await supabase
    .from("availability_blocks")
    .select("id, start_date, end_date, reason, booking_id, booking:bookings(booking_code)")
    .eq(col, itemId)
    .order("start_date", { ascending: true });

  if (error) {
    console.error("[admin.availability] getAvailabilityFor:", error);
    return [];
  }
  return (data ?? []).map((b) => ({
    id: b.id,
    start_date: b.start_date,
    end_date: b.end_date,
    reason: b.reason as AvailabilityKind,
    booking_code: (b.booking as { booking_code?: string | null } | null)?.booking_code ?? null,
  }));
}

export async function createAvailabilityBlock(input: {
  itemType: "property" | "tour";
  itemId: string;
  start: string;
  end: string;
  reason: Exclude<AvailabilityKind, "booking">;
}): Promise<{ ok: boolean; error?: string }> {
  const { itemType, itemId, start, end, reason } = input;
  if (!start || !end) return { ok: false, error: "Necesitás fecha de inicio y fin." };
  if (end <= start) return { ok: false, error: "La fecha de fin debe ser posterior al inicio." };

  const column = itemType === "property" ? "property_id" : "tour_id";
  const { error } = await getSupabaseAdmin().from("availability_blocks").insert({
    ...{ [column]: itemId },
    start_date: start,
    end_date: end,
    reason,
  });

  if (error) {
    console.error("[admin.availability] createAvailabilityBlock:", error);
    if (error.code === "20P01") {
      return { ok: false, error: "El rango se solapa con un bloqueo existente." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteAvailabilityBlock(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  // Solo se pueden borrar bloqueos manuales (sin booking asociado).
  const { data, error: check } = await getSupabaseAdmin()
    .from("availability_blocks")
    .select("booking_id")
    .eq("id", id)
    .maybeSingle();
  if (check || !data) return { ok: false, error: "No se encontró el bloqueo." };
  if (data.booking_id) return { ok: false, error: "Ese bloqueo pertenece a una reserva." };

  const { error } = await getSupabaseAdmin().from("availability_blocks").delete().eq("id", id);
  if (error) {
    console.error("[admin.availability] deleteAvailabilityBlock:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}