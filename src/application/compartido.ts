import {
  bucketsDelRango,
  claveBucket,
  granularidadPara,
  rangoAnterior,
  ticketPromedio,
  transacciones,
  unidadesNetas,
  ventasNetas,
  type FactVentaLinea,
  type FiltrosGlobales,
  type Granularidad,
  type TicketVenta,
} from "@/domain/sales";
import type { FiltroVentas } from "@/domain/sales/filtros";
import type { SalesSource } from "@/infrastructure/data/sales-source";

export interface KpiBase {
  ventasNetas: number;
  unidades: number;
  transacciones: number;
  ticketPromedio: number | null;
}

export interface PuntoTemporal {
  periodo: string;
  ventas: number;
}

export interface SerieTemporal {
  granularidad: Granularidad;
  puntos: PuntoTemporal[];
}

export function filtroFuente(
  filtros: FiltrosGlobales,
  rango = filtros.rango,
): FiltroVentas {
  return {
    desde: rango.desde,
    hasta: rango.hasta,
    sucursales: filtros.sucursal ? [filtros.sucursal] : undefined,
  };
}

/** KPIs núcleo sobre `vw_tickets`, una fila por operación válida. */
export function kpisDe(tickets: readonly TicketVenta[]): KpiBase {
  const ventas = ventasNetas(tickets);
  const txns = transacciones(tickets);
  return {
    ventasNetas: ventas,
    unidades: unidadesNetas(tickets),
    transacciones: txns,
    ticketPromedio: ticketPromedio(ventas, txns),
  };
}

/** Serie de ventas oficiales sin huecos, construida desde `vw_tickets`. */
export function serieTemporalDe(
  tickets: readonly TicketVenta[],
  filtros: FiltrosGlobales,
): SerieTemporal {
  const granularidad = granularidadPara(filtros.rango);
  const buckets = bucketsDelRango(filtros.rango, granularidad);
  const porBucket = new Map(buckets.map((bucket) => [bucket, 0]));

  for (const ticket of tickets) {
    const bucket = claveBucket(ticket.fechaTurno, granularidad);
    if (porBucket.has(bucket)) {
      porBucket.set(bucket, (porBucket.get(bucket) ?? 0) + ticket.totalFactura);
    }
  }

  return {
    granularidad,
    puntos: buckets.map((periodo) => ({ periodo, ventas: porBucket.get(periodo) ?? 0 })),
  };
}

export async function cargarTicketsActualYAnterior(
  source: SalesSource,
  filtros: FiltrosGlobales,
): Promise<{ actual: TicketVenta[]; anterior: TicketVenta[] }> {
  const [actual, anterior] = await Promise.all([
    source.obtenerTickets(filtroFuente(filtros)),
    source.obtenerTickets(filtroFuente(filtros, rangoAnterior(filtros.rango))),
  ]);
  return { actual, anterior };
}

export async function cargarLineasActualYAnterior(
  source: SalesSource,
  filtros: FiltrosGlobales,
): Promise<{ actual: FactVentaLinea[]; anterior: FactVentaLinea[] }> {
  const [actual, anterior] = await Promise.all([
    source.obtenerLineas(filtroFuente(filtros)),
    source.obtenerLineas(filtroFuente(filtros, rangoAnterior(filtros.rango))),
  ]);
  return { actual, anterior };
}
