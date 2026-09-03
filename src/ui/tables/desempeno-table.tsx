"use client";

import type { FilaDesempeno } from "@/application/ventas-general";
import type { Granularidad } from "@/domain/sales";
import {
  formatBucketLabel,
  formatMoney,
  formatNumber,
  formatVariation,
} from "../format";
import { NoResults } from "../components/states";
import { VariacionBadge } from "../components/kpi-card";
import { Paginacion, ThOrdenable, useTabla } from "../components/table";

type Clave = "periodo" | "sucursal" | "ventas" | "unidades" | "transacciones" | "variacion";

/** Tabla de desempeño de Ventas General (spec §9.3): periodo × sucursal. */
export function DesempenoTable({
  filas,
  granularidad,
}: {
  filas: FilaDesempeno[];
  granularidad: Granularidad;
}) {
  const tabla = useTabla<FilaDesempeno, Clave>({
    datos: filas,
    claveInicial: "periodo",
    direccionInicial: "asc",
    valorDe: (f, c) =>
      c === "periodo"
        ? f.periodo
        : c === "sucursal"
          ? f.sucursal
          : c === "ventas"
            ? f.ventas
            : c === "unidades"
              ? f.unidades
              : c === "transacciones"
                ? f.transacciones
                : f.variacionVentas,
  });

  if (filas.length === 0) return <NoResults />;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_8px_28px_rgba(23,19,19,0.05)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50/80">
            <tr>
              <ThOrdenable tabla={tabla} clave="periodo" numerica={false}>
                Periodo
              </ThOrdenable>
              <ThOrdenable tabla={tabla} clave="sucursal" numerica={false}>
                Sucursal
              </ThOrdenable>
              <ThOrdenable tabla={tabla} clave="ventas">Ventas</ThOrdenable>
              <ThOrdenable tabla={tabla} clave="unidades">Unidades</ThOrdenable>
              <ThOrdenable tabla={tabla} clave="transacciones">Transacciones</ThOrdenable>
              <ThOrdenable tabla={tabla} clave="variacion">Variación</ThOrdenable>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {tabla.filas.map((f) => (
              <tr key={`${f.periodo}-${f.sucursalCode}`} className="hover:bg-brand-50/40">
                <td className="px-3 py-2.5 whitespace-nowrap text-neutral-700">
                  {formatBucketLabel(f.periodo, granularidad)}
                </td>
                <td className="px-3 py-2.5 text-neutral-700">{f.sucursal}</td>
                <td className="px-3 py-2.5 text-right font-medium text-neutral-950 tabular-nums">
                  {formatMoney(f.ventas)}
                </td>
                <td className="px-3 py-2.5 text-right text-neutral-700 tabular-nums">
                  {formatNumber(f.unidades)}
                </td>
                <td className="px-3 py-2.5 text-right text-neutral-700 tabular-nums">
                  {formatNumber(f.transacciones)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <VariacionBadge
                    valor={formatVariation(f.variacionVentas)}
                    direccion={
                      f.variacionVentas === null
                        ? "neutral"
                        : f.variacionVentas > 0
                          ? "sube"
                          : f.variacionVentas < 0
                            ? "baja"
                            : "neutral"
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginacion
        pagina={tabla.pagina}
        totalPaginas={tabla.totalPaginas}
        totalFilas={tabla.totalFilas}
        onIr={tabla.irAPagina}
      />
    </div>
  );
}
