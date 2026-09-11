import { Badge } from "@/components/ui/badge";
import type { BookingStatus, CommissionStatus, ListingStatus } from "@/server/db/schema.types";

const styles: Record<string, string> = {
  pending: "bg-pina-soft text-pina-deep",
  confirmed: "bg-monte-soft text-monte-deep",
  cancelled: "bg-destructive/10 text-destructive",
  paid: "bg-monte-soft text-monte-deep",
  active: "bg-monte-soft text-monte-deep",
  inactive: "bg-muted text-mute",
};

const labels: Record<string, string> = {
  pending: "pendiente",
  confirmed: "confirmada",
  cancelled: "cancelada",
  paid: "pagada",
  active: "activa",
  inactive: "inactiva",
};

export function StatusBadge({ status }: { status: BookingStatus | CommissionStatus | ListingStatus }) {
  return (
    <Badge variant="secondary" className={`rounded-full px-2.5 font-semibold ${styles[status] ?? "bg-muted text-mute"}`}>
      {labels[status] ?? status}
    </Badge>
  );
}