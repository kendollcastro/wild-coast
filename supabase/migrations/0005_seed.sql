-- 0005: seed de desarrollo (datos de ejemplo para Jacó, Costa Rica)

with
  owner_maria as (
    insert into public.owners (name, email, phone, commission_percent)
    values
      ('María Jiménez', 'maria@casaola.example', '+506 8888 1010', 12)
    returning id
  ),
  owner_carlos as (
    insert into public.owners (name, email, phone, commission_percent)
    values
      ('Carlos Vega', 'carlos@selvamar.example', '+506 8888 2020', 10)
    returning id
  ),
  props as (
    insert into public.properties (
      slug, name, description, location_label, lat, lng,
      capacity, bedrooms, bathrooms, price_per_night, owner_id, featured
    ) values
      (
        'casa-ola',
        'Casa Ola',
        'Casa frente a la playa con deck de madera, hamacas y cocina abierta al sonido del mar. A dos cuadras del centro de Jacó y a veinte pasos de la arena.',
        'A 300 m de la playa · Centro de Jacó',
        9.9162, -84.7208,
        6, 3, 2.5, 140.00, (select id from owner_maria), true
      ),
      (
        'paraiso-herradura',
        'Paraíso Herradura',
        'Casa vacacional con piscina privada, jardín tropical y atardeceres directos a la bahía. Marina de Los Sueños a cinco minutos.',
        'Bahía de Herradura · Puntarenas',
        9.9616, -84.8364,
        8, 4, 3.0, 210.00, (select id from owner_carlos), true
      ),
      (
        'selva-mar',
        'Selva Mar',
        'Casa de bungalows rodeada de manglar y morros verdes, a pie de la playa de Playa Hermosa. Ideal para familias que buscan quietud.',
        'Playa Hermosa · Jacó',
        9.8650, -84.7210,
        4, 2, 1.5, 95.00, (select id from owner_carlos), false
      )
    returning id, slug
  ),
  tours as (
    insert into public.tours (
      slug, name, description, duration_hours, price, capacity, provider,
      commission_percent, category, featured
    ) values
      (
        'surf-lessons-jaco',
        'Clases de Surf en Jacó',
        'Clase de surf de 2 horas en la playa principal de Jacó con instructor local certificado. Tabla y transporte incluidos. Indicado para principiantes y nivel intermedio.',
        2.0, 45.00, 6, 'Vamos Jacó', 10, 'aventura', true
      ),
      (
        'cataratas-fortuna',
        'Día de Cataratas y Río',
        'Caminata semiplena que termina en pozas naturales y una catarata de 18 metros. Guía local, frutas tropicales y transporte desde tu casa.',
        6.0, 95.00, 12, 'Vamos Jacó', 10, 'naturaleza', true
      ),
      (
        'kayak-manglar',
        'Kayak por los Manglares',
        'Remada tranquila al amanecer por los canales de manglar del golfo de Nicoya. Guía bilingüe, desayuno incluido y mucha vida silvestre.',
        3.0, 65.00, 8, 'Vamos Jacó', 10, 'naturaleza', false
      ),
      (
        'catamaran-sunset',
        'Catamarán Atardecer en la Bahía',
        'Navegada de 3 horas por la bahía de Herradura con bebidas tropicales, snorkel y la mejor visual del atardecer del Pacífico.',
        3.0, 89.00, 40, 'Vamos Jacó', 10, 'atardecer', true
      )
    returning id, slug
  )
insert into public.availability_blocks
  (property_id, start_date, end_date, reason)
select
  (select id from props where slug = 'casa-ola'),
  (current_date + 3), (current_date + 5),
  'blocked'::availability_kind
union all
select
  (select id from props where slug = 'paraiso-herradura'),
  (current_date + 10), (current_date + 14),
  'owner'::availability_kind;