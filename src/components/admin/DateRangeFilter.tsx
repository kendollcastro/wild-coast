"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

export function DateRangeFilter({ from, to }: { from?: string; to?: string }) {
  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  }));

  const clear = () => {
    setRange({ from: undefined, to: undefined });
    requestAnimationFrame(() => {
      for (const name of ["from", "to"]) {
        const el = document.getElementsByName(name)[0] as HTMLInputElement | undefined;
        if (el) el.value = "";
      }
    });
  };

  const label = range?.from
    ? range.to
      ? `${format(range.from, "d MMM", { locale: es })} → ${format(range.to, "d MMM, yyyy", { locale: es })}`
      : format(range.from, "d MMM, yyyy", { locale: es })
    : "Rango de fechas";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className={cn("h-10 rounded-xl border-input bg-white text-sm font-semibold", range?.from && "border-coral text-ink")}
        >
          <CalendarIcon className="size-4 text-coral-deep" aria-hidden />
          {label}
          {range?.from && (
            <X
              className="size-3.5 text-mute hover:text-ink"
              aria-hidden
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-fit p-0">
        <Calendar
          mode="range"
          selected={range}
          onSelect={(r) => {
            setRange(r);
            requestAnimationFrame(() => {
              for (const [name, value] of [
                ["from", r?.from && isValid(r.from) ? r.from.toISOString().slice(0, 10) : ""],
                ["to", r?.to && isValid(r.to) ? r.to.toISOString().slice(0, 10) : ""],
              ] as const) {
                const el = document.getElementsByName(name)[0] as HTMLInputElement | undefined;
                if (el) el.value = value;
              }
            });
          }}
          numberOfMonths={2}
          locale={es}
          defaultMonth={range?.from}
        />
      </PopoverContent>
    </Popover>
  );
}