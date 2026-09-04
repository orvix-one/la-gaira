import type { ReactNode } from "react";

/** Estados obligatorios (spec §10.4): vacío, sin resultados, error. */

export function EmptyState({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
      <span className="mb-4 h-1 w-10 rounded-full bg-brand-500" aria-hidden="true" />
      <p className="text-base font-semibold text-neutral-800">{titulo}</p>
      {descripcion ? <p className="mt-1 max-w-md text-sm text-neutral-500">{descripcion}</p> : null}
      {accion ? <div className="mt-4">{accion}</div> : null}
    </div>
  );
}

export function NoResults({ onLimpiar }: { onLimpiar?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <p className="text-sm font-medium text-neutral-800">Sin resultados para los filtros actuales</p>
      <p className="mt-1 text-sm text-neutral-500">Prueba ampliar el periodo o quitar filtros.</p>
      {onLimpiar ? (
        <button
          type="button"
          onClick={onLimpiar}
          className="mt-3 min-h-11 rounded-lg border border-brand-200 bg-brand-50 px-4 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100"
        >
          Limpiar filtros
        </button>
      ) : null}
    </div>
  );
}

/** Skeletons para `loading.tsx` (spec §10.4: sin saltos severos de layout). */
export function SkeletonKpis({ cantidad = 4 }: { cantidad?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="h-3 w-20 rounded bg-neutral-200" />
          <div className="mt-3 h-7 w-28 rounded bg-neutral-200" />
          <div className="mt-2 h-4 w-16 rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonBloque({ alto = "h-64" }: { alto?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-neutral-200 bg-neutral-100 ${alto}`} />
  );
}
