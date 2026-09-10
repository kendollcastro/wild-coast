"use client";

import type { LocalizedTour } from "@/server/domain/catalog/localize";
import { TourCard } from "./TourCard";
import { InView } from "./Reveal";

export function TourExplorer({ tours }: { tours: LocalizedTour[] }) {
  return (
    <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {tours.slice(0, 8).map((tour, i) => (
        <InView key={tour.id} delay={(i % 4) * 70}>
          <TourCard tour={tour} />
        </InView>
      ))}
    </div>
  );
}