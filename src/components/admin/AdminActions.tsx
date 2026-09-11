"use client";

import { useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, BadgeCheck, Trash2 } from "lucide-react";
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
import { updateBookingStatusAction, markCommissionPaidAction } from "@/app/admin/actions";
import { deletePropertyAction, deleteTourAction } from "@/app/admin/catalog-actions";
import type { BookingStatus, CommissionStatus } from "@/server/db/schema.types";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/admin/FormSelect";

function ActionForm({
  action,
  success,
  className,
  children,
}: {
  action: (fd: FormData) => Promise<unknown>;
  success: string;
  className?: string;
  children: (pending: boolean) => ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(fd);
      toast.success(success);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      {children(pending)}
    </form>
  );
}

export function BookingStatusForm({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  return (
    <ActionForm
      action={updateBookingStatusAction}
      success="Estado actualizado"
      className="flex items-center gap-1.5"
    >
      {(pending) => (
        <>
          <input type="hidden" name="booking_id" value={bookingId} />
          <FormSelect
            name="status"
            defaultValue={status}
            options={[
              { value: "pending", label: "pendiente" },
              { value: "confirmed", label: "confirmada" },
              { value: "cancelled", label: "cancelada" },
            ]}
            triggerClassName="h-8 w-32 rounded-lg bg-white text-xs"
          />
          <Button type="submit" size="sm" disabled={pending}>
            {pending && <Loader2 className="size-3 animate-spin" aria-hidden />}
            ok
          </Button>
        </>
      )}
    </ActionForm>
  );
}

export function MarkPaidButton({
  commissionId,
  status,
}: {
  commissionId: string;
  status: CommissionStatus;
}) {
  if (status === "paid") return <span className="text-xs font-semibold text-monte-deep">pagada</span>;

  return (
    <ActionForm action={markCommissionPaidAction} success="Comisión marcada como pagada">
      {(pending) => (
        <>
          <input type="hidden" name="commission_id" value={commissionId} />
          <Button
            type="submit"
            size="sm"
            disabled={pending}
            className="bg-monte-deep hover:bg-monte-deep/90"
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <BadgeCheck className="size-3.5" aria-hidden />
            )}
            {pending ? "Guardando…" : "Marcar pagada"}
          </Button>
        </>
      )}
    </ActionForm>
  );
}

type DeleteResult = { ok: boolean; id?: string; error?: string };

function ConfirmDeleteButton({
  confirmTitle,
  confirmDescription,
  actionLabel,
  icon,
  run,
}: {
  confirmTitle: string;
  confirmDescription: string;
  actionLabel: string;
  icon: ReactNode;
  run: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="lg" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
          {pending ? "Borrando…" : actionLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive"
            onClick={(e) => {
              e.preventDefault();
              startTransition(async () => {
                await run();
              });
            }}
          >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Sí, borrar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();

  const onDelete = async () => {
    const fd = new FormData();
    fd.set("property_id", propertyId);
    const res = (await deletePropertyAction(fd)) as DeleteResult;
    if (res?.ok) {
      toast.success("Casa borrada");
      router.push("/admin/casas");
      router.refresh();
    } else {
      toast.error(res?.error ?? "No se pudo borrar la casa");
    }
  };

  return (
    <ConfirmDeleteButton
      confirmTitle="¿Borrar esta casa?"
      confirmDescription="Esta acción elimina la casa y no se puede deshacer."
      actionLabel="Borrar casa"
      icon={<Trash2 className="size-4" aria-hidden />}
      run={onDelete}
    />
  );
}

export function DeleteTourButton({ tourId }: { tourId: string }) {
  const router = useRouter();

  const onDelete = async () => {
    const fd = new FormData();
    fd.set("tour_id", tourId);
    const res = (await deleteTourAction(fd)) as DeleteResult;
    if (res?.ok) {
      toast.success("Tour borrado");
      router.push("/admin/tours");
      router.refresh();
    } else {
      toast.error(res?.error ?? "No se pudo borrar el tour");
    }
  };

  return (
    <ConfirmDeleteButton
      confirmTitle="¿Borrar este tour?"
      confirmDescription="Esta acción elimina el tour y no se puede deshacer."
      actionLabel="Borrar tour"
      icon={<Trash2 className="size-4" aria-hidden />}
      run={onDelete}
    />
  );
}