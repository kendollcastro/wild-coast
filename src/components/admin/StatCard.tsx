"use client";

import { CountUp } from "@/components/site/CountUp";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

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
    <Card>
      <CardContent className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-mute">{label}</p>
        <p className={`tabular-nums text-3xl font-extrabold tracking-tight text-ink ${tone ?? ""}`}>
          <CountUp value={value} formatType={formatType} />
        </p>
      </CardContent>
    </Card>
  );
}