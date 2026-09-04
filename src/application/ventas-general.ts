import {
  bucketsDelRango,
  claveBucket,
  granularidadPara,
  variacion,
  ventasNetas,
  type CoberturaDatos,
  type FiltrosGlobales,
  type Granularidad,
  type TicketVenta,
} from "@/domain/sales";
import type { SalesSource } from "@/infrastructure/data/sales-source";
import {
  cargarTicketsActualYAnterior,
  kpisDe,
  serieTemporalDe,
  type PuntoTemporal,
} from "./compartido";

/** Vista 1 — Ventas General (spec §9.3). */
export interface KpiConVariacion {
  valor: number | null;
  variacion: number | null;
}

export interface FilaDesempeno {
  periodo: string;
  sucursalCode: string;
  sucursal: string;
  ventas: number;
  unidades: number;
  transacciones: number;
  variacionVentas: number | null;
}

export interface VentasGeneralView {
  filtros: FiltrosGlobales;
  cobertura: CoberturaDatos;
  granularidad: Granularidad;
  kpis: {
    ventasNetas: KpiConVariacion;
    unidades: KpiConVariacion;
    transacciones: KpiConVariacion;
    ticketPromedio: KpiConVariacion;
  };
  tendencia: PuntoTemporal[];
  ventasPorSucursal: Array<{ sucursal: string; ventas: number }>;
  desempeno: FilaDesempeno[];
}

export async function getVentasGeneral(
  source: SalesSource,
  filtros: FiltrosGlobales,
  cobertura: CoberturaDatos,
): Promise<VentasGeneralView> {
  const { actual, anterior } = await cargarTicketsActualYAnterior(source, filtros);
  const kpisActual = kpisDe(actual);
  const kpisAnterior = kpisDe(anterior);
  const tendencia = serieTemporalDe(actual, filtros);

  return {
    filtros,
    cobertura,
    granularidad: tendencia.granularidad,
    kpis: {
      ventasNetas: {
        valor: kpisActual.ventasNetas,
        variacion: variacion(kpisActual.ventasNetas, kpisAnterior.ventasNetas),
      },
      unidades: {
        valor: kpisActual.unidades,
        variacion: variacion(kpisActual.unidades, kpisAnterior.unidades),
      },
      transacciones: {
        valor: kpisActual.transacciones,
        variacion: variacion(kpisActual.transacciones, kpisAnterior.transacciones),
      },
      ticketPromedio: {
        valor: kpisActual.ticketPromedio,
        variacion:
          kpisActual.ticketPromedio !== null && kpisAnterior.ticketPromedio !== null
            ? variacion(kpisActual.ticketPromedio, kpisAnterior.ticketPromedio)
            : null,
      },
    },
    tendencia: tendencia.puntos,
    ventasPorSucursal: ventasPorSucursal(actual),
    desempeno: tablaDesempeno(actual, filtros),
  };
}

function ventasPorSucursal(
  tickets: TicketVenta[],
): Array<{ sucursal: string; ventas: number }> {
  const grupos = new Map<string, TicketVenta[]>();
  for (const ticket of tickets) {
    const grupo = grupos.get(ticket.sucursal) ?? [];
    grupo.push(ticket);
    grupos.set(ticket.sucursal, grupo);
  }
  return [...grupos.entries()]
    .map(([sucursal, grupo]) => ({ sucursal, ventas: ventasNetas(grupo) }))
    .sort((a, b) => b.ventas - a.ventas);
}

/** Una fila por bucket temporal y sucursal. */
function tablaDesempeno(
  tickets: TicketVenta[],
  filtros: FiltrosGlobales,
): FilaDesempeno[] {
  const granularidad = granularidadPara(filtros.rango);
  const buckets = bucketsDelRango(filtros.rango, granularidad);
  const ordenBucket = new Map(buckets.map((bucket, index) => [bucket, index]));
  const grupos = new Map<string, TicketVenta[]>();

  for (const ticket of tickets) {
    const periodo = claveBucket(ticket.fechaTurno, granularidad);
    const clave = `${periodo}|${ticket.sucursal}`;
    const grupo = grupos.get(clave) ?? [];
    grupo.push(ticket);
    grupos.set(clave, grupo);
  }

  const filas: FilaDesempeno[] = [];
  for (const [clave, grupo] of grupos) {
    const [periodo, sucursal] = clave.split("|");
    const indice = ordenBucket.get(periodo) ?? 0;
    const periodoAnterior = indice > 0 ? buckets[indice - 1] : null;
    const grupoAnterior = periodoAnterior
      ? grupos.get(`${periodoAnterior}|${sucursal}`)
      : undefined;
    const actual = kpisDe(grupo);

    filas.push({
      periodo,
      sucursalCode: sucursal,
      sucursal,
      ventas: actual.ventasNetas,
      unidades: actual.unidades,
      transacciones: actual.transacciones,
      variacionVentas: grupoAnterior
        ? variacion(actual.ventasNetas, ventasNetas(grupoAnterior))
        : null,
    });
  }

  return filas.sort((a, b) => a.periodo.localeCompare(b.periodo) || b.ventas - a.ventas);
}
