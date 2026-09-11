"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, ArrowLeft, BedDouble, CalendarDays, Eye, EyeOff, Loader2, Lock, Mail, Wallet } from "lucide-react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="h-11 w-full rounded-xl bg-coral-deep text-base text-white shadow-soft hover:bg-coral-deep/90 hover:shadow-soft-lg"
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? "Ingresando…" : "Entrar"}
    </Button>
  );
}

const features = [
  { icon: BedDouble, text: "Gestioná casas, tours y disponibilidad en un solo lugar" },
  { icon: CalendarDays, text: "Confirmá y cancelá reservas con un clic" },
  { icon: Wallet, text: "Seguí las comisiones pendientes y cobradas" },
];

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-line bg-white shadow-soft-lg lg:grid-cols-5">
      {/* Lado de marca */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-coral-deep via-coral to-coral-soft p-10 lg:col-span-2 lg:flex">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-64 rounded-full bg-white/10 blur-3xl" aria-hidden />

        <p className="font-display text-3xl font-bold tracking-tight text-white">
          jacó<span className="text-white/80">.</span>
        </p>

        <div className="relative space-y-5">
          <p className="text-xl leading-snug font-semibold text-white">
            El panel de reservas,
            <br /> disponibilidad y comisiones.
          </p>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f.text} className="flex items-start gap-2.5 text-sm text-white/90">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <f.icon className="size-3" aria-hidden />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Formulario */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:col-span-3">
        <p className="font-display text-2xl font-bold tracking-tight text-ink lg:hidden">
          jacó<span className="text-coral">.</span>
        </p>
        <p className="mt-1 text-sm text-mute">Panel de administración</p>

        <form action={formAction} className="mt-8 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-ink">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute" aria-hidden />
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@jaco.cr"
                className="h-12 rounded-xl border-input bg-white pl-10 pr-4 text-sm text-ink shadow-soft focus:border-coral focus-visible:ring-coral/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-semibold text-ink">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute" aria-hidden />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 rounded-xl border-input bg-white pl-10 pr-11 text-sm text-ink shadow-soft focus:border-coral focus-visible:ring-coral/50"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1.5 top-1/2 size-8 -translate-y-1/2 rounded-lg text-mute hover:bg-muted/60 hover:text-ink"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
          </div>

          {state?.error && (
            <p className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive" role="alert">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>

        <div className="mt-8 flex items-center justify-center">
          <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-mute hover:text-ink">
            <Link href="/">
              <ArrowLeft className="size-4" aria-hidden />
              Volver al sitio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}