"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { addBlockAction, deleteBlockAction, type BlockResult } from "@/app/admin/availability-actions";

export function AddBlockForm({
  itemType,
  itemId,
}: {
  itemType: "property" | "tour";
  itemId: string;
}) {
  const [state, formAction, pending] = useActionState<BlockResult, FormData>(
    async (_prev, fd) => addBlockAction(fd),
    { ok: false },
  );

  return (
    <form action={formAction} className="grid gap-3 rounded-2xl border border-line bg-white p-5 shadow-soft sm:grid-cols-2">
      <input type="hidden" name="item_type" value={itemType} />
      <input type="hidden" name="item_id" value={itemId} />
      <div>
        <label htmlFor="start" className="mb-1 block text-sm font-semibold text-ink">
          Desde
        </label>
        <input
          id="start"
          name="start"
          type="date"
          required
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:outline-coral"
        />
      </div>
      <div>
        <label htmlFor="end" className="mb-1 block text-sm font-semibold text-ink">
          Hasta (excluida)
        </label>
        <input
          id="end"
          name="end"
          type="date"
          required
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:outline-coral"
        />
      </div>
      <div>
        <label htmlFor="reason" className="mb-1 block text-sm font-semibold text-ink">
          Motivo
        </label>
        <select id="reason" name="reason" className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:outline-coral">
          <option value="blocked">Bloqueado (mantenimiento / fuera de venta)</option>
          <option value="owner">No disponible (dueño)</option>
        </select>
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={pending || !itemId}
          className="btn-primary h-11 w-full rounded-xl disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Agregar bloqueo"}
        </button>
      </div>
      {state.error && (
        <p className="rounded-xl bg-rojo/15 px-4 py-2.5 text-sm font-medium text-rojo-deep sm:col-span-2" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function DeleteBlockButton({ blockId }: { blockId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onDelete = () => {
    if (!confirm("¿Quitar este bloqueo manual?")) return;
    const fd = new FormData();
    fd.set("block_id", blockId);
    startTransition(async () => {
      const res = await deleteBlockAction(fd);
      if (res.ok) {
        toast.success("Bloqueo eliminado");
        router.refresh();
      } else {
        toast.error(res.error ?? "No se pudo eliminar el bloqueo");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      aria-label="Eliminar bloqueo"
      className="inline-flex size-9 items-center justify-center rounded-full border border-rojo/30 text-rojo-deep transition hover:bg-rojo/10 disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
    </button>
  );
}