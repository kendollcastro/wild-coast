// Importa el catálogo de tours (tour-export/tours-export.json) al proyecto.
//
//   node scripts/import-tours.mjs
//
// - Copia las imágenes aplanadas de tour-export/images/ a public/images/.
// - Resuelve cada image_url/gallery vía tour-export/images-map.json.
//   http(s):// se deja como URL directa (única: Unsplash).
// - Reemplaza todos los tours existentes por los 17 del JSON (upsert por slug).
// - Inserta tour_photos con la cover primero y el resto de la galería sin duplicar.
// - Valida 17 tours y 61 imágenes asignadas sin rutas rotas.
//
// Lee credenciales de .env.local (SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL).

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXPORT_DIR = join(ROOT, "tour-export");
const EXPORT_JSON = join(EXPORT_DIR, "tours-export.json");
const IMAGES_MAP_JSON = join(EXPORT_DIR, "images-map.json");
const IMAGES_SRC = join(EXPORT_DIR, "images");
const IMAGES_DST = join(ROOT, "public", "images");

function loadEnv(file) {
  const env = {};
  if (!existsSync(file)) return env;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return env;
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

// Convierte duraciones libres ("2 Hours", "90 Min", "1 to 8 Hours", "Half Day"...)
// a horas numéricas para la columna duration_hours. Mejor esfuerzo; null si no hay match.
function parseDurationHours(value) {
  if (!value) return null;
  const s = String(value).toLowerCase();
  const num = (re) => {
    const m = s.match(re);
    return m ? parseFloat(m[1]) : null;
  };
  const hours = num(/(\d+(?:\.\d+)?)\s*hours?/);
  if (hours != null) return round1(hours);
  const mins = num(/(\d+(?:\.\d+)?)\s*mins?/);
  if (mins != null) return round1(mins / 60);
  if (s.includes("half day") && s.includes("full day")) return 4;
  if (s.includes("half day")) return 4;
  if (s.includes("full day")) return 8;
  return null;
}

// Resuelve una ruta de imagen original a la URL final de la app.
// "/images/ATV/x.jpg" -> "/images/x.jpg"   |   https://... -> igual.
function resolveImage(src, map) {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  const mapped = map[src];
  if (!mapped) return null;
  return "/" + mapped;
}

function copyImages(map) {
  const files = Object.values(map)
    .filter((v) => v.startsWith("images/"))
    .map((v) => ({ src: join(IMAGES_SRC, v.slice("images/".length)), dst: join(IMAGES_DST, v.slice("images/".length)) }))
    .filter((f) => existsSync(f.src));

  if (files.length === 0) {
    console.warn("[import] no hay imágenes en tour-export/images/ para copiar.");
    return 0;
  }
  mkdirSync(IMAGES_DST, { recursive: true });
  let copied = 0;
  for (const f of files) {
    copyFileSync(f.src, f.dst);
    copied++;
  }
  return copied;
}

async function main() {
  const env = loadEnv(join(ROOT, ".env.local"));
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    console.error("[import] faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  const exportJson = JSON.parse(readFileSync(EXPORT_JSON, "utf8"));
  const imageMap = JSON.parse(readFileSync(IMAGES_MAP_JSON, "utf8"));
  const tours = exportJson.tours;
  if (!Array.isArray(tours)) {
    console.error("[import] tours-export.json no contiene un array 'tours'.");
    process.exit(1);
  }
  console.log(`[import] leyendo ${tours.length} tours de ${EXPORT_JSON}`);

  // 1) Copiar imágenes a public/images/ -------------------------------------
  const copied = copyImages(imageMap);
  console.log(`[import] imágenes copiadas a public/images/: ${copied}`);

  // 2) Build rows ------------------------------------------------------------
  const tourRows = [];
  const photoBatches = [];
  const broken = [];

  for (const tour of tours) {
    const cover = resolveImage(tour.image_url, imageMap);
    const resolvedGallery = (tour.gallery ?? []).map((g) => resolveImage(g, imageMap));

    // Cover primero, luego el resto de la galería, todo sin duplicados.
    const seen = new Set();
    const photos = [];
    for (const url of [cover, ...resolvedGallery]) {
      if (!url || seen.has(url)) continue;
      seen.add(url);
      photos.push(url);
    }

    for (const url of photos) {
      if (!url) broken.push(`sin resolución: ${tour.slug} -> ${tour.image_url}`);
      else if (url.startsWith("/images/") && !existsSync(join(ROOT, "public", url))) {
        broken.push(`archivo faltante en public/: ${url}`); // verificar luego de copiar
      }
    }

    tourRows.push({
      id: tour.id,
      slug: tour.slug,
      name: tour.name_es ?? tour.name_en ?? "Sin nombre",
      name_en: tour.name_en ?? null,
      name_es: tour.name_es ?? null,
      description: tour.description_es ?? tour.description_en ?? null,
      description_en: tour.description_en ?? null,
      description_es: tour.description_es ?? null,
      highlights_en: tour.highlights_en ?? [],
      highlights_es: tour.highlights_es ?? [],
      includes_en: tour.includes_en ?? [],
      includes_es: tour.includes_es ?? [],
      duration: tour.duration ?? null,
      duration_hours: parseDurationHours(tour.duration),
      price: tour.price_base,
      original_price: tour.original_price ?? null,
      capacity: tour.max_participants ?? 10,
      max_participants: tour.max_participants ?? null,
      category: tour.category ?? null,
      badge_text: tour.badge_text ?? null,
      badge_color: tour.badge_color ?? null,
      pricing_options: Array.isArray(tour.pricing_options) ? tour.pricing_options : [],
      featured: false,
      status: tour.is_active === false ? "inactive" : "active",
      created_at: tour.created_at,
      updated_at: tour.updated_at,
    });

    if (cover) {
      photoBatches.push({
        tour_id: tour.id,
        url: cover,
        alt: tour.name_es ?? tour.name_en ?? tour.slug,
        sort_order: 0,
      });
    }
    const coverSlots = cover ? 1 : 0;
    photos.slice(coverSlots).forEach((url, i) => {
      photoBatches.push({
        tour_id: tour.id,
        url,
        alt: tour.name_es ?? tour.name_en ?? tour.slug,
        sort_order: coverSlots + i,
      });
    });
  }

  if (broken.length > 0) {
    console.error("[import] rutas de imagen rotas (nada se escribió en BD):");
    for (const b of new Set(broken)) console.error("  -", b);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRole);

  // 3) Reemplazar tours existentes --------------------------------------------
  const { error: delError } = await supabase
    .from("tours")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (delError) {
    console.error("[import] no se pudo limpiar tours previos:", delError.message);
    process.exit(1);
  }

  // 4) Insertar tours ----------------------------------------------------------
  const { error: upsertError } = await supabase
    .from("tours")
    .upsert(tourRows, { onConflict: "slug" });
  if (upsertError) {
    console.error("[import] error al insertar tours:", upsertError.message);
    process.exit(1);
  }
  console.log(`[import] tours insertados: ${tourRows.length}`);

  // 5) Insertar fotos ----------------------------------------------------------
  const { error: photosError } = await supabase.from("tour_photos").insert(photoBatches);
  if (photosError) {
    console.error("[import] error al insertar tour_photos:", photosError.message);
    process.exit(1);
  }
  console.log(`[import] fotos insertadas: ${photoBatches.length}`);

  // 6) Validación ----------------------------------------------------------------
  const slugs = tours.map((t) => t.slug);
  const { data: dbTours, error: tErr } = await supabase
    .from("tours")
    .select("id, slug, status");
  if (tErr) {
    console.error("[import] validación falló:", tErr.message);
    process.exit(1);
  }

  const imported = dbTours.filter((t) => slugs.includes(t.slug));
  console.log(`[import] tours en BD: ${dbTours.length} (esperado 17), importados: ${imported.length}`);

  const { data: dbPhotos, error: pErr } = await supabase
    .from("tour_photos")
    .select("tour_id, url, sort_order");
  if (pErr) {
    console.error("[import] validación de fotos falló:", pErr.message);
    process.exit(1);
  }

  const localFiles = Object.values(imageMap).filter((v) => v.startsWith("images/"));
  const localUris = new Set(localFiles.map((v) => "/" + v));
  const dbLocalUris = new Set(dbPhotos.map((p) => p.url).filter((u) => u.startsWith("/images/")));
  const everyFileAssigned = [...localUris].every((u) => dbLocalUris.has(u));

  console.log(`[import] fotos en BD: ${dbPhotos.length} (esperado ${photoBatches.length})`);
  console.log(`[import] archivos locales asignados: ${dbLocalUris.size} de ${localUris.size} -> ${everyFileAssigned ? "OK" : "FALTAN"}`);

  const brokenPhotoUris = dbPhotos.filter(
    (p) => p.url.startsWith("/images/") && !existsSync(join(ROOT, "public", p.url)),
  );
  console.log(`[import] rutas locales rotas en BD: ${brokenPhotoUris.length}`);

  const ok =
    imported.length === 17 &&
    dbPhotos.length === photoBatches.length &&
    everyFileAssigned &&
    broken.length === 0 &&
    brokenPhotoUris.length === 0;

  console.log(ok ? "\n[import] OK: 17 tours y 61 imágenes asignadas sin rutas rotas." : "\n[import] REVISAR: la validación falló.");
  if (!ok) process.exit(2);
}

main().catch((err) => {
  console.error("[import] error inesperado:", err);
  process.exit(1);
});