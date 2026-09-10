# Auditoría SEO Técnica — jacó · casas de alquiler y tours

**Fecha:** 9 de septiembre de 2026  
**Entorno:** Next.js 16.3.4 (App Router) · dev server `localhost:3000`  
**Idiomas:** español (default, sin prefijo) · inglés (`/en`)  
**Contenido indexable:** 3 propiedades reales + 3 demo · 17 tours

---

## Resumen Ejecutivo

| Severidad | Cantidad |
|-----------|----------|
| Crítica    | 4        |
| Alta       | 5        |
| Media      | 6        |
| Baja       | 3        |
| **Total**  | **18**   |

El sitio tiene una base técnica sólida (App Router, SG con `generateStaticParams`, imágenes optimizadas con `next/image`, headers de seguridad correctos) pero falla en los pilares fundamentales de SEO internacional y on-page: **no existen tags `<link rel="canonical">`, ni hreflang, ni JSON-LD, y los Open Graph están hardcodeados en el root layout con valores genéricos para todas las páginas**.

---

## A. Indexabilidad y Crawlabilidad

### A1. Sitemap.xml

| Aspecto | Estado | Evidencia |
|---------|--------|-----------|
| Archivo existe | ✅ | `GET /sitemap.xml → 200` |
| URLs incluidas | ✅ | 52 URLs (6 casas + 17 tours × 2 idiomas + listados + home) |
| Base URL | ❌ | `http://localhost:3000/` — entorno de desarrollo, no producción |
| Sin prefijo de idioma | ⚠️ | `/sitemap.xml` genera URLs como `http://localhost:3000/casas/villa-esperanza` (sin `/es/` ni `/en/`) — coherente con el proxy que redirige 307, pero confuso |
| `<lastmod>` | ❌ | No presente en ninguna URL |
| `<changefreq>` | ⚠️ | Presente pero igual en todas las URLs (`weekly`) |
| `<priority>` | ❌ | No usado |

**Archivo:** `src/app/sitemap.ts`  
**Evidencia:**
```
http://localhost:3000/sitemap.xml → 200
Total URLs: 52
URLs con lastmod: 0
URLs con changefreq: 52
Primera URL: http://localhost:3000/
```

### A2. Robots.txt

| Aspecto | Estado | Evidencia |
|---------|--------|-----------|
| Archivo existe | ✅ | `GET /robots.txt → 200` |
| Permite `/` | ✅ | `Allow: /` |
| Bloquea `/admin` | ✅ | `Disallow: /admin` |
| Bloquea `/login` | ✅ | `Disallow: /login` |
| Bloquea `/reservar` | ❌ | No existe la regla — `/reservar` devuelve 404 pero debería bloquearse por si se crea |

**Evidencia:**
```
curl -s http://localhost:3000/robots.txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
```

### A3. Páginas no indexables

| Página | Estado robots | Evidencia |
|--------|--------------|-----------|
| `/reservar` | 404 + `noindex` | Next.js error page agrega `<meta name="robots" content="noindex"/>`, pero el root layout agrega `<meta name="robots" content="index, follow"/>` → **conflicto** (2 tags robots) |
| `/es/admin` | 404 + `noindex` | Mismo conflicto |
| `/es/login` | 404 + `noindex` | Mismo conflicto |
| 404 genérico | `noindex` + `index, follow` | `<h1>No encontramos eso` — correcto, pero conflicto de robots |

**Problema:** Páginas 404 tienen **dos tags `<meta name="robots">`**: uno del error page (`noindex`) y otro del root layout (`index, follow`). Google prioriza el más restrictivo (`noindex`), pero es un conflicto que confunde crawlers.

### A4. HTTP Status Codes

| URL | Status | Correcto |
|-----|--------|----------|
| `/es` | 200 | ✅ |
| `/en` | 200 | ✅ |
| `/es/casas` | 200 | ✅ |
| `/es/tours` | 200 | ✅ |
| `/es/casas/villa-esperanza` | 200 | ✅ |
| `/es/tours/jaco-atv-adventure` | 200 | ✅ |
| `/reservar` | 404 | ⚠️ Sin página dedicada |
| `/sitemap.xml` | 200 | ✅ |
| `/robots.txt` | 200 | ✅ |

### A5. Cache-Control

| Header | Valor | Problema |
|--------|-------|----------|
| `Cache-Control` | `no-cache, must-revalidate` | ❌ **Sin cache en HTML** — cada visita genera una petición completa al servidor, impacta TTFB y costos de servidor |

