"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, ImagePlus, Trash2 } from "lucide-react";
import { saveComboAction, type SaveResult } from "@/app/admin/catalog-actions";
import type { AdminCombo, AdminPhotoInput } from "@/server/domain/admin/catalog";
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

export function ComboForm({
  combo,
  properties,
  tours,
}: {
  combo: AdminCombo | null;
  properties: { id: string; name: string; price_per_night: number }[];
  tours: { id: string; name: string; price: number; provider: string }[];
}) {
  const [state, formAction, pending] = useActionState<SaveResult, FormData>(
    async (_prev, fd) => saveComboAction(fd),
    { ok: false },
  );

  const [photos, setPhotos] = useState<AdminPhotoInput[]>(
    combo?.photos.map((p) => ({ url: p.url, alt: p.alt ?? "" })) ?? [{ url: "", alt: "" }],
  );
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>(
    combo?.tours.map((t) => t.id) ?? [],
  );

  const setPhoto = (i: number, p: AdminPhotoInput) =>
    setPhotos((prev) => prev.map((x, idx) => (idx === i ? p : x)));
  const addPhoto = () => setPhotos((prev) => [...prev, { url: "", alt: "" }]);
  const removePhoto = (i: number) =>
    setPhotos((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const toggleTour = (tourId: string) =>
    setSelectedTourIds((prev) =>
      prev.includes(tourId) ? prev.filter((id) => id !== tourId) : [...prev, tourId],
    );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={combo?.id ?? ""} />

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
      {state.ok && <RedirectAfterSave id={state.id ?? combo?.id ?? ""} />}

      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink">Información</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre (ES)" id="name_es" required>
            <input id="name_es" name="name_es" defaultValue={combo?.name_es ?? ""} className={inputCls} />
          </Field>
          <Field label="Nombre (EN)" id="name_en">
            <input id="name_en" name="name_en" defaultValue={combo?.name_en ?? ""} className={inputCls} />
          </Field>
          <Field label="Slug" id="slug" hint="Auto-generado si lo dejás vacío.">
            <input id="slug" name="slug" defaultValue={combo?.slug ?? ""} className={inputCls} />
          </Field>
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Descripción (ES)" id="description_es">
            <textarea id="description_es" name="description_es" defaultValue={combo?.description_es ?? ""} className={areaCls} />
          </Field>
          <Field label="Descripción (EN)" id="description_en">
            <textarea id="description_en" name="description_en" defaultValue={combo?.description_en ?? ""} className={areaCls} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink">Paquete</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Casa incluida" id="property_id" required>
            <select id="property_id" name="property_id" defaultValue={combo?.property_id ?? ""} className={inputCls}>
              <option value="">Seleccionar casa…</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ${p.price_per_night}/noche
                </option>
              ))}
            </select>
          </Field>
          <Field label="Descuento (%)" id="discount_pct" required hint="15 = 15% de descuento sobre el total">
            <input
              id="discount_pct"
              name="discount_pct"
              type="number"
              min={0}
              max={50}
              step={0.5}
              defaultValue={combo?.discount_pct ?? 15}
              className={`${inputCls} text-right tabular-nums`}
            />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Badge texto" id="badge_text" hint="Ej: 15% off, Paquete completo">
            <input id="badge_text" name="badge_text" defaultValue={combo?.badge_text ?? ""} className={inputCls} />
          </Field>
          <Field label="Badge color" id="badge_color" hint="coral, pina, monte, etc.">
            <input id="badge_color" name="badge_color" defaultValue={combo?.badge_color ?? ""} className={inputCls} />
          </Field>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-ink">Tours incluidos</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {tours.map((tour) => {
              const selected = selectedTourIds.includes(tour.id);
              return (
                <label
                  key={tour.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    selected
                      ? "border-coral bg-coral-soft"
                      : "border-line bg-white hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    name={`tour_id_${tours.indexOf(tour)}`}
                    value={tour.id}
                    checked={selected}
                    onChange={() => toggleTour(tour.id)}
                    className="sr-only"
                  />
                  <span
                    className={`inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
                      selected
                        ? "border-coral bg-coral text-white"
                        : "border-line bg-white"
                    }`}
                  >
                    {selected && <Check className="size-3" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{tour.name}</p>
                    <p className="text-xs text-mute">
                      ${tour.price}/persona · {tour.provider}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
          {tours.length === 0 && (
            <p className="text-sm text-mute">No hay tours disponibles. Creá tours primero desde /admin/tours.</p>
          )}
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
            <input type="checkbox" name="featured" defaultChecked={combo?.featured ?? false} className="size-4 accent-ink" />
            Destacado en la home
          </label>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line">
            <label className="cursor-pointer">
              <input type="radio" name="status" value="active" defaultChecked={(combo?.status ?? "inactive") === "active"} className="peer sr-only" />
              <span className="inline-flex h-10 items-center justify-center px-4 text-sm font-semibold text-mute transition peer-checked:bg-monte peer-checked:text-white">
                Activo
              </span>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="status" value="inactive" defaultChecked={(combo?.status ?? "inactive") === "inactive"} className="peer sr-only" />
              <span className="inline-flex h-10 items-center justify-center px-4 text-sm font-semibold text-mute transition peer-checked:bg-rojo-deep peer-checked:text-white">
                Inactivo
              </span>
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/combos"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-muted/40"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al listado
        </Link>
        <Button type="submit" size="lg" className="rounded-xl px-6" disabled={pending}>
          {pending ? "Guardando…" : combo ? "Guardar cambios" : "Crear combo"}
        </Button>
      </div>
    </form>
  );
}

function RedirectAfterSave({ id }: { id: string }) {
  const router = useRouter();
  useEffect(() => {
    if (id) {
      router.push(`/admin/combos/${id}`);
      router.refresh();
    } else {
      router.push("/admin/combos");
      router.refresh();
    }
  }, [id, router]);
  return null;
}
