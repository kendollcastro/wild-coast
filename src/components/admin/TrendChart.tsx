"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config: ChartConfig = {
  count: { label: "Reservas", color: "#f54a00" },
};

export function TrendChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ChartContainer config={config} className="h-40 w-full" initialDimension={{ width: 600, height: 160 }}>
      <BarChart data={data} accessibilityLayer margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v: string) => v.slice(8, 10)}
          className="text-[11px]"
        />
        <YAxis
          allowDecimals={false}
          width={28}
          tickLine={false}
          axisLine={false}
          className="text-[11px]"
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 2, 2]} maxBarSize={28} />
      </BarChart>
    </ChartContainer>
  );
}