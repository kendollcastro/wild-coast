-- ---------------------------------------------------------------------------
-- 0011_properties_amenities_en.sql
-- amenidades en inglés para properties (la columna amenities guarda el ES)
-- ---------------------------------------------------------------------------

alter table public.properties
  add column if not exists amenities_en    jsonb not null default '[]'::jsonb;