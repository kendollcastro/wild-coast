// Carga amenities_en (versión EN original del export) para las casas reales.
//
//   node scripts/backfill-amenities-en.mjs

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

async function main() {
  const env = loadEnv(join(ROOT, ".env.local"));
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { properties } = JSON.parse(readFileSync(EXPORT_JSON, "utf8"));
  let updated = 0;
  for (const property of properties) {
    const amenitiesEn = property.amenities ?? [];
    const { error } = await supabase
      .from("properties")
      .update({ amenities_en: amenitiesEn })
      .eq("slug", property.slug);
    if (error) {
      console.error(`[backfill] ${property.slug}:`, error.message);
      continue;
    }
    updated++;
    console.log(`[backfill] ${property.slug} → ${amenitiesEn.length} amenities EN`);
  }
  console.log(`[backfill] actualizadas: ${updated}/${properties.length}`);
}

main().catch((err) => {
  console.error("[backfill] error inesperado:", err);
  process.exit(1);
});