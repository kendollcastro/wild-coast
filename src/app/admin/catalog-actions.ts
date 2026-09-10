"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/server/auth/session";
import {
  deleteAdminProperty,
  deleteAdminTour,
  saveAdminProperty,
  saveAdminTour,
} from "@/server/domain/admin/catalog";
import type { ListingStatus, TourPricingOption } from "@/server/db/schema.types";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "");
const checkbox = (fd: FormData, key: string) => fd.get(key) === "on";

export type SaveResult = { ok: boolean; id?: string; error?: string };

export async function savePropertyAction(formData: FormData): Promise<SaveResult> {
  await requireAdminSession();
  const id = text(formData, "id") || null;
  const status = (text(formData, "status") || "inactive") as ListingStatus;

  const photoKeys = Array.from(formData.keys())
    .filter((k) => k.startsWith("photo_url_"))
    .sort((a, b) => Number(a.replace("photo_url_", "")) - Number(b.replace("photo_url_", "")));
  const photos = photoKeys.map((k) => ({
    url: text(formData, k),
    alt: text(formData, k.replace("photo_url_", "photo_alt_")),
  }));

  const result = await saveAdminProperty(
    {
      id,
      slug: text(formData, "slug"),
      name_es: text(formData, "name_es"),
      name_en: text(formData, "name_en"),
      description_es: text(formData, "description_es"),
      description_en: text(formData, "description_en"),
      location_label_es: text(formData, "location_label_es"),
      location_label_en: text(formData, "location_label_en"),
      lat: text(formData, "lat"),
      lng: text(formData, "lng"),
      capacity: text(formData, "capacity"),
      bedrooms: text(formData, "bedrooms"),
      bathrooms: text(formData, "bathrooms"),
      price_per_night: text(formData, "price_per_night"),
      currency: text(formData, "currency"),
      status,
      featured: checkbox(formData, "featured"),
      brand: text(formData, "brand"),
      owner_id: text(formData, "owner_id"),
      amenities_es: text(formData, "amenities_es"),
      amenities_en: text(formData, "amenities_en"),
      wildlife_seen: text(formData, "wildlife_seen"),
      services: text(formData, "services"),
    },
    photos,
  );

  if (result.ok) {
    revalidatePath("/admin/casas");
    revalidatePath("/", "layout");
  }
  return result;
}

export async function deletePropertyAction(formData: FormData): Promise<SaveResult> {
  await requireAdminSession();
  const result = await deleteAdminProperty(text(formData, "property_id"));
  if (result.ok) {
    revalidatePath("/admin/casas");
    revalidatePath("/", "layout");
  }
  return result;
}

export async function saveTourAction(formData: FormData): Promise<SaveResult> {
  await requireAdminSession();
  const id = text(formData, "id") || null;
  const status = (text(formData, "status") || "inactive") as ListingStatus;

  const pricingOptions: TourPricingOption[] = Array.from(formData.keys())
    .filter((k) => k.startsWith("po_price_"))
    .map((k) => {
      const i = k.replace("po_price_", "");
      return {
        duration: text(formData, `po_duration_${i}`),
        price: Number(text(formData, `po_price_${i}`)) || 0,
        variation_id: text(formData, `po_variation_${i}`) || null,
      };
    })
    .filter((po) => po.duration);

  const photoKeys = Array.from(formData.keys())
    .filter((k) => k.startsWith("photo_url_"))
    .sort((a, b) => Number(a.replace("photo_url_", "")) - Number(b.replace("photo_url_", "")));
  const photos = photoKeys.map((k) => ({
    url: text(formData, k),
    alt: text(formData, k.replace("photo_url_", "photo_alt_")),
  }));

  const result = await saveAdminTour(
    {
      id,
      slug: text(formData, "slug"),
      name_es: text(formData, "name_es"),
      name_en: text(formData, "name_en"),
      description_es: text(formData, "description_es"),
      description_en: text(formData, "description_en"),
      highlights_es: text(formData, "highlights_es"),
      highlights_en: text(formData, "highlights_en"),
      includes_es: text(formData, "includes_es"),
      includes_en: text(formData, "includes_en"),
      duration: text(formData, "duration"),
      duration_hours: text(formData, "duration_hours"),
      price: text(formData, "price"),
      original_price: text(formData, "original_price"),
      currency: text(formData, "currency"),
      capacity: text(formData, "capacity"),
      max_participants: text(formData, "max_participants"),
      provider: text(formData, "provider"),
      commission_percent: text(formData, "commission_percent"),
      category: text(formData, "category"),
      badge_text: text(formData, "badge_text"),
      badge_color: text(formData, "badge_color"),
      featured: checkbox(formData, "featured"),
      status,
      pricing_options: pricingOptions,
    },
    photos,
  );

  if (result.ok) {
    revalidatePath("/admin/tours");
    revalidatePath("/", "layout");
  }
  return result;
}

export async function deleteTourAction(formData: FormData): Promise<SaveResult> {
  await requireAdminSession();
  const result = await deleteAdminTour(text(formData, "tour_id"));
  if (result.ok) {
    revalidatePath("/admin/tours");
    revalidatePath("/", "layout");
  }
  return result;
}