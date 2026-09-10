-- 0006: fotos de ejemplo (Unsplash) para propriedades y tours.
-- Solo para desarrollo; reemplazar por Supabase Storage cuando haya fotos reales.

with
  props as (select id, slug from public.properties),
  tours as (select id, slug from public.tours)
insert into public.property_photos (property_id, url, alt, sort_order)
select
  props.id,
  url,
  alt,
  ord
from props
cross join lateral (
  values
    (1, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'Vista de la arena y el mar'),
    (2, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5', 'Piscina y deck al atardecer'),
    (3, 'https://images.unsplash.com/photo-1519046904884-53103b34b206', 'Fachada tropical de la casa')
) as ph (ord, url, alt)
where props.slug = 'casa-ola'
union all
select
  props.id,
  url,
  alt,
  ord
from props
cross join lateral (
  values
    (1, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d', 'Estanque y vegetación de la bahía'),
    (2, 'https://images.unsplash.com/photo-1519821172144-4f87d85de2a5', 'Jardín tropical'),
    (3, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', 'Interior amplio y luminoso')
) as ph (ord, url, alt)
where props.slug = 'paraiso-herradura'
union all
select
  props.id,
  url,
  alt,
  ord
from props
cross join lateral (
  values
    (1, 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e', 'Manglar y morros verdes'),
    (2, 'https://images.unsplash.com/photo-1505142468610-359e7d316be0', 'Ola y tabla de surf'),
    (3, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', 'Vegetación de selva baja')
) as ph (ord, url, alt)
where props.slug = 'selva-mar';

insert into public.tour_photos (tour_id, url, alt, sort_order)
select
  tours.id,
  url,
  alt,
  ord
from tours
cross join lateral (
  values
    (1, 'https://images.unsplash.com/photo-1505142468610-359e7d316be0', 'Instructor y alumno surfeando'),
    (2, 'https://images.unsplash.com/photo-1598482359551-69defab6f80a', 'Ola de lado y tabla')
) as ph (ord, url, alt)
where tours.slug = 'surf-lessons-jaco'
union all
select
  tours.id,
  url,
  alt,
  ord
from tours
cross join lateral (
  values
    (1, 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735', 'Pozas de agua cristalina'),
    (2, 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d', 'Catarata en la jungla')
) as ph (ord, url, alt)
where tours.slug = 'cataratas-fortuna'
union all
select
  tours.id,
  url,
  alt,
  ord
from tours
cross join lateral (
  values
    (1, 'https://images.unsplash.com/photo-1533105079780-92b9be482077', 'Canal de manglar verde'),
    (2, 'https://images.unsplash.com/photo-1506881287328-619103290674', 'Kayak en aguas planas')
) as ph (ord, url, alt)
where tours.slug = 'kayak-manglar'
union all
select
  tours.id,
  url,
  alt,
  ord
from tours
cross join lateral (
  values
    (1, 'https://images.unsplash.com/photo-1494783367193-149034c05e8f', 'Atardecer naranja sobre el mar'),
    (2, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5', 'Catamarán en la bahía')
) as ph (ord, url, alt)
where tours.slug = 'catamaran-sunset';