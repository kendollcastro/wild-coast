-- 0012: Índices operativos para el panel admin (filtros y conteos)

create index if not exists bookings_status_idx
  on public.bookings (status);

create index if not exists bookings_status_created_at_idx
  on public.bookings (status, created_at desc);

create index if not exists bookings_booking_type_status_idx
  on public.bookings (booking_type, status);

create index if not exists commissions_status_idx
  on public.commissions (status);

create index if not exists commissions_booking_id_status_idx
  on public.commissions (booking_id, status);