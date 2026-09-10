"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { exportBookingsCsvAction } from "@/app/admin/reporting-actions";

export function ExportCsvButton() {
  const [pending, startTransition] = useTransition();

  const onExport = () => {
    startTransition(async () => {
      const csv = await exportBookingsCsvAction();
      if (!csv) return;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reservas-jaco-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <button
      type="button"
      onClick={onExport}
      disabled={pending}
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-muted/40 disabled:opacity-60"
    >
      <Download className="size-4" aria-hidden />
      {pending ? "Generando…" : "Exportar CSV"}
    </button>
  );
}