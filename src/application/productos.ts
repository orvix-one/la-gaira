import {
  lineasAnaliticas,
  participacion,
  precioMedio,
  variacion,
  type CoberturaDatos,
  type FactVentaLinea,
  type FiltrosGlobales,
} from "@/domain/sales";
import type { SalesSource } from "@/infrastructure/data/sales-source";
import { cargarLineasActualYAnterior } from "./compartido";

/** Vista 3 — Productos (spec §9.5). */
export interface FilaProducto {
  code: string;
  nombre: string;
  categoria: string;
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
  const { actual, anterior } = await cargarLineasActualYAnterior(source, filtros);
  const ventasAnteriorPorProducto = ventasPorProducto(anterior);
  const agregados = new Map<string, FilaProducto>();
  let totalVentas = 0;

  for (const linea of lineasAnaliticas(actual)) {
    const fila =
      agregados.get(linea.productoCodigo) ??
      ({
        code: linea.productoCodigo,
        nombre: linea.descripcion,
        categoria: linea.linea,
        ventas: 0,
        unidades: 0,
        precioMedio: null,
        participacion: null,
        variacionVentas: null,
      } satisfies FilaProducto);
    fila.ventas += linea.importe;
    fila.unidades += linea.cantidad;
    agregados.set(linea.productoCodigo, fila);
    totalVentas += linea.importe;
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

  return {
    filtros,
    cobertura,
    totalProductos: productos.length,
    productos,
    porCategoria: [...porCategoriaMap.entries()]
      .map(([categoria, ventas]) => ({
        categoria,
        ventas,
        participacion: participacion(ventas, totalVentas),
      }))
      .sort((a, b) => b.ventas - a.ventas),
  };
}

function ventasPorProducto(lineas: FactVentaLinea[]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const linea of lineasAnaliticas(lineas)) {
    mapa.set(linea.productoCodigo, (mapa.get(linea.productoCodigo) ?? 0) + linea.importe);
  }
  return mapa;
}
