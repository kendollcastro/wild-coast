"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import { List, MapPin, Search, SlidersHorizontal } from "lucide-react";
import type { LocalizedProperty } from "@/server/domain/catalog/localize";
import { formatDayShort } from "@/lib/format";
import { useI18n } from "./i18n-provider";
import { PropertyCard } from "./PropertyCard";
import { InView } from "./Reveal";

const PropertyMap = dynamic(() => import("./PropertyMap").then((m) => m.PropertyMap), {
  ssr: false,
  loading: () => <div className="h-[60vh] animate-pulse rounded-2xl bg-muted" />,
});

type SortKey = "relevance" | "price-asc" | "price-desc" | "capacity";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function readSearch() {
  const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const q = params.get("q") ?? "";
  const checkIn = params.get("check_in") ?? "";
  const checkOut = params.get("check_out") ?? "";
  const g = Number.parseInt(params.get("guests") ?? "", 10);
  const hasDates = DATE_RE.test(checkIn) && DATE_RE.test(checkOut);
  const minGuests = Number.isFinite(g) && g >= 2 ? g : 0;
  return { q, checkIn, checkOut, hasDates, minGuests };
}

export function PropertyExplorer({ properties }: { properties: LocalizedProperty[] }) {
  const { locale, dict } = useI18n();
  const t = dict.explorer.property;
  const listT = dict.casas.list;
  const initial = useMemo(() => readSearch(), []);
  const [query, setQuery] = useState(initial.q);
  const [minGuests, setMinGuests] = useState(initial.minGuests);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [view, setView] = useState<"list" | "map">("list");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = properties.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.location_label.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false);
      const matchesGuests = minGuests === 0 || p.capacity >= minGuests;
      return matchesQuery && matchesGuests;
    });

    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price_per_night - b.price_per_night);
    if (sort === "price-desc") sorted.sort((a, b) => b.price_per_night - a.price_per_night);
    if (sort === "capacity") sorted.sort((a, b) => b.capacity - a.capacity);
    return sorted;
  }, [properties, query, minGuests, sort]);

  const hasFilters = query.trim() !== "" || minGuests > 0;

  const tabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    setView((v) => (v === "list" ? "map" : "list"));
  };

  const resultsLabel = `${results.length} ${results.length === 1 ? t.casa.one : t.casa.other}${
    properties.length !== results.length ? ` ${t.of} ${properties.length}` : ""
  }`;

  return (
    <>
      {initial.hasDates && (
        <p className="mb-6 flex flex-wrap items-center gap-1.5 rounded-full bg-coral-soft px-3.5 py-1.5 text-sm font-semibold text-coral-deep">
          {listT.seeking
            .replace("{a}", formatDayShort(initial.checkIn, locale))
            .replace("{b}", formatDayShort(initial.checkOut, locale))}
          {initial.minGuests > 0 && (
            <>
              {" "}· {initial.minGuests}{" "}
              {initial.minGuests === 1 ? listT.person.one : listT.person.other}
            </>
          )}
        </p>
      )}

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-60 flex-1 items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 shadow-soft focus-within:border-coral focus-within:ring-2 focus-within:ring-coral">
            <Search className="size-4 text-mute" />
            <span className="sr-only">{t.searchAria}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-mute"
            />
          </label>

          <select
            value={minGuests}
            onChange={(e) => setMinGuests(Number(e.target.value))}
            aria-label={t.filterAria}
            className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-soft"
          >
            <option value={0}>{t.any}</option>
            {[2, 4, 6, 8].map((n) => (
              <option key={n} value={n}>
                {n}+ {t.plus}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label={t.sortAria}
            className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-soft"
          >
            <option value="relevance">{t.sort.relevance}</option>
            <option value="price-asc">{t.sort.priceAsc}</option>
            <option value="price-desc">{t.sort.priceDesc}</option>
            <option value="capacity">{t.sort.capacity}</option>
          </select>

          <div
            role="tablist"
            aria-label={t.viewAria}
            className="rounded-full border border-line bg-white p-1 shadow-soft"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "list"}
              onKeyDown={tabKeyDown}
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                view === "list" ? "bg-ink text-white" : "text-mute hover:text-ink"
              }`}
            >
              <List className="size-4" aria-hidden />
              <span className="hidden sm:inline">{t.list}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "map"}
              onKeyDown={tabKeyDown}
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                view === "map" ? "bg-ink text-white" : "text-mute hover:text-ink"
              }`}
            >
              <MapPin className="size-4" aria-hidden />
              <span className="hidden sm:inline">{t.map}</span>
            </button>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-mute">
          {hasFilters && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-coral-soft tabular-nums text-[11px] font-bold text-coral-deep">
              {results.length}
            </span>
          )}
          {resultsLabel}
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setMinGuests(0);
              }}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-coral-deep hover:underline"
            >
              <SlidersHorizontal className="size-3" /> {t.clear}
            </button>
          )}
        </p>
      </div>

      {view === "list" ? (
        results.length > 0 ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((property, i) => (
              <InView key={property.id} delay={(i % 3) * 70}>
                <PropertyCard
                  property={property}
                  checkIn={initial.hasDates ? initial.checkIn : ""}
                  checkOut={initial.hasDates ? initial.checkOut : ""}
                />
              </InView>
            ))}
          </div>
        ) : (
          <p className="max-w-md text-sm text-muted-foreground">{t.empty}</p>
        )
      ) : (
        <PropertyMap properties={results} />
      )}
    </>
  );
}