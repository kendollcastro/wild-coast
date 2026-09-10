import type { Locale } from "./config";
import { isLocale } from "./config";

/** Prefija un href interno con el locale (excepto reservar/admin/login). */
export function localizedHref(href: string, locale: Locale): string {
  if (href.startsWith(`/${locale}`) || href === `/${locale}`) return href;
  if (
    href.startsWith("/reservar") ||
    href.startsWith("/admin") ||
    href.startsWith("/login") ||
    href.startsWith("mailto:") ||
    href.startsWith("http") ||
    href.startsWith("#")
  ) {
    return href;
  }
  if (!href.startsWith("/")) return href;
  return `/${locale}${href}`;
}

/** Del pathname actual, reemplaza el prefijo de locale (si existe) por el destino. */
export function switchLocalePathname(pathname: string, target: Locale): string {
  const segs = pathname.split("/");
  const first = segs[1] ?? "";
  if (isLocale(first)) {
    segs[1] = target;
    return segs.join("/") || `/${target}`;
  }
  return `/${target}${pathname}`;
}