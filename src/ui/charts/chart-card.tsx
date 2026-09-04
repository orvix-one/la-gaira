import type { ReactNode } from "react";

/**
 * Tarjeta contenedora de gráfico: título descriptivo, unidad y estado
 * vacío (spec §10.2). El contenido es un chart de `src/ui/charts`.
 */
export function ChartCard({
  titulo,
  descripcion,
  children,
  className,
  metricaId,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  className?: string;
  /** Identificador estable usado por compartir y exportar selectivamente. */
  metricaId?: string;
}) {
  return (
    <section
      data-dashboard-metric={metricaId}
      className={`rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(23,19,19,0.05)] sm:p-5 ${className ?? ""}`}
    >
      <header className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-950">{titulo}</h3>
        {descripcion ? <p className="mt-0.5 text-xs text-neutral-500">{descripcion}</p> : null}
      </header>
      {children}
    </section>
  );
}

/** Estado vacío de un gráfico (spec §10.4). */
export function ChartVacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 text-sm text-neutral-500">
      {mensaje}
    </div>
  );
}
