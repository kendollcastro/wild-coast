"use client";

import { RefreshCw } from "lucide-react";

/** Error boundary del sitio público (lista, detalle y reservas). */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center sm:py-32">
      <p className="eyebrow">Ups</p>
      <h1 className="mt-2 section-title text-4xl">Algo salió mal</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        No pudimos cargar esta sección. Puede ser un problema temporal de conexión.
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn-primary mx-auto mt-6 inline-flex items-center gap-2"
      >
        <RefreshCw className="size-4" aria-hidden /> Reintentar
      </button>
      {error.digest && (
        <p className="mt-8 font-mono text-xs text-mute">referencia: {error.digest}</p>
      )}
    </main>
  );
}