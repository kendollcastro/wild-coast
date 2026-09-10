import "server-only";
import { getSupabaseAdmin } from "@/server/db/server";
import type {
  ListingStatus,
  PropertiesRow,
  PhotoView,
  ToursRow,
  TourPricingOption,
} from "@/server/db/schema.types";

export type AdminProperty = PropertiesRow & {
  photos: PhotoView[];
  owner?: { id: string; name: string } | null;
  bookingCount: number;
  nightsBooked: number;
};

export type AdminPropertyInput = {
  id?: string | null;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  location_label_es: string;
  location_label_en: string;
  lat: string;
  lng: string;
  capacity: string;
  bedrooms: string;
  bathrooms: string;
  price_per_night: string;
  currency: string;
  status: ListingStatus;
  featured: boolean;
  brand: string;
  owner_id: string;
  amenities_es: string; // líneas separadas por \n
  amenities_en: string;
  wildlife_seen: string;
  services: string;
};

export type AdminPhotoInput = { url: string; alt: string };

export async function listAdminProperties(onlyVisible = false): Promise<AdminProperty[]> {
  const supabase = getSupabaseAdmin();

  let q = supabase
    .from("properties")
    .select("*, photos:property_photos(id, url, alt, sort_order), owner:owners(id, name)");
  if (onlyVisible) q = q.eq("status", "active");

  const { data, error } = await q.order("created_at", { ascending: true });
  if (error) {
    console.error("[admin.catalog] listAdminProperties:", error);
    return [];
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("property_id, check_in, check_out")
    .not("property_id", "is", null);
  const countBy = new Map<string, number>();
  const nightsBy = new Map<string, number>();
  for (const b of bookings ?? []) {
    if (!b.property_id) continue;
    countBy.set(b.property_id, (countBy.get(b.property_id) ?? 0) + 1);
    if (b.check_in && b.check_out) {
      const nights = Math.max(
        0,
        (Date.parse(b.check_out) - Date.parse(b.check_in)) / 86_400_000,
      );
      nightsBy.set(b.property_id, (nightsBy.get(b.property_id) ?? 0) + nights);
    }
  }

  return (data ?? []).map((row) => ({
    ...row,
    photos: [...(row.photos ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    bookingCount: countBy.get(row.id) ?? 0,
    nightsBooked: Math.round(nightsBy.get(row.id) ?? 0),
  }));
}

export async function getAdminProperty(id: string): Promise<AdminProperty | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("properties")
    .select("*, photos:property_photos(id, url, alt, sort_order), owner:owners(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("property_id", id);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("check_in, check_out")
    .eq("property_id", id);
  let nightsBooked = 0;
  for (const b of bookings ?? []) {
    if (b.check_in && b.check_out) {
      nightsBooked += Math.max(0, (Date.parse(b.check_out) - Date.parse(b.check_in)) / 86_400_000);
    }
  }

  return {
    ...data,
    photos: [...(data.photos ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    owner: data.owner,
    bookingCount: count ?? 0,
    nightsBooked: Math.round(nightsBooked),
  };
}

export async function getOwners() {
  const { data, error } = await getSupabaseAdmin()
    .from("owners")
    .select("id, name, email")
    .order("name", { ascending: true });
  if (error) {
    console.error("[admin.catalog] getOwners:", error);
    return [];
  }
  return data ?? [];
}

const lineArray = (value: string): string[] =>
  value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export async function saveAdminProperty(
  input: AdminPropertyInput,
  photos: AdminPhotoInput[],
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = getSupabaseAdmin();
  const name = input.name_es.trim() || input.name_en.trim() || "Sin nombre";
  const location_label = input.location_label_es.trim() || input.location_label_en.trim() || "";

  const payload = {
    slug:
      input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") ||
      name.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    name,
    name_es: input.name_es.trim() || null,
    name_en: input.name_en.trim() || null,
    description: input.description_es.trim() || input.description_en.trim() || null,
    description_es: input.description_es.trim() || null,
    description_en: input.description_en.trim() || null,
    location_label,
    location_label_es: input.location_label_es.trim() || null,
    location_label_en: input.location_label_en.trim() || null,
    lat: input.lat.trim() ? Number(input.lat) : null,
    lng: input.lng.trim() ? Number(input.lng) : null,
    capacity: Number(input.capacity) || 2,
    bedrooms: input.bedrooms.trim() ? Number(input.bedrooms) : null,
    bathrooms: input.bathrooms.trim() ? Number(input.bathrooms) : null,
    price_per_night: Number(input.price_per_night) || 0,
    currency: input.currency || "USD",
    owner_id: input.owner_id || null,
    status: input.status,
    featured: input.featured,
    brand: input.brand.trim() || null,
    amenities: lineArray(input.amenities_es),
    amenities_en: lineArray(input.amenities_en),
    wildlife_seen: lineArray(input.wildlife_seen),
    services: lineArray(input.services),
  } as Partial<PropertiesRow>;

  let id = input.id;
  if (id) {
    const { error } = await supabase.from("properties").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      console.error("[admin.catalog] update property:", error);
      return { ok: false, error: error.message };
    }
  } else {
    const { data, error } = await supabase.from("properties").insert(payload).select("id").single();
    if (error) {
      console.error("[admin.catalog] insert property:", error);
      return { ok: false, error: error.message };
    }
    id = data.id;
  }

  const { error: delPhotos } = await supabase.from("property_photos").delete().eq("property_id", id);
  if (delPhotos) {
    console.error("[admin.catalog] delete photos:", delPhotos);
    return { ok: false, error: delPhotos.message };
  }
  const photoRows = photos
    .map((p, i) => ({ property_id: id, url: p.url.trim(), alt: p.alt.trim() || null, sort_order: i }))
    .filter((p) => p.url);
  if (photoRows.length > 0) {
    const { error } = await supabase.from("property_photos").insert(photoRows);
    if (error) {
      console.error("[admin.catalog] insert photos:", error);
      return { ok: false, error: error.message };
    }
  }

  return { ok: true, id };
}

export async function deleteAdminProperty(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("property_id", id);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: "La casa tiene reservas; mejor marcarla como inactiva en vez de borrarla.",
    };
  }
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) {
    console.error("[admin.catalog] delete property:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Tours
// ---------------------------------------------------------------------------

export type AdminTour = ToursRow & {
  photos: PhotoView[];
  bookingCount: number;
  revenue: number;
};

export type AdminTourInput = {
  id?: string | null;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  highlights_es: string;
  highlights_en: string;
  includes_es: string;
  includes_en: string;
  duration: string;
  duration_hours: string;
  price: string;
  original_price: string;
  currency: string;
  capacity: string;
  max_participants: string;
  provider: string;
  commission_percent: string;
  category: string;
  badge_text: string;
  badge_color: string;
  featured: boolean;
  status: ListingStatus;
  pricing_options: TourPricingOption[];
};

export async function listAdminTours(): Promise<AdminTour[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tours")
    .select("*, photos:tour_photos(id, url, alt, sort_order)");
  if (error) {
    console.error("[admin.catalog] listAdminTours:", error);
    return [];
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("tour_id, total_amount")
    .not("tour_id", "is", null);
  const countBy = new Map<string, number>();
  const revenueBy = new Map<string, number>();
  for (const b of bookings ?? []) {
    if (!b.tour_id) continue;
    countBy.set(b.tour_id, (countBy.get(b.tour_id) ?? 0) + 1);
    revenueBy.set(b.tour_id, (revenueBy.get(b.tour_id) ?? 0) + Number(b.total_amount ?? 0));
  }

  return (data ?? []).map((tour) => ({
    ...tour,
    photos: [...(tour.photos ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    bookingCount: countBy.get(tour.id) ?? 0,
    revenue: Math.round(revenueBy.get(tour.id) ?? 0),
  }));
}

export async function getAdminTour(id: string): Promise<AdminTour | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tours")
    .select("*, photos:tour_photos(id, url, alt, sort_order)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;

  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tour_id", id);
  const { data: revenue } = await supabase
    .from("bookings")
    .select("total_amount")
    .eq("tour_id", id);

  return {
    ...data,
    photos: [...(data.photos ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    bookingCount: count ?? 0,
    revenue: Math.round(
      (revenue ?? []).reduce((acc, b) => acc + Number(b.total_amount ?? 0), 0),
    ),
  };
}

export async function saveAdminTour(
  input: AdminTourInput,
  photos: AdminPhotoInput[],
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = getSupabaseAdmin();
  const name = input.name_es.trim() || input.name_en.trim() || "Sin nombre";

  const payload = {
    slug:
      input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") ||
      name.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    name,
    name_es: input.name_es.trim() || null,
    name_en: input.name_en.trim() || null,
    description: input.description_es.trim() || input.description_en.trim() || null,
    description_es: input.description_es.trim() || null,
    description_en: input.description_en.trim() || null,
    highlights_es: lineArray(input.highlights_es),
    highlights_en: lineArray(input.highlights_en),
    includes_es: lineArray(input.includes_es),
    includes_en: lineArray(input.includes_en),
    duration: input.duration.trim() || null,
    duration_hours: input.duration_hours.trim() ? Number(input.duration_hours) : null,
    price: Number(input.price) || 0,
    original_price: input.original_price.trim() ? Number(input.original_price) : null,
    currency: input.currency || "USD",
    capacity: Number(input.capacity) || 10,
    max_participants: input.max_participants.trim() ? Number(input.max_participants) : null,
    provider: input.provider.trim() || "Vamos Jacó",
    commission_percent: Number(input.commission_percent) || 10,
    category: input.category.trim() || null,
    badge_text: input.badge_text.trim() || null,
    badge_color: input.badge_color.trim() || null,
    pricing_options: input.pricing_options,
    featured: input.featured,
    status: input.status,
  } as Partial<ToursRow>;

  let id = input.id;
  if (id) {
    const { error } = await supabase
      .from("tours")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      console.error("[admin.catalog] update tour:", error);
      return { ok: false, error: error.message };
    }
  } else {
    const { data, error } = await supabase.from("tours").insert(payload).select("id").single();
    if (error) {
      console.error("[admin.catalog] insert tour:", error);
      return { ok: false, error: error.message };
    }
    id = data.id;
  }

  const { error: delPhotos } = await supabase.from("tour_photos").delete().eq("tour_id", id);
  if (delPhotos) return { ok: false, error: delPhotos.message };
  const photoRows = photos
    .map((p, i) => ({ tour_id: id, url: p.url.trim(), alt: p.alt.trim() || null, sort_order: i }))
    .filter((p) => p.url);
  if (photoRows.length > 0) {
    const { error } = await supabase.from("tour_photos").insert(photoRows);
    if (error) {
      console.error("[admin.catalog] insert tour photos:", error);
      return { ok: false, error: error.message };
    }
  }

  return { ok: true, id };
}

export async function deleteAdminTour(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tour_id", id);
  if ((count ?? 0) > 0) {
    return { ok: false, error: "El tour tiene reservas; mejor marcarlo como inactivo." };
  }
  const { error } = await supabase.from("tours").delete().eq("id", id);
  if (error) {
    console.error("[admin.catalog] delete tour:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}