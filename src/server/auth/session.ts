import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@/server/db/schema.types";
import { getSupabaseAdmin } from "@/server/db/server";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

/** Cliente con cookies: para leer la sesión de Supabase Auth en el servidor. */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // server component: no se pueden setear cookies acá (ok: signIn/out
            // se hacen en Server Actions donde sí se puede).
          }
        },
      },
    },
  );
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/** Devuelve true si el usuario autenticado figura en public.admins. */
export async function isAdminUser(userId: string): Promise<boolean> {
  const { data } = await getSupabaseAdmin()
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data !== null;
}

/** Guard para layouts/páginas admin: redirige a /login si no hay sesión admin. */
export async function requireAdminSession() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const admin = await isAdminUser(user.id);
  if (!admin) redirect("/login?error=forbidden");
  return user;
}