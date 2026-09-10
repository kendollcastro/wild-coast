import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, type Locale } from "@/i18n/config";

// Nombre de cookie de sesión de @supabase/ssr: sb-<project-ref>-auth-token.
const projectRef = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname.split(".")[0];
  } catch {
    return "";
  }
})();

const AUTH_COOKIE = projectRef ? `sb-${projectRef}-auth-token` : "";

const LOCALE_COOKIE = "NEXT_LOCALE";
const LOCALE_HEADER = "x-locale";

const isLocale = (value: string | undefined | null): value is Locale =>
  locales.includes(value as Locale);

function pickLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;

  const accept = request.headers.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase() ?? "";
    if (tag === "en" || tag.startsWith("en-")) return "en";
    if (tag === "es" || tag.startsWith("es-")) return "es";
  }
  return "es";
}

// Rutas públicas del catálogo: solo estas se prefixan con locale.
const isCatalogPath = (pathname: string) =>
  pathname === "/" || pathname.startsWith("/tours") || pathname.startsWith("/casas");

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
};

// CSP base solo en producción (en dev, HMR de Next necesita evaluar scripts).
// script-src incluye 'unsafe-inline' porque Next inyecta el payload de Flight
// como script inline; combinado con frame-ancestors 'none' y nosniff baja el
// riesgo de XSS/clickjacking sin romper la app. Revisar al integrar analytics.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

// Cache de CDN para redirects canónicos (catalog 307): pequeños y seguros de cachear.
const REDIRECT_CACHE = "public, s-maxage=300";

function applyHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Content-Security-Policy", CSP);
  }
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Primer filtro para /admin/*: sin cookie de sesión se manda a /login.
  // El chequeo real de admin sigue en admin/layout.tsx (DB + RLS).
  if (pathname.startsWith("/admin") && AUTH_COOKIE && !request.cookies.get(AUTH_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return applyHeaders(NextResponse.redirect(url));
  }

  const pathHasLocale = locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`),
  );

  if (pathHasLocale) {
    const seg = pathname.split("/")[1];
    const locale = isLocale(seg) ? seg : "es";
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, locale);
    return applyHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // Rutas del catálogo sin prefijo: detectar idioma y redirigir a /<locale>/<ruta>.
  if (isCatalogPath(pathname)) {
    const locale = pickLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    response.headers.set("Cache-Control", REDIRECT_CACHE);
    return applyHeaders(response);
  }

  // Resto (reservar, login, static interno, etc.): locale desde cookie, default es.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, isLocale(cookieLocale) ? cookieLocale : "es");
  return applyHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};