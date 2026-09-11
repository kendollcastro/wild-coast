"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Plus, Trash2 } from "lucide-react";
import { saveTourAction, type SaveResult } from "@/app/admin/catalog-actions";
import type { AdminTour, AdminPhotoInput } from "@/server/domain/admin/catalog";
import type { TourPricingOption } from "@/server/db/schema.types";
import { Button } from "@/components/ui/button";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-1 outline-transparent transition focus:outline-coral focus:border-coral";
const areaCls = `${inputCls} min-h-24 resize-y`;

function Field({
  label,
  id,
  required,
  hint,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label} {required && <span className="text-coral">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-mute">{hint}</p>}
    </div>
  );
}

function PhotoRow({
  index,
  photo,
  onChange,
  onRemove,
}: {
  index: number;
  photo: AdminPhotoInput;
  onChange: (p: AdminPhotoInput) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-xl border border-line bg-muted/30 p-3 sm:grid-cols-[1fr_1fr_auto]">
      <input
        id={`photo_url_${index}`}
        name={`photo_url_${index}`}
        value={photo.url}
        onChange={(e) => onChange({ ...photo, url: e.target.value })}
        placeholder="https://…/foto.jpg"
        className={inputCls}
        inputMode="url"
      />
      <input
        id={`photo_alt_${index}`}
        name={`photo_alt_${index}`}
        value={photo.alt}
        onChange={(e) => onChange({ ...photo, alt: e.target.value })}
        placeholder="Alt (opcional)"
        className={inputCls}
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Quitar foto"
        className="inline-flex h-11 items-center justify-center rounded-xl border border-rojo/30 text-rojo-deep transition hover:bg-rojo/10"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function TourForm({ tour }: { tour: AdminTour | null }) {
  const [state, formAction, pending] = useActionState<SaveResult, FormData>(
    async (_prev, fd) => saveTourAction(fd),
    { ok: false },
  );

  const [photos, setPhotos] = useState<AdminPhotoInput[]>(
    tour?.photos.map((p) => ({ url: p.url, alt: p.alt ?? "" })) ?? [{ url: "", alt: "" }],
  );
  const [options, setOptions] = useState<TourPricingOption[]>(
    tour?.pricing_options?.length ? tour.pricing_options : [{ duration: "", price: 0 }],
  );

  const setPhoto = (i: number, p: AdminPhotoInput) =>
    setPhotos((prev) => prev.map((x, idx) => (idx === i ? p : x)));
  const addPhoto = () => setPhotos((prev) => [...prev, { url: "", alt: "" }]);
  const removePhoto = (i: number) =>
    setPhotos((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const setOption = (i: number, patch: Partial<TourPricingOption>) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const addOption = () => setOptions((prev) => [...prev, { duration: "", price: 0 }]);
  const removeOption = (i: number) =>
    setOptions((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={tour?.id ?? ""} />

      {state.error && (
        <p className="rounded-xl bg-rojo/15 px-4 py-3 text-sm font-medium text-rojo-deep" role="alert">
          {state.error}
        </p>
      )}
      {pending && (
        <p className="rounded-xl bg-pina-soft px-4 py-3 text-sm font-medium text-pina-deep">
          Guardando…
        </p>
      )}
      {state.ok && <RedirectAfterSave id={state.id ?? tour?.id ?? ""} listPath="/admin/tours" />}

      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink">Información</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre (ES)" id="name_es" required>
            <input id="name_es" name="name_es" defaultValue={tour?.name_es ?? ""} className={inputCls} />
          </Field>
          <Field label="Nombre (EN)" id="name_en">
            <input id="name_en" name="name_en" defaultValue={tour?.name_en ?? ""} className={inputCls} />
          </Field>
          <Field label="Slug" id="slug" hint="Auto-generado si lo dejás vacío.">
            <input id="slug" name="slug" defaultValue={tour?.slug ?? ""} className={inputCls} />
          </Field>
          <Field label="Categoría" id="category">
            <input id="category" name="category" defaultValue={tour?.category ?? ""} className={inputCls} placeholder="Ej: Aventura, Caminatas…" />
          </Field>
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Descripción (ES)" id="description_es">
            <textarea id="description_es" name="description_es" defaultValue={tour?.description_es ?? ""} className={areaCls} />
          </Field>
          <Field label="Descripción (EN)" id="description_en">
            <textarea id="description_en" name="description_en" defaultValue={tour?.description_en ?? ""} className={areaCls} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink">Precio y capacidad</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Precio base / persona (USD)" id="price" required>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={tour?.price ?? 0}
              className={`${inputCls} text-right tabular-nums`}
            />
          </Field>
          <Field label="Precio original (tachado)" id="original_price">
            <input
              id="original_price"
              name="original_price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={tour?.original_price ?? ""}
              className={`${inputCls} text-right tabular-nums`}
            />
          </Field>
          <Field label="Moneda" id="currency">
            <select id="currency" name="currency" defaultValue={tour?.currency ?? "USD"} className={inputCls}>
              <option value="USD">USD</option>
              <option value="CRC">CRC</option>
            </select>
          </Field>
          <Field label="Duración (texto)" id="duration">
            <input id="duration" name="duration" defaultValue={tour?.duration ?? ""} className={inputCls} placeholder="Ej: Full day" />
          </Field>
          <Field label="Duración (horas)" id="duration_hours">
            <input id="duration_hours" name="duration_hours" type="number" min={0} step="0.5" defaultValue={tour?.duration_hours ?? ""} className={inputCls} />
          </Field>
          <Field label="Capacidad por día" id="capacity">
            <input id="capacity" name="capacity" type="number" min={1} defaultValue={tour?.capacity ?? 10} className={inputCls} />
          </Field>
          <Field label="Máx participantes" id="max_participants">
            <input id="max_participants" name="max_participants" type="number" min={1} defaultValue={tour?.max_participants ?? ""} className={inputCls} />
          </Field>
          <Field label="Proveedor" id="provider">
            <input id="provider" name="provider" defaultValue={tour?.provider ?? "Vamos Jacó"} className={inputCls} />
          </Field>
          <Field label="Comisión (%)" id="commission_percent">
            <input id="commission_percent" name="commission_percent" type="number" min={0} step="0.5" defaultValue={tour?.commission_percent ?? 10} className={inputCls} />
          </Field>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-ink">Opciones de precio</h3>
            <button
              type="button"
              onClick={addOption}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/20 px-3 text-xs font-semibold text-ink transition hover:bg-ink/5"
            >
              <Plus className="size-3.5" aria-hidden />
              Agregar opción
            </button>
          </div>
          <div className="space-y-2">
            {options.map((o, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-line bg-muted/30 p-3 sm:grid-cols-[1fr_120px_1fr_auto]">
                <input
                  id={`po_duration_${i}`}
                  name={`po_duration_${i}`}
                  value={o.duration}
                  onChange={(e) => setOption(i, { duration: e.target.value })}
                  placeholder="Duración (Ej: 4h)"
                  className={inputCls}
                />
                <input
                  id={`po_price_${i}`}
                  name={`po_price_${i}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={o.price}
                  onChange={(e) => setOption(i, { price: Number(e.target.value) })}
                  placeholder="Precio"
                  className={`${inputCls} text-right tabular-nums`}
                />
                <input
                  id={`po_variation_${i}`}
                  name={`po_variation_${i}`}
                  value={o.variation_id ?? ""}
                  onChange={(e) => setOption(i, { variation_id: e.target.value })}
                  placeholder="Variación (opcional)"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  aria-label="Quitar opción"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-rojo/30 text-rojo-deep transition hover:bg-rojo/10"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink">Destacados e incluidos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Destacados (ES)" id="highlights_es" hint="Uno por línea.">
            <textarea id="highlights_es" name="highlights_es" defaultValue={tour?.highlights_es?.join("\n") ?? ""} className={areaCls} />
          </Field>
          <Field label="Destacados (EN)" id="highlights_en" hint="Uno por línea.">
            <textarea id="highlights_en" name="highlights_en" defaultValue={tour?.highlights_en?.join("\n") ?? ""} className={areaCls} />
          </Field>
          <Field label="Incluye (ES)" id="includes_es" hint="Uno por línea.">
            <textarea id="includes_es" name="includes_es" defaultValue={tour?.includes_es?.join("\n") ?? ""} className={areaCls} />
          </Field>
          <Field label="Incluye (EN)" id="includes_en" hint="Uno por línea.">
            <textarea id="includes_en" name="includes_en" defaultValue={tour?.includes_en?.join("\n") ?? ""} className={areaCls} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink">Fotos</h2>
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={addPhoto}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink/20 px-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
          >
            <ImagePlus className="size-4" aria-hidden />
            Agregar foto
          </button>
        </div>
        <div className="space-y-2">
          {photos.map((p, i) => (
            <PhotoRow key={i} index={i} photo={p} onChange={(np) => setPhoto(i, np)} onRemove={() => removePhoto(i)} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink">Publicación</h2>
        <div className="flex flex-wrap items-center gap-6">
          <label className="inline-flex items-center gap-2.5 text-sm font-medium text-ink">
            <input type="checkbox" name="featured" defaultChecked={tour?.featured ?? false} className="size-4 accent-ink" />
            Destacado en la home
          </label>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line">
            <label className="cursor-pointer">
              <input type="radio" name="status" value="active" defaultChecked={(tour?.status ?? "inactive") === "active"} className="peer sr-only" />
              <span className="inline-flex h-10 items-center justify-center px-4 text-sm font-semibold text-mute transition peer-checked:bg-monte peer-checked:text-white">
                Activo
              </span>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="status" value="inactive" defaultChecked={(tour?.status ?? "inactive") === "inactive"} className="peer sr-only" />
              <span className="inline-flex h-10 items-center justify-center px-4 text-sm font-semibold text-mute transition peer-checked:bg-rojo-deep peer-checked:text-white">
                Inactivo
              </span>
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/tours"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-muted/40"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al listado
        </Link>
        <Button type="submit" size="lg" className="rounded-xl px-6" disabled={pending}>
          {pending ? "Guardando…" : tour ? "Guardar cambios" : "Crear tour"}
        </Button>
      </div>
    </form>
  );
}

function RedirectAfterSave({ id, listPath }: { id: string; listPath: string }) {
  const router = useRouter();
  useEffect(() => {
    if (id) {
      router.push(`${listPath}/${id}`);
      router.refresh();
    } else {
      router.push(listPath);
      router.refresh();
    }
  }, [id, listPath, router]);
  return null;
}