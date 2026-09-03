"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney, formatShare } from "../format";
import { ChartVacio } from "./chart-card";

const COLORES = ["#F62D29", "#171313", "#B91614", "#C87943", "#8B7D7A", "#E58A87", "#5B2625"];

/**
 * Distribución por categoría (spec §9.5). El porcentaje aparece en la
 * leyenda/tooltip: el color nunca es el único canal (spec §10.2).
 */
export function ShareDonutChart({
  datos,
}: {
  datos: Array<{ nombre: string; valor: number; participacion: number | null }>;
}) {
  const visibles = datos.filter((d) => d.valor > 0);
  if (visibles.length === 0) {
    return <ChartVacio mensaje="Sin datos en el periodo seleccionado" />;
  }

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={visibles}
            dataKey="valor"
            nameKey="nombre"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
            strokeWidth={2}
          >
            {visibles.map((d, i) => (
              <Cell key={d.nombre} fill={COLORES[i % COLORES.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, item) => [
              `${formatMoney(Number(value))} (${formatShare((item.payload as { participacion: number | null }).participacion)})`,
              name,
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 10, borderColor: "#e7e2e1" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value, entry) => {
              const p = (entry.payload as { participacion?: number | null }).participacion;
              return `${value} — ${formatShare(p ?? null)}`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
