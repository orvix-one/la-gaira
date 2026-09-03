import { DuckDBInstance, listValue, type DuckDBValue } from "@duckdb/node-api";
import { join } from "node:path";
import { factVentaLineaSchema, type FactVentaLinea } from "@/domain/sales/fact-venta-linea";
import type { FiltroVentas } from "@/domain/sales/filtros";
import type { SalesSource } from "../sales-source";

// Único archivo del repo que sabe que la fuente de datos es DuckDB. Lee
// data/processed/gaira.duckdb (generado por `npm run etl`) en modo solo-lectura.

const DB_PATH = join(process.cwd(), "data", "processed", "gaira.duckdb");

let cachedInstance: Promise<DuckDBInstance> | null = null;

function getInstance(): Promise<DuckDBInstance> {
  cachedInstance ??= DuckDBInstance.fromCache(DB_PATH, { access_mode: "READ_ONLY" });
  return cachedInstance;
}

function buildWhere(filtro?: FiltroVentas): { clause: string; params: Record<string, DuckDBValue> } {
  const conditions: string[] = [];
  const params: Record<string, DuckDBValue> = {};

  if (filtro?.desde) {
    conditions.push("fecha_turno >= $desde");
    params.desde = filtro.desde;
  }
  if (filtro?.hasta) {
    conditions.push("fecha_turno <= $hasta");
    params.hasta = filtro.hasta;
  }
  if (filtro?.sucursales && filtro.sucursales.length > 0) {
    conditions.push("sucursal = ANY($sucursales)");
    params.sucursales = listValue(filtro.sucursales);
  }
  if (filtro?.lineas && filtro.lineas.length > 0) {
    conditions.push("linea = ANY($lineas)");
    params.lineas = listValue(filtro.lineas);
  }
  if (filtro?.canal && filtro.canal.length > 0) {
    conditions.push("canal_venta = ANY($canal)");
    params.canal = listValue(filtro.canal);
  }
  if (filtro?.incluirSinCargo === false) {
    conditions.push("NOT es_sin_cargo");
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

// vw_ventas devuelve DECIMAL/BIGINT como texto (para no perder precisión al serializar);
// esta función los convierte a los tipos que espera factVentaLineaSchema.
function mapRow(row: Record<string, unknown>): unknown {
  return {
    ventaLineaId: Number(row.venta_linea_id),
    operacionId: Number(row.operacion_id),
    facturaNum: row.factura_num === null ? null : Number(row.factura_num),
    sucursal: row.sucursal,
    fechaTurno: row.fecha_turno,
    anio: Number(row.anio),
    mes: Number(row.mes),
    anioMes: row.anio_mes,
    diaSemana: Number(row.dia_semana),
    nombreDia: row.nombre_dia,
    esFinDeSemana: row.es_fin_de_semana,
    productoCodigo: row.producto_codigo,
    descripcion: row.descripcion,
    linea: row.linea,
    subLinea: row.sub_linea,
    tipoProducto: row.tipo_producto,
    esSiempreSinCargo: row.es_siempre_sin_cargo,
    cantidad: Number(row.cantidad),
    precioUnitario: Number(row.precio_unitario),
    importe: Number(row.importe),
    iva: Number(row.iva),
    it: Number(row.it),
    esSinCargo: row.es_sin_cargo,
    canalVenta: row.canal_venta,
    canalEsInferido: row.canal_es_inferido,
    esFiscal: row.es_fiscal,
    formaPago: row.forma_pago,
    vendedorCodigo: Number(row.vendedor_codigo),
    vendedor: row.vendedor,
    tipoVenta: row.tipo_venta,
  };
}

export const duckdbSalesSource: SalesSource = {
  async obtenerLineas(filtro): Promise<FactVentaLinea[]> {
    const instance = await getInstance();
    const conn = await instance.connect();
    try {
      const { clause, params } = buildWhere(filtro);
      const result = await conn.run(`SELECT * FROM vw_ventas ${clause}`, params);
      const rows = (await result.getRowObjectsJson()) as Record<string, unknown>[];
      return rows.map((row) => factVentaLineaSchema.parse(mapRow(row)));
    } finally {
      conn.closeSync();
    }
  },
};
