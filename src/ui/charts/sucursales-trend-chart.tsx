"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Granularidad } from "@/domain/sales";
import type { SerieSucursal } from "@/application/sucursales";
import { formatBucketLabel, formatMoney, formatMoneyCompact } from "../format";
import { ChartVacio } from "./chart-card";

/** Paleta categórica para series múltiples (máx. 5, spec §9.4). */
const COLORES = ["#F62D29", "#171313", "#B91614", "#C87943", "#8B7D7A"];

/**
 * Evolución temporal comparada por sucursal (spec §9.4), limitada a 5
 * series para conservar legibilidad.
 */
export function SucursalesTrendChart({
  series,
  granularidad,
}: {
  series: SerieSucursal[];
  granularidad: Granularidad;
}) {
  const activas = series.filter((s) => s.puntos.some((p) => p.ventas > 0));
  if (activas.length === 0) {
    return <ChartVacio mensaje="Sin ventas en el periodo seleccionado" />;
  }

  // Une las series por periodo: { periodo, [sucursal]: ventas }.
  const periodos = activas[0].puntos.map((p) => p.periodo);
  const datos = periodos.map((periodo, i) => {
    const fila: Record<string, number | string> = {
      periodo,
      etiqueta: formatBucketLabel(periodo, granularidad),
    };
    for (const serie of activas) fila[serie.sucursal] = serie.puntos[i]?.ventas ?? 0;
    return fila;
  });

  return (
    <div className="h-64 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
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
            formatter={(value, name) => [formatMoney(Number(value)), name]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as { etiqueta?: string } | undefined;
              return p?.etiqueta ?? "";
            }}
            contentStyle={{ fontSize: 12, borderRadius: 10, borderColor: "#e7e2e1" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {activas.map((serie, i) => (
            <Line
              key={serie.code}
              type="monotone"
              dataKey={serie.sucursal}
              stroke={COLORES[i % COLORES.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
