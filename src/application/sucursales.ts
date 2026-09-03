import {
  bucketsDelRango,
  claveBucket,
  granularidadPara,
  lineasAnaliticas,
  participacion,
  variacion,
  ventasNetas,
  type CoberturaDatos,
  type FactVentaLinea,
  type FiltrosGlobales,
  type Granularidad,
  type SalesSource,
  type Sucursal,
} from "@/domain/sales";
import { cargarActualYAnterior, filtrarPorSucursal, kpisDe, type KpiBase } from "./compartido";

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
  /** Ranking completo; incluye sucursales sin ventas en el periodo con cero (spec §9.4). */
  ranking: FilaSucursal[];
  /** Series de las 5 sucursales con más ventas (límite de legibilidad, spec §9.4). */
  tendencia: SerieSucursal[];
}

const MAX_SERIES_TENDENCIA = 5;

export async function getSucursales(
  source: SalesSource,
  filtros: FiltrosGlobales,
  cobertura: CoberturaDatos,
): Promise<SucursalesView> {
  const [{ actual, anterior }, sucursales] = await Promise.all([
    cargarActualYAnterior((rango) => source.fetchLineas(rango), filtros),
    source.fetchSucursales(),
  ]);
  const lineas = filtrarPorSucursal(actual, filtros);
  const lineasAnterior = filtrarPorSucursal(anterior, filtros);

  const totalVentas = ventasNetas(lineas);
  const ranking = sucursales
    .map((sucursal) => {
      const propias = lineas.filter((l) => l.branchCode === sucursal.code);
      const propiasAnterior = lineasAnterior.filter((l) => l.branchCode === sucursal.code);
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
    tendencia: tendenciaPorSucursal(lineas, filtros, ranking.slice(0, MAX_SERIES_TENDENCIA)),
  };
}

function tendenciaPorSucursal(
  lineas: FactVentaLinea[],
  filtros: FiltrosGlobales,
  top: FilaSucursal[],
): SerieSucursal[] {
  const granularidad = granularidadPara(filtros.rango);
  const buckets = bucketsDelRango(filtros.rango, granularidad);

  return top.map(({ code, sucursal }) => {
    const porBucket = new Map<string, { vistos: Set<string>; ventas: number }>(
      buckets.map((b) => [b, { vistos: new Set(), ventas: 0 }]),
    );
    for (const linea of lineasAnaliticas(lineas)) {
      if (linea.branchCode !== code) continue;
      const bucket = porBucket.get(claveBucket(linea.saleDate, granularidad));
      if (!bucket || bucket.vistos.has(linea.sourceTransactionId)) continue;
      bucket.vistos.add(linea.sourceTransactionId);
      bucket.ventas += linea.invoiceTotalAmount;
    }
    return {
      code,
      sucursal,
      puntos: buckets.map((b) => ({ periodo: b, ventas: porBucket.get(b)?.ventas ?? 0 })),
    };
  });
}

/** Detalle de una sucursal (spec §9.4: productos principales y tendencia). */

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
  const sucursales = await source.fetchSucursales();
  const sucursal = sucursales.find((s) => s.code === code);
  if (!sucursal) return null;

  const filtrosSucursal: FiltrosGlobales = { rango: filtros.rango, sucursal: code };
  const { actual, anterior } = await cargarActualYAnterior(
    (rango) => source.fetchLineas(rango),
    filtrosSucursal,
  );
  const lineas = filtrarPorSucursal(actual, filtrosSucursal);
  const lineasAnterior = filtrarPorSucursal(anterior, filtrosSucursal);

  const kpis = kpisDe(lineas);

  const porProducto = new Map<
    string,
    { productCode: string; productName: string; categoryName: string; ventas: number; unidades: number }
  >();
  for (const linea of lineasAnaliticas(lineas)) {
    const entrada =
      porProducto.get(linea.productCode) ?? {
        productCode: linea.productCode,
        productName: linea.productName,
        categoryName: linea.categoryName,
        ventas: 0,
        unidades: 0,
      };
    entrada.ventas += linea.lineNetAmount;
    entrada.unidades += linea.quantity;
    porProducto.set(linea.productCode, entrada);
  }

  return {
    filtros,
    cobertura,
    sucursal,
    granularidad: granularidadPara(filtrosSucursal.rango),
    kpis: { ...kpis, variacionVentas: variacion(kpis.ventasNetas, ventasNetas(lineasAnterior)) },
    tendencia: tendenciaPorSucursal(lineas, filtrosSucursal, [
      { code, sucursal: sucursal.name } as FilaSucursal,
    ])[0].puntos,
    topProductos: [...porProducto.values()]
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, TOP_PRODUCTOS_SUCURSAL),
  };
}
