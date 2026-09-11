"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { exportBookingsCsvAction } from "@/app/admin/reporting-actions";
import { Button } from "@/components/ui/button";

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
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onExport}
      disabled={pending}
    >
      <Download className="size-4" aria-hidden />
      {pending ? "Generando…" : "Exportar CSV"}
    </Button>
  );
}