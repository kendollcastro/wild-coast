import type { PropertyWithPhotos, TourWithPhotos, ComboWithPhotos } from "@/server/db/schema.types";
import type { Locale } from "@/i18n/config";

export type LocalizedTour = Omit<TourWithPhotos, "name" | "description"> & {
  name: string;
  description: string | null;
  highlights: string[];
  includes: string[];
};

/** Tour localizado: nombre, descripción e includes con fallback EN → ES → base. */
export function localizeTour(tour: TourWithPhotos, locale: Locale): LocalizedTour {
  const name =
    locale === "en" ? (tour.name_en ?? tour.name_es ?? tour.name) : (tour.name_es ?? tour.name);
  const description =
    locale === "en"
      ? (tour.description_en ?? tour.description_es ?? tour.description)
      : (tour.description_es ?? tour.description);
  const highlights = locale === "en" ? tour.highlights_en : tour.highlights_es;
  const includes = locale === "en" ? tour.includes_en : tour.includes_es;
  return { ...tour, name, description, highlights, includes };
}

export type LocalizedProperty = Omit<
  PropertyWithPhotos,
  "name" | "description" | "location_label" | "amenities"
> & {
  name: string;
  description: string | null;
  location_label: string;
  amenities: string[];
};

/** Casa localizada: nombre, descripción, label de zona y amenities con fallback EN. */
export function localizeProperty(property: PropertyWithPhotos, locale: Locale): LocalizedProperty {
  const name =
    locale === "en" ? (property.name_en ?? property.name_es ?? property.name) : (property.name_es ?? property.name);
  const description =
    locale === "en"
      ? (property.description_en ?? property.description_es ?? property.description)
      : (property.description_es ?? property.description);
  const location_label =
    locale === "en" ? (property.location_label_en ?? property.location_label) : property.location_label;
  const amenities = (locale === "en"
    ? (property.amenities_en?.length ? property.amenities_en : property.amenities)
    : property.amenities) as string[];
  return { ...property, name, description, location_label, amenities };
}

export type LocalizedCombo = Omit<ComboWithPhotos, "name" | "description"> & {
  name: string;
  description: string | null;
};

/** Combo localizado: nombre y descripción con fallback EN → ES → base. */
export function localizeCombo(combo: ComboWithPhotos, locale: Locale): LocalizedCombo {
  const name =
    locale === "en" ? (combo.name_en ?? combo.name_es ?? combo.name) : (combo.name_es ?? combo.name);
  const description =
    locale === "en"
      ? (combo.description_en ?? combo.description_es ?? combo.description)
      : (combo.description_es ?? combo.description);
  return { ...combo, name, description };
}