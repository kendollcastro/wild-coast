-- 0002: esquema base (tipos, tablas, índices, triggers)
-- convensiones: nombres snake_case, FKs explícitas, enums como tipos public.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.listing_status as enum ('active', 'inactive');
create type public.booking_type as enum ('tour', 'property');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled');
create type public.commission_status as enum ('pending', 'paid');
create type public.availability_kind as enum ('booking', 'blocked', 'owner');

-- ---------------------------------------------------------------------------
-- owners: dueños de propiedades
-- ---------------------------------------------------------------------------
create table public.owners (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users (id) on delete set null,
  name              text not null,
  email             text not null unique,
  phone             text,
  commission_percent numeric(5, 2) not null default 10
                    check (commission_percent between 0 and 100),
  created_at        timestamptz not null default now()
);

comment on table public.owners is
  'Dueños de propiedades de alquiler. user_id se conecta a Supabase Auth (fase 2: panel de dueños).';

-- ---------------------------------------------------------------------------
-- properties: casas de alquiler
-- ---------------------------------------------------------------------------
create table public.properties (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  description      text,
  location_label   text not null,
  lat              numeric(9, 6),
  lng              numeric(9, 6),
  capacity         int not null default 2 check (capacity > 0),
  bedrooms         int,
  bathrooms        numeric(3, 1),
  price_per_night  numeric(10, 2) not null check (price_per_night > 0),
  currency         text not null default 'USD',
  owner_id         uuid not null references public.owners (id),
  status           public.listing_status not null default 'active',
  featured         boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint properties_lat_range check (lat is null or (lat between -90 and 90)),
  constraint properties_lng_range check (lng is null or (lng between -180 and 180))
);

create index properties_featured_status_idx on public.properties (status, featured);
create index properties_owner_idx on public.properties (owner_id);

-- ---------------------------------------------------------------------------
-- property_photos
-- ---------------------------------------------------------------------------
create table public.property_photos (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  int not null default 0
);

create index property_photos_property_idx on public.property_photos (property_id, sort_order);

-- ---------------------------------------------------------------------------
-- tours
-- ---------------------------------------------------------------------------
create table public.tours (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  description       text,
  duration_hours    numeric(4, 1),
  price             numeric(10, 2) not null check (price > 0),
  currency          text not null default 'USD',
  capacity          int not null default 10 check (capacity > 0),
  provider          text not null default 'Vamos Jacó',
  -- % de comisión configurable por proveedor/tour para flexibilidad futura
  commission_percent numeric(5, 2) not null default 10
                    check (commission_percent between 0 and 100),
  category          text,
  featured          boolean not null default false,
  status            public.listing_status not null default 'active',
  created_at        timestamptz not null default now()
);

create index tours_status_featured_idx on public.tours (status, featured);
create index tours_provider_idx on public.tours (provider);

-- ---------------------------------------------------------------------------
-- tour_photos
-- ---------------------------------------------------------------------------
create table public.tour_photos (
  id       uuid primary key default gen_random_uuid(),
  tour_id  uuid not null references public.tours (id) on delete cascade,
  url      text not null,
  alt      text,
  sort_order int not null default 0
);

create index tour_photos_tour_idx on public.tour_photos (tour_id, sort_order);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table public.bookings (
  id                uuid primary key default gen_random_uuid(),
  booking_code      text not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
                    constraint bookings_code_unique unique,
  booking_type      public.booking_type not null,
  property_id       uuid references public.properties (id) on delete restrict,
  tour_id           uuid references public.tours (id) on delete restrict,
  guest_name        text not null,
  guest_email       text not null,
  guest_phone       text,
  party_size        int not null default 1 check (party_size >= 1),
  check_in          date,
  check_out         date,
  tour_date         date,
  status            public.booking_status not null default 'pending',
  total_amount      numeric(10, 2) not null check (total_amount >= 0),
  commission_amount numeric(10, 2) not null default 0 check (commission_amount >= 0),
  currency          text not null default 'USD',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- cada booking referencia exactamente un tour o una propiedad, con fechas coherentes
  constraint bookings_valid_target check (
    (booking_type = 'property' and property_id is not null and tour_id is null
      and check_in is not null and check_out is not null and tour_date is null)
    or
    (booking_type = 'tour' and tour_id is not null and property_id is null
      and tour_date is not null and check_in is null and check_out is null)
  ),
  constraint bookings_valid_range check (check_out is null or check_out > check_in)
);

create index bookings_status_idx on public.bookings (status);
create index bookings_created_idx on public.bookings (created_at desc);
create index bookings_property_idx on public.bookings (property_id) where property_id is not null;
create index bookings_tour_idx on public.bookings (tour_id) where tour_id is not null;
create index bookings_guest_email_idx on public.bookings (guest_email);

-- ---------------------------------------------------------------------------
-- availability_blocks: bloqueo de fechas (reserva, preventivo, dueño)
-- El constraint EXCLUDE con daterange es la garantía anti-doble-reserva.
-- ---------------------------------------------------------------------------
create table public.availability_blocks (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete cascade,
  tour_id     uuid references public.tours (id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  reason      public.availability_kind not null default 'blocked',
  booking_id  uuid references public.bookings (id) on delete set null,
  created_at  timestamptz not null default now(),
  period      daterange generated always as (daterange(start_date, end_date, '[)')) stored,
  constraint availability_one_entity check (
    (property_id is not null and tour_id is null)
    or (property_id is null and tour_id is not null)
  ),
  constraint availability_valid_range check (end_date > start_date)
);

-- no solapamiento de bloques por propiedad
alter table public.availability_blocks
  add constraint availability_property_no_overlap
  exclude using gist (property_id with =, period with &&)
  where (property_id is not null);

-- no solapamiento de bloques por tour (un bloque por día por tour)
alter table public.availability_blocks
  add constraint availability_tour_no_overlap
  exclude using gist (tour_id with =, period with &&)
  where (tour_id is not null);

create index availability_property_host_idx on public.availability_blocks (property_id, start_date);
create index availability_tour_host_idx on public.availability_blocks (tour_id, start_date);
create index availability_booking_idx on public.availability_blocks (booking_id);

-- ---------------------------------------------------------------------------
-- commissions
-- ---------------------------------------------------------------------------
create table public.commissions (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null unique references public.bookings (id) on delete cascade,
  amount      numeric(10, 2) not null check (amount >= 0),
  status      public.commission_status not null default 'pending',
  paid_at     timestamptz,
  notes       text,
  created_at  timestamptz not null default now()
);

create index commissions_status_idx on public.commissions (status);

-- ---------------------------------------------------------------------------
-- admins: quién administra la plataforma (registrado contra Supabase Auth)
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Vista pública de disponibilidad (sin exponer booking_id / datos de huéspedes)
-- ---------------------------------------------------------------------------
create view public.availability_calendar as
select id, property_id, tour_id, start_date, end_date, reason, created_at
from public.availability_blocks;

-- ---------------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();