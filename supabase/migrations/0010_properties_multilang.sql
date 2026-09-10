-- ---------------------------------------------------------------------------
-- 0010_properties_multilang.sql
-- campos bilingües para properties + datos estructurados del export
-- ---------------------------------------------------------------------------

alter table public.properties
  add column if not exists name_en            text,
  add column if not exists name_es            text,
  add column if not exists description_en     text,
  add column if not exists description_es     text,
  add column if not exists location_label_en  text,
  add column if not exists amenities          jsonb not null default '[]'::jsonb,
  add column if not exists wildlife_seen      jsonb not null default '[]'::jsonb,
  add column if not exists services           jsonb not null default '[]'::jsonb,
  add column if not exists brand              text;