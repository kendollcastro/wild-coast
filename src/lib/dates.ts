const DAY_MS = 86_400_000;

/** Valida y separa una fecha ISO yyyy-mm-dd en [año, mes, día]. */
function ymd(iso: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`fecha ISO inválida: ${iso}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Fecha de hoy en el calendario LOCAL (no UTC). `toISOString` usa UTC y corre
 * las fechas ±1 día según la zona horaria del visitante (Costa Rica es UTC−6).
 */
export function localDateISO(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Diferencia en días entre dos fechas ISO (b - a). b se asume >= a. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(`${checkIn}T12:00:00`).getTime();
  const b = new Date(`${checkOut}T12:00:00`).getTime();
  return Math.round((b - a) / DAY_MS);
}

/** Suma n días a una fecha ISO usando aritmética de calendario (sin UTC). */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = ymd(iso);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Comparación de fechas ISO (alfabético = cronológico). */
export function compareDates(a: string, b: string): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** yyyy-mm (de una fecha ISO) → suma de meses para armar el grid. */
export function monthKeyOf(iso: string): string {
  return iso.slice(0, 7);
}

import type { Locale } from "@/i18n/config";

export const WEEKDAY_LABELS = ["lu", "ma", "mi", "ju", "vi", "sá", "do"] as const;

export const WEEKDAY_LABELS_EN = ["mo", "tu", "we", "th", "fr", "sa", "su"] as const;

export const weekdayLabels = (locale: Locale): readonly string[] =>
  locale === "en" ? WEEKDAY_LABELS_EN : WEEKDAY_LABELS;

/** Retorna los días visibles de un mes (grid con lunes al inicio) y el offset de blanks. */
export function monthGrid(year: number, monthIndex: number): { blanks: number; days: number } {
  const firstWeekday = new Date(year, monthIndex, 1).getDay(); // 0 = domingo
  const blanks = (firstWeekday + 6) % 7; // convertir a lunes=0
  const days = new Date(year, monthIndex + 1, 0).getDate();
  return { blanks, days };
}

export function monthLabel(year: number, monthIndex: number, locale: Locale = "es"): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}