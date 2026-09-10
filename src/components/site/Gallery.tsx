"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PhotoView } from "@/server/db/schema.types";
import { useI18n } from "./i18n-provider";

export function Gallery({ photos, name }: { photos: PhotoView[]; name: string }) {
  const [active, setActive] = useState(0);
  const { dict } = useI18n();
  const t = dict.gallery;

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-muted font-display text-2xl font-bold text-muted-foreground">
        {name}
      </div>
    );
  }

  const main = photos[0];
  const count = photos.length;
  const useMosaic = count >= 4;
  const extra = count - 4;
  const tiles = useMosaic ? photos.slice(1, extra > 0 ? 4 : 5) : [];

  const viewLabel = t.view.replace("{name}", name);

  return (
    <div>
      {/* Mosaico (desktop, con 4+ fotos) */}
      {useMosaic && (
        <div className="hidden h-[430px] grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl sm:grid lg:h-[500px]">
          <a
            href={main.url}
            target="_blank"
            rel="noreferrer"
            aria-label={viewLabel}
            className="group relative col-span-2 row-span-2 overflow-hidden"
          >
            <Image
              src={main.url}
              alt={main.alt ?? name}
              fill
              priority
              sizes="(max-width: 1024px) 60vw, 42vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </a>
          {tiles.map((photo) => (
            <a
              key={photo.id}
              href={photo.url}
              target="_blank"
              rel="noreferrer"
              aria-label={viewLabel}
              className="group relative overflow-hidden"
            >
              <Image
                src={photo.url}
                alt={photo.alt ?? name}
                fill
                sizes="(max-width: 1024px) 20vw, 18vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>
          ))}
          {extra > 0 && (
            <div className="group relative overflow-hidden bg-ink">
              <div className="absolute inset-0 flex items-center justify-center bg-ink/10 font-mono text-sm font-medium text-white [background-image:radial-gradient(rgb(255 255 255/0.55)_1px,transparent_1px)] [background-size:10px_10px]">
                {t.more.replace("{count}", String(extra))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Carrusel (mobile / pocas fotos) */}
      <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${useMosaic ? "sm:hidden" : ""}`}>
        <Image
          key={active}
          src={photos[active].url}
          alt={photos[active].alt ?? t.photoAlt.replace("{name}", name).replace("{n}", String(active + 1))}
          fill
          priority={!useMosaic}
          sizes="100vw"
          className="fade-in object-cover"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label={t.prev}
              onClick={() => setActive((active - 1 + count) % count)}
              className="absolute left-2.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition-transform hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label={t.next}
              onClick={() => setActive((active + 1) % count)}
              className="absolute right-2.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition-transform hover:scale-105 active:scale-95"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
            <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink shadow-soft backdrop-blur">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>
    </div>
  );
}