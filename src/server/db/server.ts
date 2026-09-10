import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./schema.types";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Copiá .env.example a .env.local`);
  }
  return value;
}

let cached: SupabaseClient<Database> | null = null;

/**
 * Cliente con key service_role. Usado SOLO dentro de Server Actions / Server
 * Components (nunca en el bundle del cliente). Bypassa RLS a propósito: toda
 * autorización se hace en la capa de aplicación.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (cached) return cached;
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  cached = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "jaco-commissions" } },
  });
  return cached;
}