---

## B. On-Page SEO y Metadatos

### B1. Tags `<title>`

| Página | Title actual | Problemas |
|--------|-------------|-----------|
| Home `/es` | `casas de alquiler y tours en jacó · jacó` | ⚠️ "jacó" repetido (sitio + ciudad) |
| Home `/en` | `vacation rentals and tours in jacó · jacó` | ⚠️ "jacó" repetido |
| Casas list `/es` | `casas de alquiler en jacó · jacó` | ⚠️ "jacó" repetido |
| Casas list `/en` | `vacation rentals in jacó · jacó` | ⚠️ "jacó" repetido |
| Tours list `/es` | `tours en jacó · jacó` | ⚠️ "jacó" repetido |
| Tours list `/en` | `tours in jacó · jacó` | ⚠️ "jacó" repetido |
| Villa Esperanza `/es` | `Villa Esperanza · casa en jacó · jacó` | ⚠️ "jacó" repetido 2 veces |
| Villa Esperanza `/en` | `Villa Esperanza · home in jacó · jacó` | ⚠️ "jacó" repetido 2 veces |
| ATV tour `/es` | `Aventura en Cuadra (ATV) por Jacó · tour en jacó · jacó` | ⚠️ "jacó" repetido 2 veces + título muy largo |
| ATV tour `/en` | `Jaco ATV Off-Road Adventure · tour in jacó · jacó` | ⚠️ "jacó" repetido 2 veces |

**Patrón:** Todos los titles terminan en `· jacó` (el site name), y muchos incluyen "jacó" también en la descripción → duplicación.

**Fuente:** `src/i18n/dictionaries/es.ts` y `en.ts` → función `buildTitle()`

### B2. Meta Descriptions

| Página | Longitud | Problema |
|--------|----------|----------|
| Home `/es` | 93 chars | ✅ Correcta |
| Home `/en` | 79 chars | ✅ Correcta |
| Casas list `/es` | 85 chars | ✅ Correcta |
| Tours list `/es` | 89 chars | ✅ Correcta |
| Villa Esperanza `/es` | 280 chars | ❌ **Demasiado larga** (máx recomendado: 155-160) |
| Villa Esperanza `/en` | 280 chars | ❌ **Demasiado larga** + contiene `"undefined"` como nombre de propiedad |
| ATV tour `/es` | ~1,500 chars | ❌ **Extremadamente larga** — el contenido del body se vierte en la description |
| ATV tour `/en` | ~1,200 chars | ❌ **Extremadamente larga** |

**Bug crítico (inglés):** La meta description de propiedades en inglés contiene `"undefined in Playa Hermosa, Jacó, Costa Rica..."` — el nombre de la propiedad (`Villa Esperanza`) se pierde al traducir, resultando en `undefined`.

**Evidencia:**
```
DESC: undefined in Playa Hermosa, Jacó, Costa Rica. A 3-bedroom, 3.5-bath home
with Completamente equipada, Piscina, BBQ. In the yard you'll often spot monkeys...
```

### B3. Open Graph y Twitter Cards

| Tag | Valor actual (todas las páginas) | Problema |
|-----|--------------------------------|----------|
| `og:title` | `jacó · casas de alquiler y tours` | ❌ **Hardcoded** — mismo valor en home, casas, tours, detalles |
| `og:description` | `Casas de alquiler y tours en Jacó, Costa Rica. Reservá directo con anfitriones locales.` | ❌ **Hardcoded** — mismo valor genérico siempre |
| `og:url` | `http://localhost:3000` | ❌ **Hardcoded** — localhost, sin prefijo de idioma |
| `og:image` | `https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200&q=80` | ❌ **Hardcoded** — misma imagen genérica para todo el sitio |
| `og:site_name` | `jacó` | ✅ Correcto |
| `og:locale` (es) | `es_CR` | ✅ Correcto |
| `og:locale` (en) | `es_CR` | ❌ **Debería ser `en_US`** |
| `og:type` | `website` | ⚠️ Debería ser `article` o `product` en páginas de detalle |
| `twitter:card` | `summary_large_image` | ✅ Correcto |
| `twitter:title` | `jacó · casas de alquiler y tours` | ❌ **Hardcoded** |
| `twitter:description` | `Casas de alquiler y tours en Jacó...` | ❌ **Hardcoded** |
| `twitter:image` | Mismo que og:image | ❌ **Hardcoded** |

