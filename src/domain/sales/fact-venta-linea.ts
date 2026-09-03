import { z } from "zod";

// Contrato canónico de una línea de venta. Espeja vw_ventas (etl/schema.sql) — es la
// única forma en que el resto de la aplicación conoce los datos de venta; nadie fuera de
// src/infrastructure/data lee columnas crudas del origen.

export const CANALES_VENTA = ["SALON", "PEDIDOSYA", "YANGO", "LLEVAR"] as const;
export type CanalVenta = (typeof CANALES_VENTA)[number];

export const factVentaLineaSchema = z.object({
  ventaLineaId: z.number().int(),
  operacionId: z.number().int(),
  facturaNum: z.number().int().nullable(),
  sucursal: z.string(),
  fechaTurno: z.string(), // ISO 'YYYY-MM-DD', día operativo (no hay timestamp en el origen)
  anio: z.number().int(),
  mes: z.number().int(),
  anioMes: z.string(), // 'YYYY-MM'
  diaSemana: z.number().int(), // 0=domingo ... 6=sábado
  nombreDia: z.string(),
  esFinDeSemana: z.boolean(),
  productoCodigo: z.string(),
  descripcion: z.string(),
  linea: z.string(),
  subLinea: z.string(),
  tipoProducto: z.string(),
  esSiempreSinCargo: z.boolean(), // el producto nunca se vendió a importe > 0
  cantidad: z.number(),
  precioUnitario: z.number(),
  importe: z.number(), // 'Total Neto' del origen: importe cobrado, impuesto incluido
  iva: z.number(),
  it: z.number(),
  esSinCargo: z.boolean(), // importe = 0 en esta línea
  canalVenta: z.enum(CANALES_VENTA), // heurístico — ver canalEsInferido
  canalEsInferido: z.boolean(),
  esFiscal: z.boolean(),
  formaPago: z.string().nullable(),
  vendedorCodigo: z.number().int(),
  vendedor: z.string(),
  tipoVenta: z.string(),
});

export type FactVentaLinea = z.infer<typeof factVentaLineaSchema>;
