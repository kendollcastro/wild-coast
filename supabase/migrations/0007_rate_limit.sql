-- 0007: rate limiting simple sobre Supabase (contador por clave + ventana).
-- Se usa desde Server Actions (service_role) para proteger login y reservas
-- de spam/brute-force sin depender de servicios externos.

create table if not exists public.rate_limits (
  key          text primary key,
  count        integer not null default 0,
  window_start timestamptz not null default now()
);

create or replace function public.ratelimit_check(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_window interval;
begin
  v_window := make_interval(secs => p_window_seconds);

  update public.rate_limits
     set count = case
           when (now() - window_start) < v_window then count + 1
           else 1
         end,
         window_start = case
           when (now() - window_start) < v_window then window_start
           else now()
         end
   where key = p_key
   returning count into v_count;

  if not found then
    insert into public.rate_limits (key, count, window_start)
    values (p_key, 1, now())
    returning count into v_count;
  end if;

  -- limpieza oportunista de claves viejas (llegan pocas, tabla pequeña)
  delete from public.rate_limits where window_start < (now() - interval '1 day');

  return v_count <= p_max;
end;
$$;

revoke all on function public.ratelimit_check(text, int, int) from public;
grant execute on function public.ratelimit_check(text, int, int) to postgres, service_role;