"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/server/auth/session";
import { rateLimitByIp } from "@/server/lib/rate-limit";

/**
 * Login con email/contraseña de Supabase Auth.
 * Requisito: el user_id debe estar registrado en public.admins.
 * Ejemplo (desde Supabase SQL editor), reemplazando el id de tu usuario:
 *   insert into public.admins (user_id, email)
 *   values ('<uuid-de-tu-usuario>', 'tu@email.co');
 */
export type LoginState = { error: string } | null;

export async function loginAction(prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  if (!email || !password) return { error: "ingresá email y contraseña" };

  // Máximo 5 intentos por IP cada 15 minutos (anti brute-force).
  const allowed = await rateLimitByIp("login", 5, 15 * 60);
  if (!allowed) return { error: "Demasiados intentos. Probalo en 15 minutos." };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "email o contraseña incorrectos" };

  redirect("/admin");
}