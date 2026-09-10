"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession, createServerSupabaseClient } from "@/server/auth/session";
import { setBookingStatus, markCommissionPaid } from "@/server/domain/admin/service";
import type { BookingStatus } from "@/server/db/schema.types";

const PATHS = ["/admin", "/admin/reservas", "/admin/comisiones"] as const;

function refresh() {
  for (const path of PATHS) revalidatePath(path);
}

/** Cambio manual de estado (pendiente → confirmada → cancelada) mientras no hay pago. */
export async function updateBookingStatusAction(form: FormData) {
  await requireAdminSession();
  const id = String(form.get("booking_id") ?? "").trim();
  const status = String(form.get("status") ?? "").trim() as BookingStatus;
  const allowed: BookingStatus[] = ["pending", "confirmed", "cancelled"];
  if (!id || !allowed.includes(status)) return;

  await setBookingStatus(id, status);
  refresh();
}

export async function markCommissionPaidAction(form: FormData) {
  await requireAdminSession();
  const id = String(form.get("commission_id") ?? "").trim();
  if (!id) return;
  await markCommissionPaid(id);
  refresh();
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}