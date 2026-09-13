import type { Locale } from "@/i18n/config";

export const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

/** URL absoluta de una ruta en un locale (es sin prefijo, en con /en). */
export function urlFor(locale: Locale, path: string): string {
  return locale === "es" ? `${SITE_URL}/${path}` : `${SITE_URL}/${locale}/${path}`;
}

/** canonical + hreflang bidireccional (es, en, x-default → versión es). */
export function alternatesFor(locale: Locale, path: string) {
  const es = urlFor("es", path);
  const en = urlFor("en", path);
  return {
    canonical: urlFor(locale, path),
    languages: { es, en, "x-default": es },
  };
}

export function ogLocale(locale: Locale): string {
  return locale === "en" ? "en_US" : "es_CR";
}

/** Convierte contenido (markdown/body) en una meta description de ≤ max chars. */
export function seoDescription(text: string | null | undefined, max = 155): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}