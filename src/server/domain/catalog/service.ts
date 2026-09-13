import "server-only";
import { getSupabaseAdmin } from "@/server/db/server";
import type { PropertyWithPhotos, TourWithPhotos, ComboWithPhotos, PhotoView } from "@/server/db/schema.types";

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

// ---------------------------------------------------------------------------
// Combos
// ---------------------------------------------------------------------------

export async function listActiveCombos(): Promise<ComboWithPhotos[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("combos")
    .select("*")
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[catalog] listActiveCombos:", error);
    return [];
  }

  const comboIds = (data ?? []).map((c) => c.id);
  if (comboIds.length === 0) return [];

  const [photosResult, comboToursResult] = await Promise.all([
    supabase.from("combo_photos").select("*").in("combo_id", comboIds).order("sort_order"),
    supabase.from("combo_tours").select("combo_id, tour_id, sort_order").in("combo_id", comboIds).order("sort_order"),
  ]);

  const photosByCombo = new Map<string, PhotoView[]>();
  for (const p of photosResult.data ?? []) {
    const list = photosByCombo.get(p.combo_id) ?? [];
    list.push({ id: p.id, url: p.url, alt: p.alt, sort_order: p.sort_order });
    photosByCombo.set(p.combo_id, list);
  }

  const tourIdsByCombo = new Map<string, string[]>();
  for (const ct of comboToursResult.data ?? []) {
    const list = tourIdsByCombo.get(ct.combo_id) ?? [];
    list.push(ct.tour_id);
    tourIdsByCombo.set(ct.combo_id, list);
  }

  // Fetch all referenced tours and properties
  const allTourIds = [...new Set((comboToursResult.data ?? []).map((ct) => ct.tour_id))];
  const allPropertyIds = [...new Set((data ?? []).map((c) => c.property_id))];

  const [toursResult, propertiesResult] = await Promise.all([
    allTourIds.length > 0
      ? supabase.from("tours").select("*, photos:tour_photos(id, url, alt, sort_order)").in("id", allTourIds)
      : { data: [], error: null },
    allPropertyIds.length > 0
      ? supabase.from("properties").select("*, photos:property_photos(id, url, alt, sort_order), owner:owners(id, name)").in("id", allPropertyIds)
      : { data: [], error: null },
  ]);

  const toursMap = new Map(
    (toursResult.data ?? []).map((t) => [
      t.id,
      { ...t, photos: sortArray(t.photos) } as TourWithPhotos,
    ]),
  );
  const propertiesMap = new Map(
    (propertiesResult.data ?? []).map((p) => [
      p.id,
      { ...p, photos: sortArray(p.photos) } as PropertyWithPhotos,
    ]),
  );

  return (data ?? []).map((combo) => ({
    ...combo,
    photos: photosByCombo.get(combo.id) ?? [],
    tours: (tourIdsByCombo.get(combo.id) ?? [])
      .map((tid) => toursMap.get(tid))
      .filter(Boolean) as TourWithPhotos[],
    property: propertiesMap.get(combo.property_id) ?? null,
  }));
}

export async function getComboBySlug(slug: string): Promise<Maybe<ComboWithPhotos>> {
  const supabase = getSupabaseAdmin();
  const { data: combo, error } = await supabase
    .from("combos")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error && error.code === "PGRST116") return null;
  if (error || !combo) return null;

  const [photosResult, comboToursResult] = await Promise.all([
    supabase.from("combo_photos").select("*").eq("combo_id", combo.id).order("sort_order"),
    supabase.from("combo_tours").select("tour_id, sort_order").eq("combo_id", combo.id).order("sort_order"),
  ]);

  const tourIds = (comboToursResult.data ?? []).map((ct) => ct.tour_id);

  const [toursResult, propertyResult] = await Promise.all([
    tourIds.length > 0
      ? supabase.from("tours").select("*, photos:tour_photos(id, url, alt, sort_order)").in("id", tourIds)
      : { data: [], error: null },
    supabase.from("properties").select("*, photos:property_photos(id, url, alt, sort_order), owner:owners(id, name)").eq("id", combo.property_id).maybeSingle(),
  ]);

  const toursMap = new Map(
    (toursResult.data ?? []).map((t) => [
      t.id,
      { ...t, photos: sortArray(t.photos) } as TourWithPhotos,
    ]),
  );

  return {
    ...combo,
    photos: sortArray(photosResult.data),
    tours: tourIds.map((tid) => toursMap.get(tid)).filter(Boolean) as TourWithPhotos[],
    property: propertyResult.data ? { ...propertyResult.data, photos: sortArray(propertyResult.data.photos) } : null,
  };
}

/** Calcula precio del combo basado en 1 noche de casa + tours. */
export { calculateComboPrice } from "@/lib/combo";