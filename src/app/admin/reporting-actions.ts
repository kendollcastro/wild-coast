"use server";

import { requireAdminSession } from "@/server/auth/session";
import { getCsvExport } from "@/server/domain/admin/reporting";

export async function exportBookingsCsvAction(): Promise<string> {
  await requireAdminSession();
  return getCsvExport();
}