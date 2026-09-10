// Corrige description_en de las casas reales: el import original dejó
// "undefined in Playa Hermosa..." (campo inexistente en el export) y amenities
// en español dentro del texto EN.
//
//   node scripts/fix-prop-descriptions-en.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXPORT_JSON = join(ROOT, "property_export", "properties.json");

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

function buildEnDescription(property) {
  const { location, bedrooms, bathrooms } = property;
  const place = `${location.area}, ${location.city}`;
  const topAmenities = (property.amenities ?? []).slice(0, 3).join(", ");
  const wildlife = property.wildlife_sightings ?? [];
  return [
    `${property.name} in ${place}, Costa Rica.`,
    `A ${numberWord(bedrooms)}-bedroom, ${bathrooms}-bath home with ${topAmenities}.`,
    wildlife.length > 0
      ? `In the yard you'll often spot ${wildlife.slice(0, 3).join(", ").toLowerCase()}.`
      : null,
    "Book directly with the local host, no platform fees and confirmation within 24 hours.",
  ]
    .filter(Boolean)
    .join(" ");
}

async function main() {
  const env = loadEnv(join(ROOT, ".env.local"));
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { properties } = JSON.parse(readFileSync(EXPORT_JSON, "utf8"));
  let updated = 0;
  for (const property of properties) {
    const description_en = buildEnDescription(property);
    const { error } = await supabase
      .from("properties")
      .update({ description_en })
      .eq("slug", property.slug);
    if (error) {
      console.error(`[fix] ${property.slug}:`, error.message);
      continue;
    }
    updated++;
    console.log(`[fix] ${property.slug} → ${description_en.length} chars: ${description_en.slice(0, 90)}…`);
  }
  console.log(`[fix] descripciones EN actualizadas: ${updated}/${properties.length}`);
}

main().catch((err) => {
  console.error("[fix] error inesperado:", err);
  process.exit(1);
});