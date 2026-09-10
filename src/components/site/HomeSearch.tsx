"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Compass, House, MapPin, Search, Users } from "lucide-react";
import { todayISO } from "@/lib/format";
import { useI18n } from "./i18n-provider";

type Kind = "casas" | "tours";

export function HomeSearch() {
  const router = useRouter();
  const { locale, dict } = useI18n();
  const [kind, setKind] = useState<Kind>("casas");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const today = todayISO();

  const go = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests) params.set("guests", guests);
    const qs = params.toString();
    const base = kind === "casas" ? "/casas" : "/tours";
    router.push(`/${locale}${base}${qs ? `?${qs}` : ""}`);
  };

  const tabs: { key: Kind; label: string; icon: typeof House }[] = [
    { key: "casas", label: dict.search.casas, icon: House },
    { key: "tours", label: dict.search.tours, icon: Compass },
  ];

  return (
    <div className="w-full rounded-3xl bg-white p-4 shadow-soft-xl sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setKind(key)}
            aria-pressed={kind === key}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
              kind === key ? "bg-coral-soft text-coral-deep" : "text-mute hover:bg-muted hover:text-ink"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className="grid items-stretch gap-3 md:grid-cols-2 lg:grid-cols-12"
      >
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3 lg:col-span-4">
          <MapPin className="size-5 shrink-0 text-coral-deep" aria-hidden />
          <p className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-mute">
              {dict.search.destination}
            </span>
            <span className="text-sm font-bold text-ink">{dict.search.destinationValue}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3 lg:col-span-4">
          <CalendarDays className="hidden size-5 shrink-0 text-coral-deep sm:block" aria-hidden />
          <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-0">
            <label className="flex min-w-0 flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-mute">{dict.search.arrival}</span>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (checkOut && e.target.value > checkOut) setCheckOut("");
                }}
                aria-label={dict.search.arrivalAria}
                className="w-full min-w-0 bg-transparent text-sm font-bold text-ink"
              />
            </label>
            <span className="mx-2 h-5 w-px shrink-0 bg-line" aria-hidden />
            <label className="flex min-w-0 flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-mute">{dict.search.departure}</span>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                aria-label={dict.search.departureAria}
                className="w-full min-w-0 bg-transparent text-sm font-bold text-ink"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3 lg:col-span-2">
          <Users className="size-5 shrink-0 text-coral-deep" aria-hidden />
          <label className="flex w-full min-w-0 flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-mute">{dict.search.guests}</span>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              aria-label={dict.search.guestsAria}
              className="w-full min-w-0 bg-transparent text-sm font-bold text-ink"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? dict.search.person.one : dict.search.person.other}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-coral-deep px-5 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:brightness-95 active:scale-[0.98] lg:col-span-2"
        >
          <Search className="size-4" aria-hidden />
          <span className="hidden md:inline">{dict.search.searchNow}</span>
          <span className="md:hidden">{dict.search.searchShort}</span>
        </button>
      </form>
    </div>
  );
}