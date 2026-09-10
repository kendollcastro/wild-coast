// Importa las casas reales de property_export/properties.json al catálogo.
//
//   node scripts/import-properties.mjs
//
// - Crea (si no existe) el owner "The Sanctuary Luxury Homes".
// - Copia las imágenes de property_export/<casa>/images/ a public/images/ (aplanadas).
// - Upsert de las 3 casas por slug con $199/noche (placeholder), descripciones
//   generadas EN+ES, amenities/wildlife traducidos al ES y datos estructurados.
// - Inserta property_photos con la cover primero y el resto de la galería.
//
// Lee credenciales de .env.local (SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL).

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, basename } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXPORT_DIR = join(ROOT, "property_export");
const EXPORT_JSON = join(EXPORT_DIR, "properties.json");
const IMAGES_DST = join(ROOT, "public", "images");

const OWNER_NAME = "The Sanctuary Luxury Homes";
const OWNER_EMAIL = "sanctuary@jaco.example";
const PRICE_PER_NIGHT = 199;
const LAT = 9.865;
const LNG = -84.721;

/** Traducción EN → ES de las comodidades del export. */
const AMENITY_ES = {
  "Fully equipped": "Completamente equipada",
  "Internal elevator": "Ascensor interno",
  Pool: "Piscina",
  Jacuzzi: "Jacuzzi",
  "Ocean view": "Vista al mar",
  Bonfire: "Fogata",
  BBQ: "BBQ",
  "Furnished terrace": "Terraza amoblada",
  "Garage for 4 cars": "Garaje para 4 carros",
  Garage: "Garaje",
  "Swimming pool": "Piscina",
  "Indoor parking": "Parqueo cubierto",
  "Pool table": "Mesa de billar",
  "Game room": "Sala de juegos",
};

const WILDLIFE_ES = {
  Monkeys: "Monos",
  "Scarlet macaws (lapas)": "Lapas",
  Toucans: "Tucanes",
  "Mountain pigs": "Chanchos de monte",
};

const SERVICE_ES = {
  Tours: "Tours",
  "Yoga classes": "Clases de yoga",
  "Professional massage services": "Servicios de masaje profesional",
  "Professional chef service": "Servicio de chef profesional",
  "Private transportation service": "Servicio de transporte privado",
  "Playa Hermosa Supermarket": "Supermercado de Playa Hermosa",
};

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

function numberWord(n) {
  return new Intl.NumberFormat("en").format(n);
}

/** Genera la descripción (ES y EN) a partir de los datos del export. */
function buildDescriptions(property, amenitiesEs) {
  const { location, bedrooms, bathrooms, wildlife } = property;
  const place = `${location.area}, ${location.city}`;
  const topAmenities = amenitiesEs.slice(0, 3).join(", ");
  const wildlifeEs = (property.wildlife_sightings ?? [])
    .map((w) => WILDLIFE_ES[w] ?? w)
    .filter(Boolean);

  const es = [
    `${property.nameEs} en ${place}, Costa Rica.`,
    `Casa de ${numberWord(bedrooms)} habitaciones y ${bathrooms} baños, con ${topAmenities}.`,
    wildlifeEs.length > 0
      ? `En el jardín es normal cruzarse con ${wildlifeEs.slice(0, 3).join(", ").toLowerCase()}.`
      : null,
    "Reservá directo con el anfitrión local, sin cargos de plataforma y con confirmación en 24 horas.",
  ]
    .filter(Boolean)
    .join(" ");

  const en = [
    `${property.nameEn} in ${place}, Costa Rica.`,
    `A ${numberWord(bedrooms)}-bedroom, ${bathrooms}-bath home with ${topAmenities}.`,
    wildlife.length > 0
      ? `In the yard you'll often spot ${wildlife.slice(0, 3).join(", ").toLowerCase()}.`
      : null,
    "Book directly with the local host, no platform fees and confirmation within 24 hours.",
  ]
    .filter(Boolean)
    .join(" ");

  return { es, en };
}

