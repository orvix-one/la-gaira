/**
 * Tarjeta de KPI (spec §9.3): valor principal + variación vs. periodo
 * anterior. La variación usa flecha + texto además del color (spec §10.2:
 * el color no es el único canal).
 */
export function KpiCard({
  titulo,
  valor,
  variacion,
  ayuda,
}: {
  titulo: string;
  valor: string;
  /** Variación ya formateada ("+12,4 %") o "—". */
  variacion?: string;
  /** Dirección para flecha y color: sube, baja o neutral/sin dato. */
  ayuda?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(23,19,19,0.05)] sm:p-5">
      <span className="absolute inset-y-0 left-0 w-1 bg-brand-500" aria-hidden="true" />
      <p className="text-xs font-semibold tracking-[0.1em] text-neutral-500 uppercase">{titulo}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950 tabular-nums">{valor}</p>
      <div className="mt-1 flex items-center gap-2">
        {variacion !== undefined ? (
          <VariacionBadge valor={variacion} direccion={direccionDesde(variacion)} />
        ) : null}
        {ayuda ? <span className="text-xs text-neutral-400">{ayuda}</span> : null}
      </div>
    </div>
  );
}

function direccionDesde(variacion: string): "sube" | "baja" | "neutral" {
  if (variacion.startsWith("+")) return "sube";
  if (variacion.startsWith("-")) return "baja";
  return "neutral";
}

export function VariacionBadge({
  valor,
  direccion,
}: {
  valor: string;
  direccion: "sube" | "baja" | "neutral";
}) {
  const estilos =
    direccion === "sube"
      ? "bg-emerald-50 text-emerald-700"
      : direccion === "baja"
        ? "bg-brand-50 text-brand-700"
        : "bg-neutral-100 text-neutral-500";
  const flecha = direccion === "sube" ? "▲" : direccion === "baja" ? "▼" : "";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${estilos}`}
      title="Variación vs. periodo anterior de igual duración"
    >
      {flecha ? <span aria-hidden="true">{flecha}</span> : null}
      {valor}
    </span>
  );
}
