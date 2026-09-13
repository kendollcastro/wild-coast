import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80dvh] flex-col items-center justify-center bg-paper px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-deep">404 · la marea subió</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        No encontramos eso
      </h1>
      <p className="mt-3 max-w-md text-mute">
        La página que buscás no está (o ya no). Volvé a tierra firme:
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Ir a la home
        </Link>
        <Link href="/es/casas" className="btn-outline">
          Ver las casas
        </Link>
      </div>
    </section>
  );
}