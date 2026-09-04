import { z } from "zod";
import { esRangoValido } from "./analitica";

const dashboardCompartidoV2Schema = z.object({
  version: z.literal(2),
  pathname: z.string(),
  generadoAt: z.string(),
  expiraAt: z.string(),
  filtros: z.object({
    rango: z
      .object({ desde: z.string(), hasta: z.string() })
      .refine(esRangoValido, "Rango de fechas inválido"),
    sucursal: z.string().optional(),
  }),
});

const dashboardCompartidoV3Schema = z.object({
  version: z.literal(3),
  pathname: z.string(),
  generadoAt: z.string(),
  expiraAt: z.string(),
  filtros: z.object({
    rango: z
      .object({ desde: z.string(), hasta: z.string() })
      .refine(esRangoValido, "Rango de fechas inválido"),
    sucursal: z.string().optional(),
  }),
  metricas: z.array(z.string()).min(1).max(12),
});

/** Los enlaces v2 vigentes se migran en lectura y conservan todas sus métricas. */
export const dashboardCompartidoSchema = z
  .discriminatedUnion("version", [dashboardCompartidoV2Schema, dashboardCompartidoV3Schema])
  .transform((dashboard) =>
    dashboard.version === 2
      ? {
          ...dashboard,
          version: 3 as const,
          metricas: metricasCompartiblesDe(dashboard.pathname).map((metrica) => metrica.id),
        }
      : dashboard,
  );

export type DashboardCompartido = z.infer<typeof dashboardCompartidoSchema>;
export type DashboardCompartidoBase = Omit<DashboardCompartido, "generadoAt" | "expiraAt">;

export interface MetricaCompartible {
  id: string;
  label: string;
  tipo: "indicador" | "grafico" | "tabla";
}

const METRICAS_INICIO: MetricaCompartible[] = [
  { id: "ventas_netas", label: "Ventas netas", tipo: "indicador" },
  { id: "transacciones", label: "Transacciones", tipo: "indicador" },
  { id: "ticket_promedio", label: "Ticket promedio", tipo: "indicador" },
  { id: "sucursales_activas", label: "Sucursales activas", tipo: "indicador" },
  { id: "estado_datos", label: "Estado y cobertura de datos", tipo: "tabla" },
];

const METRICAS_VENTAS: MetricaCompartible[] = [
  { id: "ventas_netas", label: "Ventas netas", tipo: "indicador" },
  { id: "unidades", label: "Unidades", tipo: "indicador" },
  { id: "transacciones", label: "Transacciones", tipo: "indicador" },
  { id: "ticket_promedio", label: "Ticket promedio", tipo: "indicador" },
  { id: "tendencia_ventas", label: "Evolución de ventas", tipo: "grafico" },
  { id: "ventas_sucursal", label: "Ventas por sucursal", tipo: "grafico" },
  { id: "desempeno", label: "Desempeño por periodo y sucursal", tipo: "tabla" },
];

const METRICAS_PRODUCTOS: MetricaCompartible[] = [
  { id: "productos_vendidos", label: "Productos vendidos", tipo: "indicador" },
  { id: "categorias", label: "Categorías", tipo: "indicador" },
  { id: "producto_lider", label: "Producto líder", tipo: "indicador" },
  { id: "categoria_lider", label: "Categoría líder", tipo: "indicador" },
  { id: "ranking_productos", label: "Ranking de productos", tipo: "grafico" },
  { id: "distribucion_categorias", label: "Distribución por categoría", tipo: "grafico" },
  { id: "tabla_productos", label: "Tabla completa de productos", tipo: "tabla" },
];

const METRICAS_SUCURSALES: MetricaCompartible[] = [
  { id: "ranking_sucursales", label: "Ranking por ventas netas", tipo: "grafico" },
  { id: "tendencia_sucursales", label: "Evolución comparada", tipo: "grafico" },
  { id: "tabla_sucursales", label: "Detalle completo por sucursal", tipo: "tabla" },
];

const METRICAS_DETALLE: MetricaCompartible[] = [
  { id: "ventas_netas", label: "Ventas netas", tipo: "indicador" },
  { id: "unidades", label: "Unidades", tipo: "indicador" },
  { id: "transacciones", label: "Transacciones", tipo: "indicador" },
  { id: "ticket_promedio", label: "Ticket promedio", tipo: "indicador" },
  { id: "tendencia_ventas", label: "Evolución de ventas", tipo: "grafico" },
  { id: "productos_principales", label: "Productos principales", tipo: "tabla" },
];

export function metricasCompartiblesDe(pathname: string): MetricaCompartible[] {
  if (pathname === "/") return METRICAS_INICIO;
  if (pathname === "/ventas") return METRICAS_VENTAS;
  if (pathname === "/productos") return METRICAS_PRODUCTOS;
  if (pathname === "/sucursales") return METRICAS_SUCURSALES;
  if (/^\/sucursales\/[^/]+$/.test(pathname)) return METRICAS_DETALLE;
  return [];
}
