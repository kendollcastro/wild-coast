-- 0013: combos casa + tour (paquetes curados con descuento)

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.combo_status as enum ('active', 'inactive');

-- ---------------------------------------------------------------------------
-- combos: paquetes casa + tour(s)
-- ---------------------------------------------------------------------------
create table public.combos (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  name_en         text,
  name_es         text,
  description     text,
  description_en  text,
  description_es  text,
  property_id     uuid not null references public.properties (id) on delete restrict,
  discount_pct    numeric(5, 2) not null default 15
                  check (discount_pct between 0 and 50),
  badge_text      text,
  badge_color     text,
  featured        boolean not null default false,
  status          public.combo_status not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index combos_status_featured_idx on public.combos (status, featured);

-- ---------------------------------------------------------------------------
-- combo_tours: tours incluidos en cada combo (N:N)
-- ---------------------------------------------------------------------------
create table public.combo_tours (
  id         uuid primary key default gen_random_uuid(),
  combo_id   uuid not null references public.combos (id) on delete cascade,
  tour_id    uuid not null references public.tours (id) on delete cascade,
  sort_order int not null default 0,
  unique (combo_id, tour_id)
);

create index combo_tours_combo_idx on public.combo_tours (combo_id);

-- ---------------------------------------------------------------------------
-- combo_photos
-- ---------------------------------------------------------------------------
create table public.combo_photos (
  id         uuid primary key default gen_random_uuid(),
  combo_id   uuid not null references public.combos (id) on delete cascade,
  url        text not null,
  alt        text,
  sort_order int not null default 0
);

create index combo_photos_combo_idx on public.combo_photos (combo_id, sort_order);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.combos enable row level security;
alter table public.combo_tours enable row level security;
alter table public.combo_photos enable row level security;

create policy "Admin full access combos" on public.combos
  for all using (public.is_admin());
create policy "Public read active combos" on public.combos
  for select using (status = 'active');

create policy "Admin full access combo_tours" on public.combo_tours
  for all using (public.is_admin());
create policy "Public read combo_tours" on public.combo_tours
  for select using (true);

create policy "Admin full access combo_photos" on public.combo_photos
  for all using (public.is_admin());
create policy "Public read combo_photos" on public.combo_photos
  for select using (true);

-- ---------------------------------------------------------------------------
-- Trigger updated_at
-- ---------------------------------------------------------------------------
create trigger combos_updated_at
  before update on public.combos
  for each row execute function public.set_updated_at();
