-- 0003: función de reserva atómica
-- TODO(payments): este RPC crea la reserva como 'pending'. Cuando se integre el
-- proveedor de pago (Fygaro), la confirmación final sigue dependiendo del adapter
-- en la capa de aplicación (módulo payments), no de esta función.

create or replace function public.create_booking(
  p_booking_type public.booking_type,
  p_property_id  uuid,
  p_tour_id      uuid,
  p_guest_name   text,
  p_guest_email  text,
  p_guest_phone  text,
  p_party_size   int,
  p_check_in     date,
  p_check_out    date,
  p_tour_date    date,
  p_notes        text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking    public.bookings;
  v_property   public.properties;
  v_tour       public.tours;
  v_nights     int;
  v_price      numeric(10, 2);
  v_commission numeric(10, 2);
begin
  -- valida identidad del emisor como huésped
  -- (no requiere sesión; el booking queda 'pending' hasta confirmación por admin/pago)

  if p_guest_name is null or trim(p_guest_name) = '' then
    raise exception 'guest_name_required';
  end if;
  if p_guest_email is null or position('@' in p_guest_email) = 0 then
    raise exception 'guest_email_invalid';
  end if;

  if p_booking_type = 'property' then
    -- -----------------------------------------------------------------------
    -- RESERVA DE PROPIEDAD
    -- -----------------------------------------------------------------------
    if p_property_id is null or p_check_in is null or p_check_out is null then
      raise exception 'property_booking_requires_dates';
    end if;
    if p_check_out <= p_check_in then
      raise exception 'check_out_must_be_after_check_in';
    end if;

    -- lock del registro: serializa bookings concurrentes sobre la misma propiedad.
    select * into v_property
    from public.properties
    where id = p_property_id
    for update;

    if not found then
      raise exception 'property_not_found';
    end if;
    if v_property.status <> 'active' then
      raise exception 'property_not_available';
    end if;
    if p_party_size > v_property.capacity then
      raise exception 'guest_count_exceeds_capacity';
    end if;

    -- conflicto de fechas con cualquier bloqueo existente.
    if exists (
      select 1 from public.availability_blocks b
      where b.property_id = p_property_id
        and b.period && daterange(p_check_in, p_check_out, '[)')
    ) then
      raise exception 'dates_not_available';
    end if;

    v_nights := p_check_out - p_check_in;
    v_price  := v_nights * v_property.price_per_night;
    v_commission := round(
      v_price *
      (select o.commission_percent from public.owners o where o.id = v_property.owner_id) / 100.0,
      2
    );

    insert into public.bookings (
      booking_type, property_id, guest_name, guest_email, guest_phone,
      party_size, check_in, check_out, status, total_amount, commission_amount, notes
    ) values (
      'property', p_property_id, p_guest_name, p_guest_email, p_guest_phone,
      p_party_size, p_check_in, p_check_out, 'pending', v_price, v_commission, p_notes
    )
    returning * into v_booking;

    insert into public.availability_blocks (property_id, start_date, end_date, reason, booking_id)
    values (p_property_id, p_check_in, p_check_out, 'booking', v_booking.id);

  elsif p_booking_type = 'tour' then
    -- -----------------------------------------------------------------------
    -- RESERVA DE TOUR
    -- -----------------------------------------------------------------------
    if p_tour_id is null or p_tour_date is null then
      raise exception 'tour_booking_requires_date';
    end if;
    if p_tour_date < (current_date + 1) then
      raise exception 'tour_date_must_be_future';
    end if;

    select * into v_tour
    from public.tours
    where id = p_tour_id
    for update;

    if not found then
      raise exception 'tour_not_found';
    end if;
    if v_tour.status <> 'active' then
      raise exception 'tour_not_available';
    end if;
    if p_party_size > v_tour.capacity then
      raise exception 'guest_count_exceeds_capacity';
    end if;

    -- TODO(fase 2): contabilizar plazas vendidas por día (capacidad agregada).
    -- Por ahora un tour queda bloqueado completo para la fecha elegida.
    if exists (
      select 1 from public.availability_blocks b
      where b.tour_id = p_tour_id
        and b.period && daterange(p_tour_date, p_tour_date + 1, '[)')
    ) then
      raise exception 'tour_not_available_on_date';
    end if;

    v_price := round(v_tour.price * p_party_size, 2);
    v_commission := round(
      v_price * v_tour.commission_percent / 100.0,
      2
    );

    insert into public.bookings (
      booking_type, tour_id, guest_name, guest_email, guest_phone,
      party_size, tour_date, status, total_amount, commission_amount, notes
    ) values (
      'tour', p_tour_id, p_guest_name, p_guest_email, p_guest_phone,
      p_party_size, p_tour_date, 'pending', v_price, v_commission, p_notes
    )
    returning * into v_booking;

    insert into public.availability_blocks (tour_id, start_date, end_date, reason, booking_id)
    values (p_tour_id, p_tour_date, p_tour_date + 1, 'booking', v_booking.id);

  else
    raise exception 'invalid_booking_type';
  end if;

  insert into public.commissions (booking_id, amount, status)
  values (v_booking.id, v_commission, 'pending');

  return v_booking;
exception
  when others then
    raise;
end;
$$;

-- acceso público al RPC (el formulario de reserva no requiere sesión)
revoke all on function public.create_booking(public.booking_type, uuid, uuid, text, text, text, int, date, date, date, text) from public;
grant execute on function public.create_booking(public.booking_type, uuid, uuid, text, text, text, int, date, date, date, text) to anon, authenticated;