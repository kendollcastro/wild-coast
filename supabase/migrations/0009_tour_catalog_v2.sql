-- 0009: catálogo de tours expandido (bilingüe + pricing_options + badges)
-- Amplía public.tours con los campos del catálogo exportado (tours-export.json).
-- Las columnas de compatibilidad (name/description/price/capacity/status) se
-- siguen poblando desde el import para no romper la UI vigente.

alter table public.tours
  add column name_en         text,
  add column name_es         text,
  add column description_en  text,
  add column description_es  text,
  add column highlights_en   text[] not null default '{}',
  add column highlights_es   text[] not null default '{}',
  add column includes_en     text[] not null default '{}',
  add column includes_es     text[] not null default '{}',
  add column original_price  numeric(10, 2),
  add column badge_text      text,
  add column badge_color     text,
  add column max_participants int,
  add column pricing_options jsonb not null default '[]',
  add column duration        text,
  add column updated_at      timestamptz not null default now();

comment on column public.tours.pricing_options is
  'Array de opciones [{duration, price, variation_id?}] del tour (tarifas por duración).';

create trigger tours_updated_at
  before update on public.tours
  for each row execute function public.set_updated_at();