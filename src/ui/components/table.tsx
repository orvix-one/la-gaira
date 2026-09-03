"use client";

import { useMemo, useState } from "react";

/**
 * Estado compartido de tablas: ordenación por columna y paginación
 * (RF-028). Las tablas nunca renderizan miles de filas a la vez (RNF-005).
 */

export type Direccion = "asc" | "desc";

export interface Tabla<T, K extends string> {
  filas: T[];
  pagina: number;
  totalPaginas: number;
  totalFilas: number;
  claveOrden: K;
  direccion: Direccion;
  alternarOrden: (clave: K) => void;
  irAPagina: (pagina: number) => void;
}

export function useTabla<T, K extends string>({
  datos,
  valorDe,
  claveInicial,
  direccionInicial = "desc",
  porPagina = 10,
}: {
  datos: readonly T[];
  valorDe: (fila: T, clave: K) => number | string | null;
  claveInicial: K;
  direccionInicial?: Direccion;
  porPagina?: number;
}): Tabla<T, K> {
  const [claveOrden, setClaveOrden] = useState<K>(claveInicial);
  const [direccion, setDireccion] = useState<Direccion>(direccionInicial);
  const [pagina, setPagina] = useState(1);

  const ordenadas = useMemo(() => {
    const factor = direccion === "asc" ? 1 : -1;
    return [...datos].sort((a, b) => {
      const va = valorDe(a, claveOrden);
      const vb = valorDe(b, claveOrden);
      if (va === null && vb === null) return 0;
      if (va === null) return 1; // nulos siempre al final
      if (vb === null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * factor;
      return String(va).localeCompare(String(vb), "es") * factor;
    });
  }, [datos, valorDe, claveOrden, direccion]);

  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / porPagina));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const filas = ordenadas.slice((paginaSegura - 1) * porPagina, paginaSegura * porPagina);

  return {
    filas,
    pagina: paginaSegura,
    totalPaginas,
    totalFilas: ordenadas.length,
    claveOrden,
    direccion,
    alternarOrden: (clave) => {
      if (clave === claveOrden) {
        setDireccion((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setClaveOrden(clave);
        setDireccion("desc");
      }
      setPagina(1);
    },
    irAPagina: setPagina,
  };
}

/** Encabezado ordenable accesible. */
export function ThOrdenable<K extends string>({
  tabla,
  clave,
  children,
  numerica = true,
}: {
  tabla: Pick<Tabla<unknown, K>, "claveOrden" | "direccion" | "alternarOrden">;
  clave: K;
  children: React.ReactNode;
  numerica?: boolean;
}) {
  const activa = tabla.claveOrden === clave;
  return (
    <th
      scope="col"
      aria-sort={activa ? (tabla.direccion === "asc" ? "ascending" : "descending") : "none"}
      className={`px-3 py-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase ${
        numerica ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => tabla.alternarOrden(clave)}
        className="inline-flex min-h-11 items-center gap-1 transition-colors hover:text-neutral-900 sm:min-h-0"
      >
        {children}
        <span aria-hidden="true" className={activa ? "text-brand-600" : "text-neutral-300"}>
          {activa ? (tabla.direccion === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

/** Paginación con objetivos táctiles ≥ 44 px (spec §10.3). */
export function Paginacion({
  pagina,
  totalPaginas,
  totalFilas,
  onIr,
}: {
  pagina: number;
  totalPaginas: number;
  totalFilas: number;
  onIr: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-2 border-t border-neutral-200 px-3 py-2 text-sm text-neutral-600">
      <span className="text-xs sm:text-sm">
        Página {pagina} de {totalPaginas} · {totalFilas} filas
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pagina <= 1}
          onClick={() => onIr(pagina - 1)}
          className="min-h-11 rounded-lg border border-neutral-300 px-3 text-sm font-medium transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40 sm:min-h-9"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={pagina >= totalPaginas}
          onClick={() => onIr(pagina + 1)}
          className="min-h-11 rounded-lg border border-neutral-300 px-3 text-sm font-medium transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40 sm:min-h-9"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
