import "server-only";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/server/db/server";

/** IP del cliente desde los headers de proxy (Vercel/env). */
async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = (forwarded?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  return ip.slice(0, 64) || "unknown";
}

/**
 * Rate limiting por IP mediante el RPC ratelimit_check (Supabase).
 * Fail-open: si la DB falla, se permite el acceso para no romper el flujo.
 */
export async function rateLimitByIp(
  scope: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const ip = await clientIp();
  const { data, error } = await getSupabaseAdmin().rpc("ratelimit_check", {
    p_key: `${scope}:${ip}`,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) return true;
  return data === true;
}