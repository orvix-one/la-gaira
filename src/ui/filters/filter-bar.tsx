"use client";

import { useQueryStates } from "nuqs";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { CoberturaDatos, Sucursal } from "@/domain/sales";
import { filterParsers } from "./filter-parsers";
import { formatDateShort } from "../format";
import { IconFiltro } from "../components/icons";

/**
 * Barra persistente de filtros globales (spec §10.1): periodo + sucursal.
 * - Estado en la URL vía nuqs (RF-027), `shallow: false` para que el
 *   servidor recalcule los datos.
 * - En móvil se colapsa en un panel con chips de filtros activos (§10.3).
 * - En el detalle de sucursal se oculta el selector (la página ya es una
 *   sucursal).
 */
export function FilterBar({
  sucursales,
  cobertura,
}: {
  sucursales: Sucursal[];
  cobertura: CoberturaDatos;
}) {
  const pathname = usePathname();
  const esDetalleSucursal = pathname.startsWith("/sucursales/");
  const [abierto, setAbierto] = useState(false);

  const [filtros, setFiltros] = useQueryStates(filterParsers, {
    shallow: false,
    history: "replace",
  });

  if (pathname.startsWith("/tableros/")) return null;

  const activos = [filtros.desde, filtros.hasta, filtros.sucursal].filter(Boolean).length;
  const sucursalActiva = sucursales.find((s) => s.code === filtros.sucursal);

  const limpiar = () => setFiltros({ desde: null, hasta: null, sucursal: null });

  const controles = (
    <>
      <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
        Desde
        <input
          type="date"
          value={filtros.desde ?? ""}
          min={cobertura.desde ?? undefined}
          max={cobertura.hasta ?? undefined}
          onChange={(e) => setFiltros({ desde: e.target.value || null })}
          className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 transition-colors focus:border-brand-500 sm:min-h-9"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
        Hasta
        <input
          type="date"
          value={filtros.hasta ?? ""}
          min={filtros.desde ?? cobertura.desde ?? undefined}
          max={cobertura.hasta ?? undefined}
          onChange={(e) => setFiltros({ hasta: e.target.value || null })}
          className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 transition-colors focus:border-brand-500 sm:min-h-9"
        />
      </label>
      {!esDetalleSucursal ? (
        <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
          Sucursal
          <select
            value={filtros.sucursal ?? ""}
            onChange={(e) => setFiltros({ sucursal: e.target.value || null })}
            className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 transition-colors focus:border-brand-500 sm:min-h-9"
          >
            <option value="">Todas las sucursales</option>
            {sucursales.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {activos > 0 ? (
        <button
          type="button"
          onClick={limpiar}
          className="min-h-11 rounded-lg border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 lg:self-end lg:min-h-9"
        >
          Limpiar
        </button>
      ) : null}
    </>
  );

  return (
    <div className="border-b border-neutral-200 bg-white/95 shadow-[0_1px_0_rgba(23,19,19,0.03)] backdrop-blur">
      {/* Escritorio: área persistente (spec §10.1). */}
      <div className="hidden items-end gap-3 px-6 py-3 lg:flex">{controles}</div>

      {/* Móvil: botón + panel con chips (spec §10.3). */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="flex min-h-11 w-full items-center gap-2 px-4 text-sm font-medium text-neutral-700"
        >
          <IconFiltro className="h-4 w-4" />
          Filtros
          {activos > 0 ? (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">
              {activos}
            </span>
          ) : null}
        </button>
        {activos > 0 && !abierto ? (
          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {filtros.desde || filtros.hasta ? (
              <Chip>
                {formatDateShort(filtros.desde ?? cobertura.desde ?? "")} –{" "}
                {formatDateShort(filtros.hasta ?? cobertura.hasta ?? "")}
              </Chip>
            ) : null}
            {sucursalActiva ? <Chip>{sucursalActiva.name}</Chip> : null}
          </div>
        ) : null}
        {abierto ? (
          <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-3">
            {controles}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
      {children}
    </span>
  );
}
