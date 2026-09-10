import { localDateISO } from "@/lib/dates";
import type { Locale } from "@/i18n/config";

const usdInt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdDec = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formatea un número como USD sin decimales innecesarios. */
export function formatUSD(value: number): string {
  return (value % 1 === 0 ? usdInt : usdDec).format(value);
}

const dateLocales: Record<Locale, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat("es-CR", { day: "numeric", month: "short", year: "numeric" }),
  en: new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }),
};

const dayLocales: Record<Locale, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat("es-CR", { weekday: "short", day: "numeric", month: "short" }),
  en: new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", month: "short" }),
};

/** Fecha ISO yyyy-mm-dd → "5 dic 2026" (es) / "Dec 5, 2026" (en). */
export function formatDateShort(iso: string, locale: Locale = "es"): string {
  return dateLocales[locale].format(new Date(`${iso}T12:00:00`));
}

/** Fecha ISO yyyy-mm-dd → "vie 5 dic" (es) / "Fri, Dec 5" (en). */
export function formatDayShort(iso: string, locale: Locale = "es"): string {
  return dayLocales[locale].format(new Date(`${iso}T12:00:00`));
}

export function todayISO(): string {
  return localDateISO();
}