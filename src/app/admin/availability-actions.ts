"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/server/auth/session";
import {
  createAvailabilityBlock,
  deleteAvailabilityBlock,
} from "@/server/domain/admin/availability";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "");

export type BlockResult = { ok: boolean; error?: string };

export async function addBlockAction(formData: FormData): Promise<BlockResult> {
  await requireAdminSession();
  const itemType = text(formData, "item_type") === "tour" ? "tour" : "property";
  const result = await createAvailabilityBlock({
    itemType,
    itemId: text(formData, "item_id"),
    start: text(formData, "start"),
    end: text(formData, "end"),
    reason: (text(formData, "reason") === "owner" ? "owner" : "blocked") as Exclude<
      "blocked" | "owner",
      "booking"
    >,
  });
  if (result.ok) {
    revalidatePath("/admin/disponibilidad");
    revalidatePath("/", "layout");
  }
  return result;
}

export async function deleteBlockAction(formData: FormData): Promise<BlockResult> {
  await requireAdminSession();
  const result = await deleteAvailabilityBlock(text(formData, "block_id"));
  if (result.ok) {
    revalidatePath("/admin/disponibilidad");
    revalidatePath("/", "layout");
  }
  return result;
}