function copyImages(properties) {
  const files = [];
  for (const property of properties) {
    for (const rel of [property.hero_image, ...(property.gallery ?? [])]) {
      const src = join(EXPORT_DIR, rel.replace(/^\.\//, ""));
      if (!existsSync(src)) continue;
      const dst = join(IMAGES_DST, basename(src));
      files.push({ rel, src, dst, url: `/images/${basename(src)}` });
    }
  }
  mkdirSync(IMAGES_DST, { recursive: true });
  for (const f of files) {
    copyFileSync(f.src, f.dst);
  }
  return files;
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
  const properties = exportJson.properties;
  if (!Array.isArray(properties)) {
    console.error("[import] properties.json no contiene un array 'properties'.");
    process.exit(1);
  }
  console.log(`[import] leyendo ${properties.length} casas de ${EXPORT_JSON}`);

  const copiedFiles = copyImages(properties);

  const propertyRows = [];
  const photoBatches = [];
  const broken = [];

  for (const property of properties) {
    const bedrooms = property.bedrooms ?? 0;
    const bathrooms = property.bathrooms ?? 0;

    // nombre ES: de la fuente ("CASA BUDDHA FOLLETO.pdf") o derivado del EN
    const nameEs =
      property.name === "Buddha House"
        ? "Casa Buddha"
        : property.name === "Toucan House"
          ? "Casa Tucán"
          : property.name === "Villa Esperanza"
            ? "Villa Esperanza"
            : property.name;

    const amenitiesEs = (property.amenities ?? []).map((a) => AMENITY_ES[a] ?? a);
    const wildlifeEs = (property.wildlife_sightings ?? []).map((w) => WILDLIFE_ES[w] ?? w);
    const servicesEs = (property.services_available ?? []).map((s) => ({
      ...s,
      name: SERVICE_ES[s.name] ?? s.name,
    }));

    const { es: descriptionEs, en: descriptionEn } = buildDescriptions(
      {
        ...property,
        nameEs,
        bathrooms,
        wildlife: property.wildlife_sightings ?? [],
      },
      amenitiesEs,
    );

    // imágenes únicas: cover primero, luego la galería
    const seen = new Set();
    const urls = [];
    for (const rel of [property.hero_image, ...(property.gallery ?? [])]) {
      const f = copiedFiles.find((c) => c.rel === rel);
      if (!f || seen.has(f.url)) continue;
      seen.add(f.url);
      urls.push(f.url);
    }
    for (const url of urls) {
      if (!existsSync(join(ROOT, "public", url))) broken.push(`archivo faltante en public/: ${url}`);
    }

    const locationLabel = `${property.location.area}, ${property.location.city}`;
    propertyRows.push({
      slug: property.slug,
      name: property.name,
      name_es: nameEs,
      name_en: property.name,
      description: descriptionEs,
      description_es: descriptionEs,
      description_en: descriptionEn,
      location_label: locationLabel,
      location_label_en: `${property.location.area}, ${property.location.city}, Costa Rica`,
      lat: LAT,
      lng: LNG,
      capacity: Math.max(2, bedrooms * 2),
      bedrooms,
      bathrooms,
      price_per_night: PRICE_PER_NIGHT,
      currency: "USD",
      status: property.status === "inactive" ? "inactive" : "active",
      featured: false,
      amenities: amenitiesEs,
      wildlife_seen: wildlifeEs,
      services: servicesEs,
      brand: property.brand ?? null,
    });

    urls.forEach((url, i) => {
      photoBatches.push({
        property_id: property.slug,
        url,
        alt: nameEs,
        sort_order: i,
      });
    });
  }

  if (broken.length > 0) {
    console.error("[import] rutas de imagen rotas (nada se escribió en BD):");
    for (const b of new Set(broken)) console.error("  -", b);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRole);

  // 1) Owner "The Sanctuary Luxury Homes" --------------------------------------
  let ownerId = null;
  {
    const { data: existing } = await supabase.from("owners").select("id").eq("email", OWNER_EMAIL).maybeSingle();
    if (existing) {
      ownerId = existing.id;
    } else {
      const { data, error } = await supabase
        .from("owners")
        .insert({ name: OWNER_NAME, email: OWNER_EMAIL, commission_percent: 10 })
        .select("id")
        .single();
      if (error) {
        console.error("[import] no se pudo crear el owner:", error.message);
        process.exit(1);
      }
      ownerId = data.id;
    }
  }
  console.log(`[import] owner: ${OWNER_NAME} (${ownerId})`);
  for (const row of propertyRows) row.owner_id = ownerId;

  // 2) Upsert de casas ----------------------------------------------------------
  const { error: upsertError } = await supabase
    .from("properties")
    .upsert(propertyRows, { onConflict: "slug" });
  if (upsertError) {
    console.error("[import] error al insertar casas:", upsertError.message);
    process.exit(1);
  }
  console.log(`[import] casas insertadas: ${propertyRows.length}`);

  // 3) Fotos (reemplaza las fotos de las casas importadas y limpia orphan de la misma casa)
  const slugs = properties.map((p) => p.slug);
  const { data: dbSlugs } = await supabase
    .from("properties")
    .select("id, slug")
    .in("slug", slugs);
  const bySlug = new Map((dbSlugs ?? []).map((p) => [p.slug, p.id]));
  const photosFinal = photoBatches.map((p) => ({
    ...p,
    property_id: bySlug.get(p.property_id) ?? p.property_id,
  }));

  const httpClient = createClient(supabaseUrl, serviceRole);
  for (const propertyId of new Set(photosFinal.map((p) => p.property_id))) {
    await httpClient.from("property_photos").delete().eq("property_id", propertyId);
  }
  const { error: photosError } = await supabase.from("property_photos").insert(photosFinal);
  if (photosError) {
    console.error("[import] error al insertar property_photos:", photosError.message);
    process.exit(1);
  }
  console.log(`[import] fotos insertadas: ${photosFinal.length}`);

  // 4) Validación ----------------------------------------------------------------
  const { data: dbProps, error: tErr } = await supabase
    .from("properties")
    .select("id, slug, status, price_per_night, bedrooms")
    .in("slug", slugs)
    .order("slug");
  if (tErr) {
    console.error("[import] validación falló:", tErr.message);
    process.exit(1);
  }
  const localUris = new Set(copiedFiles.map((f) => f.url));
  const dbUris = new Set(photosFinal.map((p) => p.url).filter((u) => u.startsWith("/images/")));
  const everyFileAssigned = [...localUris].every((u) => dbUris.has(u));
  const sizes = copiedFiles
    .map((f) => statSync(f.src).size)
    .reduce((a, b) => a + b, 0);

  console.log(`[import] casas en BD: ${dbProps.length} (esperado ${properties.length})`);
  console.log(`[import] fotos en BD: ${dbUris.size} (esperado ${localUris.size}) -> ${everyFileAssigned ? "OK" : "FALTAN"}`);
  console.log(`[import] imágenes copiadas: ${copiedFiles.length} (${(sizes / 1024 / 1024).toFixed(1)} MB)`);

  const ok = dbProps.length === properties.length && everyFileAssigned && broken.length === 0;
  console.log(ok ? "\n[import] OK: casas importadas con imágenes asignadas y sin rutas rotas." : "\n[import] REVISAR: la validación falló.");
  if (!ok) process.exit(2);
}

main().catch((err) => {
  console.error("[import] error inesperado:", err);
  process.exit(1);
});