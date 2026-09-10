"use client";

import { useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, BadgeCheck } from "lucide-react";
import { updateBookingStatusAction, markCommissionPaidAction } from "@/app/admin/actions";
import { deletePropertyAction, deleteTourAction } from "@/app/admin/catalog-actions";
import type { BookingStatus, CommissionStatus } from "@/server/db/schema.types";

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
          <select
            name="status"
            defaultValue={status}
            aria-label="Cambiar estado de la reserva"
            className="h-8 rounded-lg border border-line bg-white px-2 text-xs text-ink focus:border-coral"
          >
            <option value="pending">pendiente</option>
            <option value="confirmed">confirmada</option>
            <option value="cancelled">cancelada</option>
          </select>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-monte-deep disabled:opacity-60"
          >
            {pending && <Loader2 className="size-3 animate-spin" aria-hidden />}
            ok
          </button>
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
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full bg-monte-deep px-3 py-1.5 text-xs font-semibold text-white shadow-soft transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-3 animate-spin" aria-hidden />
            ) : (
              <BadgeCheck className="size-3.5" aria-hidden />
            )}
            {pending ? "Guardando…" : "Marcar pagada"}
          </button>
        </>
      )}
    </ActionForm>
  );
}

type DeleteResult = { ok: boolean; id?: string; error?: string };

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onDelete = () => {
    if (!confirm("¿Borrar esta casa? Esta acción no se puede deshacer.")) return;
    const fd = new FormData();
    fd.set("property_id", propertyId);
    startTransition(async () => {
      const res = (await deletePropertyAction(fd)) as DeleteResult;
      if (res?.ok) {
        toast.success("Casa borrada");
        router.push("/admin/casas");
        router.refresh();
      } else {
        toast.error(res?.error ?? "No se pudo borrar la casa");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-rojo/30 bg-white px-4 text-sm font-semibold text-rojo-deep transition hover:bg-rojo/10 disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? "Borrando…" : "Borrar casa"}
    </button>
  );
}

export function DeleteTourButton({ tourId }: { tourId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onDelete = () => {
    if (!confirm("¿Borrar este tour? Esta acción no se puede deshacer.")) return;
    const fd = new FormData();
    fd.set("tour_id", tourId);
    startTransition(async () => {
      const res = (await deleteTourAction(fd)) as DeleteResult;
      if (res?.ok) {
        toast.success("Tour borrado");
        router.push("/admin/tours");
        router.refresh();
      } else {
        toast.error(res?.error ?? "No se pudo borrar el tour");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-rojo/30 bg-white px-4 text-sm font-semibold text-rojo-deep transition hover:bg-rojo/10 disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? "Borrando…" : "Borrar tour"}
    </button>
  );
}