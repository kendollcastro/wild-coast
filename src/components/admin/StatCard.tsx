"use client";

import { CountUp } from "@/components/site/CountUp";

export function StatCard({
  label,
  value,
  formatType = "int",
  tone,
}: {
  label: string;
  value: number;
  formatType?: "int" | "usd";
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-mute">{label}</p>
      <p className={`mt-2 tabular-nums text-3xl font-extrabold tracking-tight text-ink ${tone ?? ""}`}>
        <CountUp value={value} formatType={formatType} />
      </p>
    </div>
  );
}