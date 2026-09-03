import type { ReactNode } from "react";
import type { FiltrosGlobales } from "@/domain/sales";
import { formatRango } from "../format";

/**
 * Encabezado de vista: título + periodo activo + moneda (RF-025: la
 * interfaz muestra periodo, moneda y última actualización — la última
 * actualización vive en el shell y en el resumen de datos).
 */
export function PageHeader({
  titulo,
  descripcion,
  filtros,
  acciones,
}: {
  titulo: string;
  descripcion?: string;
  filtros?: FiltrosGlobales;
  acciones?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
      <div className="flex gap-3">
        <span className="mt-1 h-9 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
        <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl">{titulo}</h1>
        {descripcion ? <p className="mt-1 text-sm text-neutral-500">{descripcion}</p> : null}
        {filtros ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-neutral-950 px-3 py-1 font-medium text-white">
              {formatRango(filtros.rango)}
            </span>
            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 font-medium text-neutral-600">
              Moneda: BOB
            </span>
          </div>
        ) : null}
        </div>
      </div>
      {acciones ? <div>{acciones}</div> : null}
    </div>
  );
}
