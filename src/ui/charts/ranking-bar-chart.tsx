"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney, formatMoneyCompact } from "../format";
import { ChartVacio } from "./chart-card";

/**
 * Barras horizontales de ranking (ventas por sucursal, top productos),
 * ordenadas de mayor a menor (spec §9.3). El elemento resaltado
 * (`highlight`) se dibuja con el color de acento.
 */
export function RankingBarChart({
  datos,
  highlight,
}: {
  datos: Array<{ nombre: string; valor: number }>;
  highlight?: string;
}) {
  const visibles = datos.filter((d) => d.valor > 0);
  if (visibles.length === 0) {
    return <ChartVacio mensaje="Sin datos en el periodo seleccionado" />;
  }

  return (
    <div className="w-full" style={{ height: Math.max(200, visibles.length * 40) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={visibles} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e2e1" horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#716765" }}
            tickFormatter={(v: number) => formatMoneyCompact(v)}
          />
          <YAxis
            type="category"
            dataKey="nombre"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#302a29" }}
            width={170}
          />
          <Tooltip
            formatter={(value) => [formatMoney(Number(value)), "Ventas netas"]}
            contentStyle={{ fontSize: 12, borderRadius: 10, borderColor: "#e7e2e1" }}
          />
          <Bar dataKey="valor" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {visibles.map((d) => (
              <Cell key={d.nombre} fill={d.nombre === highlight ? "#F62D29" : "#746967"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