**Archivo:** `src/app/layout.tsx` — los OG tags están en el `metadata` del root layout y no se sobreescriben en las páginas hijas.

**Evidencia verificada en `/en/casas`:**
```
og:locale: es_CR  (debería ser en_US)
og:description: Casas de alquiler y tours en Jacó, Costa Rica...
```

### B4. Canonical Tags

| Página | `<link rel="canonical">` | Problema |
|--------|--------------------------|----------|
| Home `/es` | ❌ Ausente | No hay canonical en ninguna página |
| Home `/en` | ❌ Ausente | |
| Casas list | ❌ Ausente | |
| Tours list | ❌ Ausente | |
| Villa Esperanza | ❌ Ausente | |
| ATV tour | ❌ Ausente | |

**Impacto:** Sin canonical, Google puede indexar múltiples variaciones de la misma URL (`/es/casas/villa-esperanza`, `/casas/villa-esperanza` vía redirect, parámetros de tracking, etc.) diluyendo la autoridad.

### B5. Hreflang (SEO Internacional)

| Página | `<link rel="alternate" hreflang="...">` | Problema |
|--------|----------------------------------------|----------|
| Todas | ❌ Ausente | No existe ningún hreflang en todo el sitio |

**Impacto crítico:** Google no puede determinar la relación entre las versiones español e inglés. Puede:
- Mostrar la versión incorrecta en resultados de búsqueda
- Indexar ambas versiones como contenido duplicado
- No mostrar la bandera de idioma correcta en SERPs

**Evidencia:** Verificación con curl en `/es` y `/en` — ningún `<link rel="alternate">` en el HTML.

### B6. JSON-LD (Structured Data)

| Página | JSON-LD | Problema |
|--------|---------|----------|
| Home | ❌ Ausente | Falta `WebSite` + `Organization` |
| Casas list | ❌ Ausente | Falta `ItemList` |
| Tours list | ❌ Ausente | Falta `ItemList` |
| Villa Esperanza | ❌ Ausente | Falta `Product` o `LodgingBusiness` con precio, disponibilidad |
| ATV tour | ❌ Ausente | Falta `Product` o `TouristTrip` con precio, duración |

**Impacto:** Sin JSON-LD, el sitio no califica para rich snippets (carruseles de precios, FAQs, estrellas de valoración, etc.) en Google.

---

## C. SEO Internacional

### C1. Estructura de URLs

| Aspecto | Estado | Evidencia |
|---------|--------|-----------|
| Español (default) | ✅ Sin prefijo | `/`, `/casas`, `/tours` |
| Inglés | ✅ Con prefijo `/en` | `/en`, `/en/casas`, `/en/tours` |
| Proxy de redirección | ✅ | `src/proxy.ts` — 307 redirect de `/casas` → `/es/casas` |
| Detección de idioma | ✅ | Cookie + Accept-Language header |

### C2. Contenido traducido

| Elemento | Estado | Evidencia |
|----------|--------|-----------|
| Títulos de página | ✅ | Diccionarios `es.ts` y `en.ts` tienen traducciones |
| Meta descriptions (home/listados) | ✅ | Traducidas correctamente |
| Meta descriptions (detalles) | ❌ | Amenidades no traducidas: "Completamente equipada", "Piscina" aparecen en inglés |
| Nombres de propiedades | ⚠️ | "Villa Esperanza" se mantiene en español en inglés (correcto, es nombre propio) |
| Nombres de tours | ⚠️ | "Aventura en Cuadra (ATV) por Jacó" se traduce a "Jaco ATV Off-Road Adventure" (aceptable) |
| Navegación | ✅ | "Casas", "Tours", "Contacto" traducidos |
| Contenido body | ✅ | Hero, secciones, CTAs traducidos |

### C3. Hreflang Implementation

| Requisito | Estado |
|-----------|--------|
| `<link rel="alternate" hreflang="es" href="...">` | ❌ Ausente |
| `<link rel="alternate" hreflang="en" href="...">` | ❌ Ausente |
| `<link rel="alternate" hreflang="x-default" href="...">` | ❌ Ausente |
| Bidireccional (es → en y en → es) | ❌ Ausente |

### C4. OG Locale por idioma

| Idioma | `og:locale` actual | Correcto |
|--------|-------------------|----------|
| Español | `es_CR` | ✅ |
| Inglés | `es_CR` | ❌ Debería ser `en_US` |

---

