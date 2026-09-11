"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Trash2 } from "lucide-react";
import { savePropertyAction, type SaveResult } from "@/app/admin/catalog-actions";
import type { AdminProperty, AdminPhotoInput } from "@/server/domain/admin/catalog";
import { Button } from "@/components/ui/button";

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

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-1 outline-transparent transition focus:outline-coral focus:border-coral";
const areaCls = `${inputCls} min-h-24 resize-y`;

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
    <div key={index} className="grid gap-2 rounded-xl border border-line bg-muted/30 p-3 sm:grid-cols-[1fr_1fr_auto]">
      <div className="space-y-1">
        <label htmlFor={`photo_url_${index}`} className="sr-only">
          URL de la foto
        </label>
        <input
          id={`photo_url_${index}`}
          name={`photo_url_${index}`}
          value={photo.url}
          onChange={(e) => onChange({ ...photo, url: e.target.value })}
          placeholder="https://…/foto.jpg"
          className={inputCls}
          inputMode="url"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor={`photo_alt_${index}`} className="sr-only">
          Texto alternativo
        </label>
        <input
          id={`photo_alt_${index}`}
          name={`photo_alt_${index}`}
          value={photo.alt}
          onChange={(e) => onChange({ ...photo, alt: e.target.value })}
          placeholder="Alt (opcional)"
          className={inputCls}
        />
      </div>
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

export function PropertyForm({
  property,
  owners,
}: {
  property: AdminProperty | null;
  owners: { id: string; name: string; email: string }[];
}) {
  const [state, formAction, pending] = useActionState<SaveResult, FormData>(
    async (_prev, fd) => savePropertyAction(fd),
    { ok: false },
  );

  const [photos, setPhotos] = useState<AdminPhotoInput[]>(
    property?.photos.map((p) => ({ url: p.url, alt: p.alt ?? "" })) ?? [{ url: "", alt: "" }],
  );

  const setPhoto = (i: number, p: AdminPhotoInput) =>
    setPhotos((prev) => prev.map((x, idx) => (idx === i ? p : x)));
  const addPhoto = () => setPhotos((prev) => [...prev, { url: "", alt: "" }]);
  const removePhoto = (i: number) =>
    setPhotos((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={property?.id ?? ""} />

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
      {state.ok && (
        <RedirectAfterSave id={state.id ?? property?.id ?? ""} listPath="/admin/casas" />
      )}

      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink">Información</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre (ES)" id="name_es" required>
            <input id="name_es" name="name_es" defaultValue={property?.name_es ?? ""} className={inputCls} />
          </Field>
          <Field label="Nombre (EN)" id="name_en">
            <input id="name_en" name="name_en" defaultValue={property?.name_en ?? ""} className={inputCls} />
          </Field>
          <Field label="Slug" id="slug" hint="Auto-generado si lo dejás vacío. Sin espacios ni mayúsculas.">
            <input id="slug" name="slug" defaultValue={property?.slug ?? ""} className={inputCls} />
          </Field>
          <Field label="Zona (ES)" id="location_label_es" hint="Ej: Playa Hermosa">
            <input
              id="location_label_es"
              name="location_label_es"
              defaultValue={property?.location_label ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Zona (EN)" id="location_label_en">
            <input
              id="location_label_en"
              name="location_label_en"
              defaultValue={property?.location_label_en ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Marca" id="brand">
            <input id="brand" name="brand" defaultValue={property?.brand ?? ""} className={inputCls} />
          </Field>
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Descripción (ES)" id="description_es">
            <textarea
              id="description_es"
              name="description_es"
              defaultValue={property?.description_es ?? ""}
              className={areaCls}
            />
          </Field>
          <Field label="Descripción (EN)" id="description_en">
            <textarea
              id="description_en"
              name="description_en"
              defaultValue={property?.description_en ?? ""}
              className={areaCls}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink">Precio y características</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Precio por noche (USD)" id="price_per_night" required>
            <input
              id="price_per_night"
              name="price_per_night"
              type="number"
              min={0}
              step="0.01"
              defaultValue={property?.price_per_night ?? 0}
              className={`${inputCls} text-right tabular-nums`}
            />
          </Field>
          <Field label="Capacidad" id="capacity">
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              defaultValue={property?.capacity ?? 2}
              className={inputCls}
            />
          </Field>
          <Field label="Moneda" id="currency">
            <select
              id="currency"
              name="currency"
              defaultValue={property?.currency ?? "USD"}
              className={inputCls}
            >
              <option value="USD">USD</option>
              <option value="CRC">CRC</option>
            </select>
          </Field>
          <Field label="Dormitorios" id="bedrooms">
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={property?.bedrooms ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Baños" id="bathrooms">
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              step="0.5"
              defaultValue={property?.bathrooms ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Dueno" id="owner_id">
            <select id="owner_id" name="owner_id" defaultValue={property?.owner_id ?? ""} className={inputCls}>
              <option value="" disabled>
                Elegí un dueño
              </option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Latitud" id="lat">
            <input id="lat" name="lat" defaultValue={property?.lat ?? ""} className={inputCls} inputMode="decimal" />
          </Field>
          <Field label="Longitud" id="lng">
            <input id="lng" name="lng" defaultValue={property?.lng ?? ""} className={inputCls} inputMode="decimal" />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink">Textos listados</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amenities (ES)" id="amenities_es" hint="Una por línea.">
            <textarea id="amenities_es" name="amenities_es" defaultValue={property?.amenities?.map(String).join("\n") ?? ""} className={areaCls} />
          </Field>
          <Field label="Amenities (EN)" id="amenities_en" hint="Una por línea.">
            <textarea id="amenities_en" name="amenities_en" defaultValue={property?.amenities_en?.map(String).join("\n") ?? ""} className={areaCls} />
          </Field>
          <Field label="Fauna que se ve (ES)" id="wildlife_seen" hint="Una por línea.">
            <textarea id="wildlife_seen" name="wildlife_seen" defaultValue={property?.wildlife_seen?.map(String).join("\n") ?? ""} className={areaCls} />
          </Field>
          <Field label="Servicios (ES)" id="services" hint="Una por línea.">
            <textarea id="services" name="services" defaultValue={property?.services?.map(String).join("\n") ?? ""} className={areaCls} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-ink">Fotos</h2>
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
            <input
              type="checkbox"
              name="featured"
              defaultChecked={property?.featured ?? false}
              className="size-4 accent-ink"
            />
            Destacada en la home
          </label>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line">
            <label className="cursor-pointer">
              <input type="radio" name="status" value="active" defaultChecked={(property?.status ?? "inactive") === "active"} className="peer sr-only" />
              <span className="inline-flex h-10 items-center justify-center px-4 text-sm font-semibold text-mute transition peer-checked:bg-monte peer-checked:text-white">
                Activa
              </span>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="status" value="inactive" defaultChecked={(property?.status ?? "inactive") === "inactive"} className="peer sr-only" />
              <span className="inline-flex h-10 items-center justify-center px-4 text-sm font-semibold text-mute transition peer-checked:bg-rojo-deep peer-checked:text-white">
                Inactiva
              </span>
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/casas"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-muted/40"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al listado
        </Link>
        <Button type="submit" size="lg" className="rounded-xl px-6" disabled={pending}>
          {pending ? "Guardando…" : property ? "Guardar cambios" : "Crear casa"}
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