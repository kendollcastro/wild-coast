"use client";

/** Error boundary raíz (sustituye al layout si el error es fatal a nivel app). */
export default function GlobalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { reset } = props;
  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-paper p-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Algo salió mal</h1>
          <p className="mt-3 text-sm text-mute">
            No pudimos mostrar esta página. Volvé a intentar; si sigue fallando, escribinos.
          </p>
          <button
            type="button"
            onClick={reset}
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}