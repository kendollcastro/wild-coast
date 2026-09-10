/** Normaliza un valor de searchParams a fecha ISO válida o cadena vacía. */
export function sanitizeDate(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return value;
}

/** Normaliza personas (int entre 1 y max, default por defecto). */
export function sanitizeGuests(
  value: string | string[] | undefined,
  max: number,
  fallback = 1,
): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, 1), Math.max(max, 1));
}