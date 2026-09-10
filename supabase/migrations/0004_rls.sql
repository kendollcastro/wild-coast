-- 0004: Row Level Security
-- Modelo: el catálogo se lee con la key anon (solo lectura, filas activas).
-- Las mutaciones (bookings, estados, admin) ocurren en Server Actions que usan
-- la key service_role (bypasa RLS por diseño). Estas políticas son defensa en
-- profundidad para que ningún cliente con key anon/authenticated escriba o
-- lea datos ajenos directamente.

-- ---------------------------------------------------------------------------
-- helpers de autorización
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

create or replace function public.is_owner_of(pid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.properties p
    join public.owners o on o.id = p.owner_id
    where p.id = pid and o.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------
alter table public.properties enable row level security;

create policy properties_select_public on public.properties
  for select to anon
  using (status = 'active');

create policy properties_select_authenticated on public.properties
  for select to authenticated
  using (status = 'active' or public.is_admin() or public.is_owner_of(id));

create policy properties_insert_admin on public.properties
  for insert to authenticated with check (public.is_admin());

create policy properties_update_admin on public.properties
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy properties_delete_admin on public.properties
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- property_photos
-- ---------------------------------------------------------------------------
alter table public.property_photos enable row level security;

create policy property_photos_select_public on public.property_photos
  for select to anon
  using (exists (
    select 1 from public.properties p where p.id = property_id and p.status = 'active'
  ));

create policy property_photos_select_authenticated on public.property_photos
  for select to authenticated
  using (exists (
    select 1 from public.properties p
    where p.id = property_id and (p.status = 'active' or public.is_admin() or public.is_owner_of(p.id))
  ));

create policy property_photos_write_admin on public.property_photos
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- tours
-- ---------------------------------------------------------------------------
alter table public.tours enable row level security;

create policy tours_select_public on public.tours
  for select to anon
  using (status = 'active');

create policy tours_select_authenticated on public.tours
  for select to authenticated
  using (status = 'active' or public.is_admin());

create policy tours_write_admin on public.tours
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- tour_photos
-- ---------------------------------------------------------------------------
alter table public.tour_photos enable row level security;

create policy tour_photos_select_public on public.tour_photos
  for select to anon
  using (exists (
    select 1 from public.tours t where t.id = tour_id and t.status = 'active'
  ));

create policy tour_photos_select_authenticated on public.tour_photos
  for select to authenticated
  using (exists (
    select 1 from public.tours t where t.id = tour_id and (t.status = 'active' or public.is_admin())
  ));

create policy tour_photos_write_admin on public.tour_photos
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- owners (no expuesto a anon: contiene contacto y % de comisión)
-- ---------------------------------------------------------------------------
alter table public.owners enable row level security;

create policy owners_select_admin on public.owners
  for select to authenticated
  using (public.is_admin());

create policy owners_write_admin on public.owners
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- bookings (sin políticas anon: solo admin / dueño vía service_role o auth)
-- ---------------------------------------------------------------------------
alter table public.bookings enable row level security;

create policy bookings_select_admin on public.bookings
  for select to authenticated
  using (
    public.is_admin()
    or (
      booking_type = 'property'
      and public.is_owner_of(property_id)
    )
  );

create policy bookings_update_admin on public.bookings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- availability_blocks (anónimos leen solo la vista sin booking_id)
-- ---------------------------------------------------------------------------
alter table public.availability_blocks enable row level security;

create policy availability_select_admin on public.availability_blocks
  for select to authenticated
  using (public.is_admin());

create policy availability_write_admin on public.availability_blocks
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- commissions
-- ---------------------------------------------------------------------------
alter table public.commissions enable row level security;

create policy commissions_select_admin on public.commissions
  for select to authenticated using (public.is_admin());

create policy commissions_write_admin on public.commissions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- admins (cada usuario admin ve su propia fila)
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;

create policy admins_select_own on public.admins
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- grants y vista pública de disponibilidad
-- ---------------------------------------------------------------------------
grant select on public.availability_calendar to anon, authenticated;
grant usage on schema public to anon, authenticated;