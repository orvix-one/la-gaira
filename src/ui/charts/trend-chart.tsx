"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Granularidad } from "@/domain/sales";
import { formatBucketLabel, formatMoney, formatMoneyCompact } from "../format";
import { ChartVacio } from "./chart-card";

/**
 * Serie temporal de ventas (spec §9.3). Wrapper propio sobre Recharts:
 * la librería no sale de `src/ui/charts`.
 */
export function TrendChart({
  datos,
  granularidad,
}: {
  datos: Array<{ periodo: string; ventas: number }>;
  granularidad: Granularidad;
}) {
  if (datos.every((p) => p.ventas === 0)) {
    return <ChartVacio mensaje="Sin ventas en el periodo seleccionado" />;
  }
  const puntos = datos.map((p) => ({
    ...p,
    etiqueta: formatBucketLabel(p.periodo, granularidad),
  }));

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={puntos} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F62D29" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#F62D29" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e2e1" vertical={false} />
          <XAxis
            dataKey="etiqueta"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#716765" }}
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#716765" }}
            tickFormatter={(v: number) => formatMoneyCompact(v)}
            width={72}
          />
          <Tooltip
            formatter={(value) => [formatMoney(Number(value)), "Ventas netas"]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as { etiqueta?: string } | undefined;
              return p?.etiqueta ?? "";
            }}
            contentStyle={{ fontSize: 12, borderRadius: 10, borderColor: "#e7e2e1" }}
          />
          <Area
            type="monotone"
            dataKey="ventas"
            stroke="#F62D29"
            strokeWidth={2}
            fill="url(#trendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