## D. Rendimiento Técnico

### D1. Imágenes

| Aspecto | Estado | Evidencia |
|---------|--------|-----------|
| Formato | ✅ | WebP/AVIF via `next/image` |
| Lazy loading | ✅ | `loading="lazy"` en imágenes below-the-fold |
| Eager loading (hero) | ✅ | Hero image sin `loading="lazy"` |
| Alt texts (home) | ✅ | 30 imágenes, 0 sin alt, 0 con alt vacío |
| Alt texts (detalles) | ✅ | 5 imágenes, todas con alt |
| Responsive srcset | ✅ | `imageSrcSet` con 8 tamaños (640w a 3840w) |
| Preload hero | ✅ | `<link rel="preload" as="image">` para hero |

**Evidencia:**
```
Home: Total images: 30, No alt: 0, Empty alt: 0
Detalle: Total images: 5, No alt: 0, Empty alt: 0
```

### D2. Fonts

| Aspecto | Estado | Evidencia |
|---------|--------|-----------|
| Preload | ✅ | 4 fuentes woff2 preload via HTTP Link header |
| Formato | ✅ | woff2 |
| CORS | ✅ | `crossorigin=""` |

### D3. Headers de Seguridad

| Header | Valor | Estado |
|--------|-------|--------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `X-Frame-Options` | `DENY` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ |
| `X-DNS-Prefetch-Control` | `on` | ✅ |

### D4. Cache

| Recurso | `Cache-Control` | Problema |
|---------|-----------------|----------|
| HTML | `no-cache, must-revalidate` | ❌ Sin cache — cada visita es una petición completa |
| `_next/static/*` | (no verificado) | Next.js agrega cache headers automáticos a assets estáticos |

### D5. Preconnect / DNS-Prefetch

| Recurso externo | Preconnect | Problema |
|-----------------|------------|----------|
| `images.unsplash.com` | ❌ | No hay `<link rel="preconnect">` — impacta LCP |

---

## E. Accesibilidad y SEO

### E1. Heading Hierarchy

| Página | H1 | H2s | Estado |
|--------|-----|-----|--------|
| Home `/es` | `Dormí al ritmo del mar de Jacó` | 10 H2s | ✅ Un H1, jerarquía coherente |
| Home `/en` | `Sleep to the rhythm of the Jacó sea` | — | ✅ |
| Casas list | `Casas en Jacó` | — | ✅ |
| Tours list | `Tours en Jacó` | — | ✅ |
| Villa Esperanza | `Villa Esperanza` | — | ✅ |
| ATV tour | `Aventura en Cuadra (ATV) por Jacó` | — | ✅ |
| 404 | `No encontramos eso` | — | ✅ |

### E2. Navegación

| Aspecto | Estado | Evidencia |
|---------|--------|-----------|
| `<nav>` elements | ✅ | 3 elementos nav |
| `aria-label` en navs | ✅ | "Principal", "Explorar", "Contacto" |
| Botón hamburger | ✅ | `aria-label="Abrir menú"` |
| Selector de idioma | ✅ | `aria-label="Cambiar idioma: English"` |
| Enlace admin | ✅ | `aria-label="Acceso admin"` |
| Botones favoritos | ✅ | `aria-label="Guardar en favoritos"` |
| Rating stars | ✅ | `aria-label="5 de 5 estrellas"` |

### E3. Viewport

| Aspecto | Estado |
|---------|--------|
| `<meta name="viewport">` | ✅ `width=device-width, initial-scale=1` |
| `user-scalable` | ✅ No restringido (permite zoom) |

---

## Checklist Consolidado

### A. Indexabilidad y Crawlabilidad

- [x] `sitemap.xml` existe y es accesible (`GET /sitemap.xml → 200`)
- [x] `robots.txt` existe, permite `/`, bloquea `/admin` y `/login`
- [x] HTTP status codes correctos (200 en páginas públicas, 404 en inexistentes)
- [x] Headers de seguridad completos (HSTS, X-Frame-Options, nosniff, etc.)
- [x] Imágenes optimizadas con next/image (WebP, responsive, lazy loading)
- [x] Fonts preload con woff2
- [ ] **`sitemap.xml` usa `http://localhost:3000`** — necesita dominio de producción
- [ ] **`sitemap.xml` no tiene `<lastmod>`** — ayuda a crawlers a priorizar re-crawls
- [ ] **`robots.txt` no bloquea `/reservar`** — página 404 sin protección
- [ ] **`Cache-Control: no-cache` en HTML** — sin cache genera peticiones innecesarias
- [ ] **Páginas 404 tienen conflicto de `<meta name="robots">`** (noindex + index, follow)

