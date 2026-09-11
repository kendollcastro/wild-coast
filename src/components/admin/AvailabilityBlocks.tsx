"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { addBlockAction, deleteBlockAction, type BlockResult } from "@/app/admin/availability-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/admin/FormSelect";

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

  const inputClass =
    "w-full rounded-xl border border-input bg-white px-3.5 py-2.5 text-sm text-ink focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo bloqueo</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="item_type" value={itemType} />
          <input type="hidden" name="item_id" value={itemId} />
          <div>
            <Label htmlFor="start" className="mb-1 block text-sm font-medium text-ink">
              Desde
            </Label>
            <input id="start" name="start" type="date" required className={inputClass} />
          </div>
          <div>
            <Label htmlFor="end" className="mb-1 block text-sm font-medium text-ink">
              Hasta (excluida)
            </Label>
            <input id="end" name="end" type="date" required className={inputClass} />
          </div>
          <div>
            <Label htmlFor="reason" className="mb-1 block text-sm font-medium text-ink">
              Motivo
            </Label>
            <FormSelect
              name="reason"
              defaultValue="blocked"
              options={[
                { value: "blocked", label: "Bloqueado (mantenimiento / fuera de venta)" },
                { value: "owner", label: "No disponible (dueño)" },
              ]}
              triggerClassName="h-10 w-full rounded-xl bg-white text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" size="lg" className="w-full" disabled={pending || !itemId}>
              {pending ? "Guardando…" : "Agregar bloqueo"}
            </Button>
          </div>
          {state.error && (
            <p className="rounded-xl bg-rojo/15 px-4 py-2.5 text-sm font-medium text-rojo-deep sm:col-span-2" role="alert">
              {state.error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export function DeleteBlockButton({ blockId }: { blockId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onDelete = async () => {
    const fd = new FormData();
    fd.set("block_id", blockId);
    const res = await deleteBlockAction(fd);
    if (res.ok) {
      toast.success("Bloqueo eliminado");
      router.refresh();
    } else {
      toast.error(res.error ?? "No se pudo eliminar el bloqueo");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          aria-label="Eliminar bloqueo"
          className="text-rojo-deep hover:bg-rojo/10 hover:text-rojo-deep"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Quitar este bloqueo manual?</AlertDialogTitle>
          <AlertDialogDescription>El bloqueo se eliminará y las fechas volverán a estar disponibles.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive"
            onClick={(e) => {
              e.preventDefault();
              startTransition(async () => {
                await onDelete();
              });
            }}
          >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Sí, quitar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}