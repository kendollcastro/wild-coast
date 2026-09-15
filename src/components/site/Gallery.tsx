"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PhotoView } from "@/server/db/schema.types";
import { useI18n } from "./i18n-provider";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function Gallery({ photos, name }: { photos: PhotoView[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { dict } = useI18n();
  const t = dict.gallery;

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, nextPhoto, prevPhoto]);

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
    <>
      <div>
        {/* Mosaico (desktop, con 4+ fotos) */}
        {useMosaic && (
          <div className="hidden h-[430px] grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl sm:grid lg:h-[500px]">
            <button
              type="button"
              onClick={() => openLightbox(0)}
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
            </button>
            {tiles.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => openLightbox(i + 1)}
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
              </button>
            ))}
            {extra > 0 && (
              <button
                type="button"
                onClick={() => openLightbox(4)}
                className="group relative overflow-hidden bg-ink"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-ink/10 font-mono text-sm font-medium text-white transition-colors group-hover:bg-ink/20 [background-image:radial-gradient(rgb(255_255_255/0.55)_1px,transparent_1px)] [background-size:10px_10px]">
                  {t.more.replace("{count}", String(extra))}
                </div>
              </button>
            )}
          </div>
        )}

        {/* Carrusel (mobile / pocas fotos) */}
        <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${useMosaic ? "sm:hidden" : ""}`}>
          <button
            type="button"
            onClick={() => openLightbox(active)}
            className="absolute inset-0"
            aria-label={viewLabel}
          >
            <Image
              key={active}
              src={photos[active].url}
              alt={photos[active].alt ?? t.photoAlt.replace("{name}", name).replace("{n}", String(active + 1))}
              fill
              priority={!useMosaic}
              sizes="100vw"
              className="fade-in object-cover"
            />
          </button>
          {count > 1 && (
            <>
              <button
                type="button"
                aria-label={t.prev}
                onClick={(e) => { e.stopPropagation(); setActive((active - 1 + count) % count); }}
                className="absolute left-2.5 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition-transform hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={t.next}
                onClick={(e) => { e.stopPropagation(); setActive((active + 1) % count); }}
                className="absolute right-2.5 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition-transform hover:scale-105 active:scale-95"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
              <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink shadow-soft backdrop-blur">
                {active + 1} / {count}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Lightbox modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[100vw] border-0 bg-black/95 p-0 sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[65vw]"
        >
          <div className="relative aspect-video w-full">
            <Image
              key={lightboxIndex}
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].alt ?? t.photoAlt.replace("{name}", name).replace("{n}", String(lightboxIndex + 1))}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>
            {/* Counter */}
            <span className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {lightboxIndex + 1} / {count}
            </span>
          </div>
          {/* Navigation */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/40"
                aria-label={t.prev}
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/40"
                aria-label={t.next}
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