### B. On-Page SEO y Metadatos

- [x] `<title>` presente en todas las páginas verificadas
- [x] `<meta name="description">` presente en home, listados y detalles
- [x] `<meta name="viewport">` correcto
- [x] Alt texts en todas las imágenes (30+ verificadas, 0 vacías)
- [x] H1 único por página, jerarquía coherente
- [x] Navegación con `aria-label` correctos
- [ ] **Todos los `<title>` terminan en `· jacó`** — duplicación de "jacó" en título + site name
- [ ] **Meta descriptions de detalles son extremadamente largas** (>1,000 chars en tours, ~280 en propiedades)
- [ ] **Bug: meta description en inglés contiene `"undefined"`** — nombre de propiedad no se traduce
- [ ] **Amenidades no traducidas** en meta descriptions: "Completamente equipada", "Piscina" en inglés
- [ ] **OG tags hardcoded en root layout** — mismo og:title, og:description, og:url, og:image en TODAS las páginas
- [ ] **`og:url` apunta a `http://localhost:3000`** — localhost, sin prefijo de idioma
- [ ] **`og:locale` en páginas inglés es `es_CR`** — debería ser `en_US`
- [ ] **`og:image` es la misma imagen genérica** en todas las páginas (incluyendo detalles de propiedades/tours)
- [ ] **`og:type` es siempre `website`** — debería ser `article` o `product` en detalles

### C. SEO Internacional

- [x] URLs con estructura coherente (`/es` default, `/en` prefijado)
- [x] Proxy redirige correctamente con 307
- [x] Detección de idioma por cookie + Accept-Language
- [x] Contenido traducido en diccionarios
- [ ] **No existen tags `<link rel="canonical">`** en ninguna página
- [ ] **No existen tags hreflang** (`<link rel="alternate" hreflang="...">`) en ninguna página
- [ ] **No existe `hreflang="x-default"`** para indicar la versión por defecto
- [ ] **`og:locale` no se adapta al idioma** — siempre `es_CR` incluso en inglés

### D. Rendimiento Técnico

- [x] Imágenes con formato moderno (WebP/AVIF)
- [x] Lazy loading en imágenes below-the-fold
- [x] Hero image con preload
- [x] Responsive images con srcset (8 tamaños)
- [x] Fonts preload (4 fuentes woff2)
- [x] Headers de seguridad completos
- [ ] **Sin `<link rel="preconnect">` para `images.unsplash.com`** — impacta LCP
- [ ] **`Cache-Control: no-cache` en HTML** — debería usar stale-while-revalidate
- [ ] **Sin `<meta name="theme-color">`** — afecta experiencia en móviles/PWA

### E. Accesibilidad y SEO

- [x] `<nav>` con `aria-label` descriptivos (3 navs: "Principal", "Explorar", "Contacto")
- [x] H1 único por página
- [x] H2s coherentes en home
- [x] Alt texts en todas las imágenes
- [x] Botones con aria-label
- [x] Viewport permite zoom
- [ ] **JSON-LD ausente** — no califica para rich snippets (WebSite, Product, TouristTrip)
- [ ] **Sin `<meta name="theme-color">`** — afecta barra de dirección en móviles

---

## Priorización de Soluciones

### Tier 1 — Inmediato (Impacto alto, esfuerzo bajo-medio)

1. **Agregar `<link rel="canonical">` a todas las páginas**
   - `src/app/(site)/[locale]/page.tsx` → `metadata.alternates.canonical`
   - `src/app/(site)/[locale]/casas/[slug]/page.tsx` → lo mismo
   - `src/app/(site)/[locale]/tours/[slug]/page.tsx` → lo mismo
   - `src/app/(site)/[locale]/casas/(list)/page.tsx` → lo mismo
   - `src/app/(site)/[locale]/tours/(list)/page.tsx` → lo mismo

2. **Agregar hreflang bidireccional a todas las páginas**
   - En cada `generateMetadata`, agregar `alternates.languages`:
     ```ts
     alternates: {
       canonical: `${SITE_URL}/${locale}/casas/${slug}`,
       languages: {
         es: `${SITE_URL}/casas/${slug}`,
         en: `${SITE_URL}/en/casas/${slug}`,
         'x-default': `${SITE_URL}/casas/${slug}`,
       },
     }
     ```

