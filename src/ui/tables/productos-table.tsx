"use client";

import { useMemo, useState } from "react";
import type { FilaProducto } from "@/application/productos";
import {
  formatMoney,
  formatNumber,
  formatShare,
  formatVariation,
} from "../format";
import { NoResults } from "../components/states";
import { VariacionBadge } from "../components/kpi-card";
import { Paginacion, ThOrdenable, useTabla } from "../components/table";

type Clave = "nombre" | "categoria" | "ventas" | "unidades" | "precioMedio" | "participacion" | "variacion";

const OPCIONES_TOP = [10, 20, 50] as const;

/**
 * Tabla de productos (spec §9.5): búsqueda por código/nombre, selector
 * Top N (10/20/50), ordenación y paginación. La búsqueda y el Top N son
 * de cliente; los filtros globales (periodo/sucursal) viajan en la URL.
 */
export function ProductosTable({ filas }: { filas: FilaProducto[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [topN, setTopN] = useState<number | null>(null);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const base = q
      ? filas.filter(
          (f) => f.nombre.toLowerCase().includes(q) || f.code.toLowerCase().includes(q),
        )
      : filas;
    const ordenadas = [...base].sort((a, b) => b.ventas - a.ventas);
    return topN === null ? ordenadas : ordenadas.slice(0, topN);
  }, [filas, busqueda, topN]);

  const tabla = useTabla<FilaProducto, Clave>({
    datos: filtradas,
    claveInicial: "ventas",
    valorDe: (f, c) =>
      c === "nombre"
        ? f.nombre
        : c === "categoria"
          ? f.categoria
          : c === "ventas"
            ? f.ventas
            : c === "unidades"
              ? f.unidades
              : c === "precioMedio"
                ? f.precioMedio
                : c === "participacion"
                  ? f.participacion
                  : f.variacionVentas,
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_8px_28px_rgba(23,19,19,0.05)]">
      <div className="flex flex-col gap-3 border-b border-neutral-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar producto por código o nombre"
          className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm transition-colors focus:border-brand-500 sm:max-w-xs"
        />
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span className="text-xs font-medium">Top</span>
          {OPCIONES_TOP.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setTopN((actual) => (actual === n ? null : n))}
              aria-pressed={topN === n}
              className={`min-h-11 min-w-11 rounded-lg border px-3 text-sm font-medium sm:min-h-9 ${
                topN === n
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-neutral-300 text-neutral-600 hover:border-brand-200 hover:bg-brand-50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {filtradas.length === 0 ? (
        <NoResults
          onLimpiar={() => {
            setBusqueda("");
            setTopN(null);
          }}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50/80">
                <tr>
                  <ThOrdenable tabla={tabla} clave="nombre" numerica={false}>Producto</ThOrdenable>
                  <ThOrdenable tabla={tabla} clave="categoria" numerica={false}>Categoría</ThOrdenable>
                  <ThOrdenable tabla={tabla} clave="ventas">Ventas</ThOrdenable>
                  <ThOrdenable tabla={tabla} clave="unidades">Unidades</ThOrdenable>
                  <ThOrdenable tabla={tabla} clave="precioMedio">Precio medio</ThOrdenable>
                  <ThOrdenable tabla={tabla} clave="participacion">Partic.</ThOrdenable>
                  <ThOrdenable tabla={tabla} clave="variacion">Variación</ThOrdenable>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {tabla.filas.map((f) => (
                  <tr key={f.code} className="hover:bg-brand-50/40">
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-neutral-950">{f.nombre}</p>
                      <p className="text-xs text-neutral-400">{f.code}</p>
                    </td>
                    <td className="px-3 py-2.5 text-neutral-700">{f.categoria}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-neutral-950 tabular-nums">
                      {formatMoney(f.ventas)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-neutral-700 tabular-nums">
                      {formatNumber(f.unidades)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-neutral-700 tabular-nums">
                      {f.precioMedio === null ? "—" : formatMoney(f.precioMedio)}
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
        </>
      )}
    </div>
  );
}
