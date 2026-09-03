import {
  bucketsDelRango,
  claveBucket,
  granularidadPara,
  transacciones,
  unidadesNetas,
  variacion,
  ventasNetas,
  type CoberturaDatos,
  type FactVentaLinea,
  type FiltrosGlobales,
  type Granularidad,
  type SalesSource,
} from "@/domain/sales";
import {
  cargarActualYAnterior,
  filtrarPorSucursal,
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
  /** Variación de ventas vs. el bucket inmediatamente anterior de la misma sucursal. */
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
  const { actual, anterior } = await cargarActualYAnterior(
    (rango) => source.fetchLineas(rango),
    filtros,
  );
  const lineas = filtrarPorSucursal(actual, filtros);
  const lineasAnterior = filtrarPorSucursal(anterior, filtros);

  const kpisActual = kpisDe(lineas);
  const kpisAnterior = kpisDe(lineasAnterior);
  const tendencia = serieTemporalDe(lineas, filtros);

  return {
    filtros,
    cobertura,
    granularidad: granularidadPara(filtros.rango),
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
    ventasPorSucursal: ventasPorSucursal(lineas),
    desempeno: tablaDesempeno(lineas, filtros),
  };
}

function ventasPorSucursal(
  lineas: FactVentaLinea[],
): Array<{ sucursal: string; ventas: number }> {
  const porSucursal = new Map<string, { sucursal: string; lineas: FactVentaLinea[] }>();
  for (const linea of lineas) {
    const entrada =
      porSucursal.get(linea.branchCode) ?? { sucursal: linea.branchName, lineas: [] };
    entrada.lineas.push(linea);
    porSucursal.set(linea.branchCode, entrada);
  }
  return [...porSucursal.values()]
    .map((e) => ({ sucursal: e.sucursal, ventas: ventasNetas(e.lineas) }))
    .sort((a, b) => b.ventas - a.ventas);
}

/**
 * Tabla de desempeño: una fila por bucket temporal × sucursal con ventas,
 * unidades, transacciones y variación (spec §9.3). La variación es contra
 * el bucket inmediatamente anterior de la misma sucursal; en el primer
 * bucket del rango se muestra `—`.
 */
function tablaDesempeno(lineas: FactVentaLinea[], filtros: FiltrosGlobales): FilaDesempeno[] {
  const granularidad = granularidadPara(filtros.rango);
  const buckets = bucketsDelRango(filtros.rango, granularidad);
  const ordenBucket = new Map(buckets.map((b, i) => [b, i]));

  // Agrupa líneas por (bucket, sucursal).
  const grupos = new Map<string, { periodo: string; code: string; sucursal: string; lineas: FactVentaLinea[] }>();
  for (const linea of lineas) {
    const periodo = claveBucket(linea.saleDate, granularidad);
    if (!ordenBucket.has(periodo)) continue;
    const clave = `${periodo}|${linea.branchCode}`;
    const grupo =
      grupos.get(clave) ?? {
        periodo,
        code: linea.branchCode,
        sucursal: linea.branchName,
        lineas: [],
      };
    grupo.lineas.push(linea);
    grupos.set(clave, grupo);
  }

  const filas: FilaDesempeno[] = [];
  for (const grupo of grupos.values()) {
    const indice = ordenBucket.get(grupo.periodo) ?? 0;
    const periodoAnterior = indice > 0 ? buckets[indice - 1] : null;
    const grupoAnterior = periodoAnterior
      ? grupos.get(`${periodoAnterior}|${grupo.code}`)
      : undefined;
    const ventas = ventasNetas(grupo.lineas);
    filas.push({
      periodo: grupo.periodo,
      sucursalCode: grupo.code,
      sucursal: grupo.sucursal,
      ventas,
      unidades: unidadesNetas(grupo.lineas),
      transacciones: transacciones(grupo.lineas),
      variacionVentas: grupoAnterior ? variacion(ventas, ventasNetas(grupoAnterior.lineas)) : null,
    });
  }

  return filas.sort((a, b) => a.periodo.localeCompare(b.periodo) || b.ventas - a.ventas);
}
