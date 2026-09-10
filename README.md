# Wild Coast

Marketplace de casas y tours en Jacó (Costa Rica). Next.js + Supabase.

## Stack

- **Next.js 16** (App Router, Turbopack, middleware en `src/proxy.ts`)
- **Supabase** (PostgreSQL, Auth, storage) — migraciones en `supabase/migrations/`
- **shadcn/ui** sobre Radix UI + Tailwind v4
- i18n con diccionarios en `src/i18n/` (es/en) y URLs con/sin prefijo por ruta

## Rutas

| Ruta | Descripción |
| --- | --- |
| `/` | Home (catálogo de casas y tours) |
| `/tours/*`, `/casas/*` | Catálogo público |
| `/reservar/*` | Booking (sin tarjeta, confirmación por WhatsApp) |
| `/login` | Acceso al panel |
| `/admin` | Panel de administración (Resumen, Reservas, Comisiones, Casas, Tours, Disponibilidad, Reportes) |

## Local

```bash
npm install
cp .env.local.example .env.local   # si existe plantilla; cargar las reales de Supabase
npm run dev
```

Requiere variables de entorno de Supabase (URL, anon key y service_role).

## Base de datos

Aplicar migraciones:

```bash
npx supabase db push --include-all
```

Los tipos tipados están en `src/server/db/schema.types.ts` (regenerables con `npx supabase gen types typescript`).