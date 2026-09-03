import {
  lineasAnaliticas,
  participacion,
  precioMedio,
  variacion,
  type CoberturaDatos,
  type FactVentaLinea,
  type FiltrosGlobales,
  type SalesSource,
} from "@/domain/sales";
import { cargarActualYAnterior, filtrarPorSucursal } from "./compartido";

/** Vista 3 — Productos (spec §9.5). */

export interface FilaProducto {
  code: string;
  nombre: string;
  categoria: string;
  /** Ventas atribuidas: `SUM(line_net_amount)` (spec §9.2). */
  ventas: number;
  unidades: number;
  precioMedio: number | null;
  participacion: number | null;
  variacionVentas: number | null;
}

export interface FilaCategoria {
  categoria: string;
  ventas: number;
  participacion: number | null;
}

export interface ProductosView {
  filtros: FiltrosGlobales;
  cobertura: CoberturaDatos;
  totalProductos: number;
  productos: FilaProducto[];
  porCategoria: FilaCategoria[];
}

export async function getProductos(
  source: SalesSource,
  filtros: FiltrosGlobales,
  cobertura: CoberturaDatos,
): Promise<ProductosView> {
  const { actual, anterior } = await cargarActualYAnterior(
    (rango) => source.fetchLineas(rango),
    filtros,
  );
  const lineas = filtrarPorSucursal(actual, filtros);
  const lineasAnterior = filtrarPorSucursal(anterior, filtros);

  const ventasAnteriorPorProducto = ventasPorProducto(lineasAnterior);
  const agregados = new Map<string, FilaProducto>();
  let totalVentas = 0;

  for (const linea of lineasAnaliticas(lineas)) {
    const fila =
      agregados.get(linea.productCode) ??
      ({
        code: linea.productCode,
        nombre: linea.productName,
        categoria: linea.categoryName,
        ventas: 0,
        unidades: 0,
        precioMedio: null,
        participacion: null,
        variacionVentas: null,
      } satisfies FilaProducto);
    fila.ventas += linea.lineNetAmount;
    fila.unidades += linea.quantity;
    agregados.set(linea.productCode, fila);
    totalVentas += linea.lineNetAmount;
  }

  const productos = [...agregados.values()]
    .map((fila) => ({
      ...fila,
      precioMedio: precioMedio(fila.ventas, fila.unidades),
      participacion: participacion(fila.ventas, totalVentas),
      variacionVentas: variacion(fila.ventas, ventasAnteriorPorProducto.get(fila.code) ?? 0),
    }))
    .sort((a, b) => b.ventas - a.ventas);

  const porCategoriaMap = new Map<string, number>();
  for (const fila of productos) {
    porCategoriaMap.set(fila.categoria, (porCategoriaMap.get(fila.categoria) ?? 0) + fila.ventas);
  }
  const porCategoria = [...porCategoriaMap.entries()]
    .map(([categoria, ventas]) => ({
      categoria,
      ventas,
      participacion: participacion(ventas, totalVentas),
    }))
    .sort((a, b) => b.ventas - a.ventas);

  return {
    filtros,
    cobertura,
    totalProductos: productos.length,
    productos,
    porCategoria,
  };
}

function ventasPorProducto(lineas: FactVentaLinea[]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const linea of lineasAnaliticas(lineas)) {
    mapa.set(linea.productCode, (mapa.get(linea.productCode) ?? 0) + linea.lineNetAmount);
  }
  return mapa;
}
