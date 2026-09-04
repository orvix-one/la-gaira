"use client";

import Link from "next/link";
import type { FilaSucursal } from "@/application/sucursales";
import {
  formatMoney,
  formatNumber,
  formatShare,
  formatVariation,
} from "../format";
import { NoResults } from "../components/states";
import { VariacionBadge } from "../components/kpi-card";
import { Paginacion, ThOrdenable, useTabla } from "../components/table";

type Clave = "sucursal" | "ventas" | "unidades" | "transacciones" | "ticket" | "participacion" | "variacion";

/**
 * Tabla comparativa de sucursales (spec §9.4): ordenable, con búsqueda por
 * fila al detalle. Las sucursales sin ventas aparecen con cero.
 */
export function SucursalesTable({
  filas,
  enlacesDetalle = true,
}: {
  filas: FilaSucursal[];
  enlacesDetalle?: boolean;
}) {
  const tabla = useTabla<FilaSucursal, Clave>({
    datos: filas,
    claveInicial: "ventas",
    valorDe: (f, c) =>
      c === "sucursal"
        ? f.sucursal
        : c === "ventas"
          ? f.ventasNetas
          : c === "unidades"
            ? f.unidades
            : c === "transacciones"
              ? f.transacciones
              : c === "ticket"
                ? f.ticketPromedio
                : c === "participacion"
                  ? f.participacion
                  : f.variacionVentas,
  });

  if (filas.length === 0) return <NoResults />;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_8px_28px_rgba(23,19,19,0.05)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50/80">
            <tr>
              <ThOrdenable tabla={tabla} clave="sucursal" numerica={false}>Sucursal</ThOrdenable>
              <ThOrdenable tabla={tabla} clave="ventas">Ventas</ThOrdenable>
              <ThOrdenable tabla={tabla} clave="unidades">Unidades</ThOrdenable>
              <ThOrdenable tabla={tabla} clave="transacciones">Transacciones</ThOrdenable>
              <ThOrdenable tabla={tabla} clave="ticket">Ticket prom.</ThOrdenable>
              <ThOrdenable tabla={tabla} clave="participacion">Partic.</ThOrdenable>
              <ThOrdenable tabla={tabla} clave="variacion">Variación</ThOrdenable>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {tabla.filas.map((f) => (
              <tr key={f.code} className="hover:bg-brand-50/40">
                <td className="px-3 py-2.5">
                  {enlacesDetalle ? (
                    <Link
                      href={`/sucursales/${f.code}`}
                      className="font-medium text-brand-700 underline-offset-2 hover:underline"
                    >
                      {f.sucursal}
                    </Link>
                  ) : (
                    <span className="font-medium text-neutral-950">{f.sucursal}</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right font-medium text-neutral-950 tabular-nums">
                  {formatMoney(f.ventasNetas)}
                </td>
                <td className="px-3 py-2.5 text-right text-neutral-700 tabular-nums">
                  {formatNumber(f.unidades)}
                </td>
                <td className="px-3 py-2.5 text-right text-neutral-700 tabular-nums">
                  {formatNumber(f.transacciones)}
                </td>
                <td className="px-3 py-2.5 text-right text-neutral-700 tabular-nums">
                  {f.ticketPromedio === null ? "—" : formatMoney(f.ticketPromedio)}
                </td>
                <td className="px-3 py-2.5 text-right text-neutral-700 tabular-nums">
                  {formatShare(f.participacion)}
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
