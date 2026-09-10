import type { LocalizedProperty, LocalizedTour } from "@/server/domain/catalog/localize";
import type { Locale } from "@/i18n/config";
import { SITE_URL, urlFor } from "@/lib/seo";

type JsonLdObject = Record<string, unknown>;

export function websiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "jacó",
    alternateName: "Jacó Vacation Rentals",
    url: SITE_URL,
    inLanguage: ["es", "en"],
    publisher: organizationSchema(),
  };
}

export function organizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "jacó",
    url: SITE_URL,
  };
}

/** ItemList para listados (casas y tours). itemType: "Product" o "LodgingBusiness". */
export function itemListSchema(
  items: Array<{ name: string; url: string }>,
  itemType = "Product",
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
      item: { "@type": itemType, name: item.name, url: item.url },
    })),
  };
}

function absImage(cover: string | undefined): string | undefined {
  if (!cover) return undefined;
  return cover.startsWith("http") ? cover : `${SITE_URL}${cover}`;
}

function offerSchema(price: number, currency: string, url: string): JsonLdObject {
  return {
    "@type": "Offer",
    price,
    priceCurrency: currency,
    availability: "https://schema.org/InStock",
    url,
  };
}

/** Product + Offer para una casa de alquiler (detalle). */
export function propertySchema(property: LocalizedProperty, locale: Locale): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.name,
    description: property.description ?? undefined,
    image: absImage(property.photos[0]?.url),
    url: urlFor(locale, `casas/${property.slug}`),
    brand: property.brand ?? property.owner?.name ?? undefined,
    additionalProperty: [
      numProperty("Número de habitaciones", property.bedrooms),
      numProperty("Número de baños", property.bathrooms),
      numProperty("Capacidad (personas)", property.capacity),
    ],
    offers: offerSchema(Number(property.price_per_night), property.currency ?? "USD", urlFor(locale, `casas/${property.slug}`)),
  };
}

/** Product + Offer para un tour (detalle). */
export function tourSchema(tour: LocalizedTour, locale: Locale): JsonLdObject {
  const extra: JsonLdObject[] = [];
  if (tour.duration_hours != null) {
    extra.push({ "@type": "PropertyValue", name: "Duración", value: `${tour.duration_hours} h` });
  }
  if (tour.capacity != null) {
    extra.push({ "@type": "PropertyValue", name: "Cupo por salida", value: tour.capacity });
  }
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tour.name,
    description: tour.description ?? undefined,
    image: absImage(tour.photos[0]?.url),
    url: urlFor(locale, `tours/${tour.slug}`),
    provider: { "@type": "Organization", name: tour.provider },
    additionalProperty: extra,
    offers: offerSchema(Number(tour.price), tour.currency ?? "USD", urlFor(locale, `tours/${tour.slug}`)),
  };
}

/** BreadcrumbList para páginas de detalle. */
export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
  locale: Locale,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "jacó", item: urlFor(locale, "") },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        item: urlFor(locale, item.path),
      })),
    ],
  };
}

function numProperty(name: string, value: number | null | undefined): JsonLdObject {
  return { "@type": "PropertyValue", name, value: value ?? 0 };
}