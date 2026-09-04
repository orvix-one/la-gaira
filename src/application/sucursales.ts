import {
  bucketsDelRango,
  claveBucket,
  granularidadPara,
  lineasAnaliticas,
  participacion,
  variacion,
  ventasNetas,
  type CoberturaDatos,
  type FiltrosGlobales,
  type Granularidad,
  type Sucursal,
  type TicketVenta,
} from "@/domain/sales";
import type { SalesSource } from "@/infrastructure/data/sales-source";
import {
  cargarTicketsActualYAnterior,
  filtroFuente,
  kpisDe,
  type KpiBase,
} from "./compartido";

/** Vista 2 — Sucursales (spec §9.4): comparativa y detalle. */
export interface FilaSucursal extends KpiBase {
  code: string;
  sucursal: string;
  participacion: number | null;
  variacionVentas: number | null;
}

export interface SerieSucursal {
  code: string;
  sucursal: string;
  puntos: Array<{ periodo: string; ventas: number }>;
}

export interface SucursalesView {
  filtros: FiltrosGlobales;
  cobertura: CoberturaDatos;
  granularidad: Granularidad;
  ranking: FilaSucursal[];
  tendencia: SerieSucursal[];
}

const MAX_SERIES_TENDENCIA = 5;

export async function getSucursales(
  source: SalesSource,
  filtros: FiltrosGlobales,
  cobertura: CoberturaDatos,
): Promise<SucursalesView> {
  const [{ actual, anterior }, sucursales] = await Promise.all([
    cargarTicketsActualYAnterior(source, filtros),
    source.obtenerSucursales(),
  ]);
  const totalVentas = ventasNetas(actual);
  const ranking = sucursales
    .map((sucursal) => {
      const propias = actual.filter((ticket) => ticket.sucursal === sucursal.code);
      const propiasAnterior = anterior.filter((ticket) => ticket.sucursal === sucursal.code);
      const kpis = kpisDe(propias);
      return {
        code: sucursal.code,
        sucursal: sucursal.name,
        ...kpis,
        participacion: participacion(kpis.ventasNetas, totalVentas),
        variacionVentas: variacion(kpis.ventasNetas, ventasNetas(propiasAnterior)),
      };
    })
    .sort((a, b) => b.ventasNetas - a.ventasNetas);

  return {
    filtros,
    cobertura,
    granularidad: granularidadPara(filtros.rango),
    ranking,
    tendencia: tendenciaPorSucursal(actual, filtros, ranking.slice(0, MAX_SERIES_TENDENCIA)),
  };
}

function tendenciaPorSucursal(
  tickets: TicketVenta[],
  filtros: FiltrosGlobales,
  top: FilaSucursal[],
): SerieSucursal[] {
  const granularidad = granularidadPara(filtros.rango);
  const buckets = bucketsDelRango(filtros.rango, granularidad);

  return top.map(({ code, sucursal }) => {
    const porBucket = new Map(buckets.map((bucket) => [bucket, 0]));
    for (const ticket of tickets) {
      if (ticket.sucursal !== code) continue;
      const bucket = claveBucket(ticket.fechaTurno, granularidad);
      porBucket.set(bucket, (porBucket.get(bucket) ?? 0) + ticket.totalFactura);
    }
    return {
      code,
      sucursal,
      puntos: buckets.map((periodo) => ({ periodo, ventas: porBucket.get(periodo) ?? 0 })),
    };
  });
}

export interface SucursalDetalleView {
  filtros: FiltrosGlobales;
  cobertura: CoberturaDatos;
  sucursal: Sucursal;
  granularidad: Granularidad;
  kpis: KpiBase & { variacionVentas: number | null };
  tendencia: Array<{ periodo: string; ventas: number }>;
  topProductos: Array<{
    productCode: string;
    productName: string;
    categoryName: string;
    ventas: number;
    unidades: number;
  }>;
}

const TOP_PRODUCTOS_SUCURSAL = 10;

export async function getSucursalDetalle(
  source: SalesSource,
  code: string,
  filtros: FiltrosGlobales,
  cobertura: CoberturaDatos,
): Promise<SucursalDetalleView | null> {
  const sucursales = await source.obtenerSucursales();
  const sucursal = sucursales.find((item) => item.code === code);
  if (!sucursal) return null;

  const filtrosSucursal: FiltrosGlobales = { rango: filtros.rango, sucursal: code };
  const [{ actual, anterior }, lineas] = await Promise.all([
    cargarTicketsActualYAnterior(source, filtrosSucursal),
    source.obtenerLineas(filtroFuente(filtrosSucursal)),
  ]);
  const kpis = kpisDe(actual);
  const porProducto = new Map<
    string,
    { productCode: string; productName: string; categoryName: string; ventas: number; unidades: number }
  >();

  for (const linea of lineasAnaliticas(lineas)) {
    const entrada =
      porProducto.get(linea.productoCodigo) ?? {
        productCode: linea.productoCodigo,
        productName: linea.descripcion,
        categoryName: linea.linea,
        ventas: 0,
        unidades: 0,
      };
    entrada.ventas += linea.importe;
    entrada.unidades += linea.cantidad;
    porProducto.set(linea.productoCodigo, entrada);
  }

  return {
    filtros: filtrosSucursal,
    cobertura,
    sucursal,
    granularidad: granularidadPara(filtrosSucursal.rango),
    kpis: {
      ...kpis,
      variacionVentas: variacion(kpis.ventasNetas, ventasNetas(anterior)),
    },
    tendencia: tendenciaPorSucursal(actual, filtrosSucursal, [
      { code, sucursal: sucursal.name } as FilaSucursal,
    ])[0].puntos,
    topProductos: [...porProducto.values()]
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, TOP_PRODUCTOS_SUCURSAL),
  };
}
