import "server-only";
import { getSupabaseAdmin } from "@/server/db/server";
import type { PropertyWithPhotos, TourWithPhotos } from "@/server/db/schema.types";

type Maybe<T> = T | null;

export async function listActiveProperties(): Promise<PropertyWithPhotos[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("properties")
    .select("*, photos:property_photos(id, url, alt, sort_order), owner:owners(id, name)")
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[catalog] listActiveProperties:", error);
    return [];
  }
  return sortPhotos(data ?? []);
}

export async function getPropertyBySlug(slug: string): Promise<Maybe<PropertyWithPhotos>> {
  const { data, error } = await getSupabaseAdmin()
    .from("properties")
    .select("*, photos:property_photos(id, url, alt, sort_order), owner:owners(id, name)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error && error.code === "PGRST116") return null;
  if (error) {
    console.error("[catalog] getPropertyBySlug:", error);
    throw new Error("No pudimos cargar la propiedad.");
  }
  return data ? { ...(data as PropertyWithPhotos), photos: sortArray(data.photos) } : null;
}

export async function listActiveTours(): Promise<TourWithPhotos[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("tours")
    .select("*, photos:tour_photos(id, url, alt, sort_order)")
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[catalog] listActiveTours:", error);
    return [];
  }
  return data?.map((tour) => ({ ...tour, photos: sortArray(tour.photos) })) ?? [];
}

export async function getTourBySlug(slug: string): Promise<Maybe<TourWithPhotos>> {
  const { data, error } = await getSupabaseAdmin()
    .from("tours")
    .select("*, photos:tour_photos(id, url, alt, sort_order)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error && error.code === "PGRST116") return null;
  if (error) {
    console.error("[catalog] getTourBySlug:", error);
    throw new Error("No pudimos cargar el tour.");
  }
  return data ? { ...(data as TourWithPhotos), photos: sortArray(data.photos) } : null;
}

function sortPhotos<T extends { photos: { sort_order: number }[] }>(items: T[]): T[] {
  return items.map((item) => ({ ...item, photos: sortArray(item.photos) }));
}

function sortArray<T extends { sort_order: number }>(photos: T[] | undefined | null): T[] {
  return [...(photos ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}