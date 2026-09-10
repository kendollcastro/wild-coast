"use client";

import { useId } from "react";
import { useI18n } from "./i18n-provider";

export function TownTicker({ items }: { items: string[] }) {
  const titleId = useId();
  const { dict } = useI18n();
  const loop = [...items, ...items];
  return (
    <div
      role="region"
      aria-labelledby={titleId}
      className="ticker overflow-hidden bg-mar-deep py-3 text-espuma"
    >
      <h2 id={titleId} className="sr-only">
        {dict.home.ticker.aria}
      </h2>
      <div className="ticker-track">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-5 pr-5 whitespace-nowrap" aria-hidden={i >= items.length}>
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">{item}</span>
            <span className="size-1.5 rounded-full bg-pina" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}