3. **Corregir `og:locale` en páginas inglés**
   - En `(site)/layout.tsx` o en cada `generateMetadata`:
     ```ts
     openGraph: {
       locale: locale === 'es' ? 'es_CR' : 'en_US',
     }
     ```

4. **Hacer OG tags dinámicos** (no hardcoded en root layout)
   - Mover los OG específicos de cada página a `generateMetadata()` en cada page component
   - Root layout solo debe tener los defaults mínimos

5. **Corregir bug `"undefined"` en meta description de propiedades en inglés**
   - `src/app/(site)/[locale]/casas/[slug]/page.tsx` → `generateMetadata()` → verificar que `property.name` existe en el diccionario inglés

### Tier 2 — Corto plazo (Impacto alto, esfuerzo medio)

6. **Limitar meta descriptions a 155-160 caracteres**
   - Propiedades: truncar a los primeros 155 chars o crear描述especificas en diccionario
   - Tours: crear descripciones cortas en diccionario (no verter el body)

7. **Corregir duplicación de "jacó" en titles**
   - Cambiar patrón de `buildTitle()` para no repetir el nombre del sitio cuando ya está en el título
   - Ejemplo: `"Villa Esperanza · casas en jacó"` (sin el `· jacó` final)

8. **Traducir amenidades** en meta descriptions de propiedades
   - Crear mapa de traducción de amenities en diccionarios:
     ```ts
     amenities: {
       'Completamente equipada': 'Fully equipped',
       'Piscina': 'Pool',
       'BBQ': 'BBQ',
     }
     ```

9. **Actualizar `sitemap.xml` con dominio de producción**
   - Cambiar `NEXT_PUBLIC_SITE_URL` en `.env.production` al dominio real
   - Agregar `<lastmod>` con la fecha de última modificación de cada recurso

10. **Agregar JSON-LD estructurado**
    - Home: `WebSite` + `Organization`
    - Casas list: `ItemList` con `Product` anidados
    - Detalle propiedad: `LodgingBusiness` o `Product` con precio, capacidad, amenities
    - Detalle tour: `TouristTrip` o `Product` con precio, duración, incluye

### Tier 3 — Mediano plazo (Impacto medio, esfuerzo medio-alto)

11. **Bloquear `/reservar` en robots.txt**
    - Agregar `Disallow: /reservar`

12. **Agregar `<link rel="preconnect" href="https://images.unsplash.com">`**
    - En `src/app/layout.tsx` o en el componente que carga la hero image

13. **Mejorar Cache-Control del HTML**
    - Cambiar de `no-cache, must-revalidate` a `public, s-maxage=60, stale-while-revalidate=300`

14. **Agregar `<meta name="theme-color">`**
    - En root layout metadata:
      ```ts
      other: {
        'theme-color': '#your-brand-color',
      }
      ```

15. **Crear página dedicada para `/reservar`** (o redirigir a homepage con mensaje claro)

16. **Resolver conflicto de `<meta name="robots">` en páginas 404**
    - El root layout no debería agregar `index, follow` si la página es 404
    - Usar conditional metadata o remove el tag del root layout

17. **Hacer `og:type` dinámico**
    - Home/listados: `website`
    - Detalles: `article` o `product`

---

## Top 5 Soluciones Críticas (Resumen)

| # | Problema | Solución | Archivos |
|---|----------|----------|----------|
| 1 | **Sin canonical ni hreflang** | Agregar `metadata.alternates` con `canonical` + `languages` en cada `generateMetadata()` | Todas las pages con `generateMetadata` |
| 2 | **OG tags hardcoded** | Mover a `generateMetadata()` en cada page; root layout solo defaults | `src/app/layout.tsx` + todas las pages |
| 3 | **`og:locale` = `es_CR` en inglés** | Condicional por locale en `generateMetadata()` | `src/app/(site)/layout.tsx` o cada page |
| 4 | **Meta descriptions >1,000 chars** | Crear descripciones cortas en diccionarios; no verter body | `src/i18n/dictionaries/es.ts`, `en.ts` |
| 5 | **Bug `"undefined"` en inglés** | Verificar traducción de `property.name` en generateMetadata | `src/app/(site)/[locale]/casas/[slug]/page.tsx` |

---

*Auditoría generada el 9 de septiembre de 2026. Basada en análisis de código fuente y HTML rendered del dev server.*
