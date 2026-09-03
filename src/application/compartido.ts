import {
  bucketsDelRango,
  claveBucket,
  granularidadPara,
  lineasAnaliticas,
  rangoAnterior,
  ticketPromedio,
  transacciones,
  unidadesNetas,
  ventasNetas,
  type FactVentaLinea,
  type FiltrosGlobales,
  type Granularidad,
} from "@/domain/sales";

/** Utilidades compartidas por los casos de uso de analítica. */

export function filtrarPorSucursal(
  lineas: readonly FactVentaLinea[],
  filtros: FiltrosGlobales,
): FactVentaLinea[] {
  if (!filtros.sucursal) return [...lineas];
  return lineas.filter((l) => l.branchCode === filtros.sucursal);
}

export interface KpiBase {
  ventasNetas: number;
  unidades: number;
  transacciones: number;
  ticketPromedio: number | null;
}

/** KPIs núcleo (spec §9.2) sobre un conjunto de líneas ya filtrado. */
export function kpisDe(lineas: readonly FactVentaLinea[]): KpiBase {
  const ventas = ventasNetas(lineas);
  const txns = transacciones(lineas);
  return {
    ventasNetas: ventas,
    unidades: unidadesNetas(lineas),
    transacciones: txns,
    ticketPromedio: ticketPromedio(ventas, txns),
  };
}

export interface PuntoTemporal {
  periodo: string;
  ventas: number;
}

export interface SerieTemporal {
  granularidad: Granularidad;
  puntos: PuntoTemporal[];
}

/**
 * Serie temporal de ventas netas sin huecos: cada bucket del rango aparece
 * aunque no tenga ventas. La deduplicación por `source_transaction_id` se
 * hace dentro de cada bucket (las líneas de una operación comparten fecha).
 */
export function serieTemporalDe(
  lineas: readonly FactVentaLinea[],
  filtros: FiltrosGlobales,
): SerieTemporal {
  const granularidad = granularidadPara(filtros.rango);
  const buckets = bucketsDelRango(filtros.rango, granularidad);
  const porBucket = new Map<string, { vistos: Set<string>; ventas: number }>(
    buckets.map((b) => [b, { vistos: new Set(), ventas: 0 }]),
  );

  for (const linea of lineasAnaliticas(lineas)) {
    const clave = claveBucket(linea.saleDate, granularidad);
    const bucket = porBucket.get(clave);
    if (!bucket || bucket.vistos.has(linea.sourceTransactionId)) continue;
    bucket.vistos.add(linea.sourceTransactionId);
    bucket.ventas += linea.invoiceTotalAmount;
  }

  return {
    granularidad,
    puntos: buckets.map((b) => ({ periodo: b, ventas: porBucket.get(b)?.ventas ?? 0 })),
  };
}

/** Par de conjuntos actual/anterior para los cálculos con variación. */
export async function cargarActualYAnterior(
  fetchLineas: (rango: FiltrosGlobales["rango"]) => Promise<FactVentaLinea[]>,
  filtros: FiltrosGlobales,
): Promise<{ actual: FactVentaLinea[]; anterior: FactVentaLinea[] }> {
  const [actual, anterior] = await Promise.all([
    fetchLineas(filtros.rango),
    fetchLineas(rangoAnterior(filtros.rango)),
  ]);
  return { actual, anterior };
}
