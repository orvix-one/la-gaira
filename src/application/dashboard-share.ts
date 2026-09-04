import { z } from "zod";
import { metricasCompartiblesDe, type DashboardCompartidoBase } from "@/domain/sales";
import type { SalesSource } from "@/infrastructure/data/sales-source";
import { resolverFiltros } from "./filtros";

const entradaCompartirSchema = z.object({
  pathname: z.string().min(1).max(300),
  search: z.string().max(1_500),
  metricas: z.array(z.string()).min(1).max(12),
});

/** Valida el dashboard y guarda únicamente la referencia a sus filtros efectivos. */
export async function crearReferenciaDashboard(
  entrada: unknown,
  source: SalesSource,
): Promise<DashboardCompartidoBase> {
  const { pathname, search, metricas } = entradaCompartirSchema.parse(entrada);
  if (!esDashboardCompartible(pathname)) {
    throw new Error("Este dashboard no admite enlaces compartidos");
  }
  const permitidas = new Set(metricasCompartiblesDe(pathname).map((metrica) => metrica.id));
  const seleccionadas = [...new Set(metricas)];
  if (seleccionadas.some((metrica) => !permitidas.has(metrica))) {
    throw new Error("La selección contiene métricas no permitidas");
  }

  const params = new URLSearchParams(search);
  const { filtros } = await resolverFiltros(
    {
      desde: params.get("desde"),
      hasta: params.get("hasta"),
      sucursal: params.get("sucursal"),
    },
    source,
  );

  const matchDetalle = pathname.match(/^\/sucursales\/(.+)$/);
  if (matchDetalle) {
    const code = decodeURIComponent(matchDetalle[1]);
    const sucursales = await source.obtenerSucursales();
    if (!sucursales.some((sucursal) => sucursal.code === code)) {
      throw new Error("Sucursal no encontrada");
    }
    return {
      version: 3,
      pathname,
      filtros: { rango: filtros.rango, sucursal: code },
      metricas: seleccionadas,
    };
  }

  return { version: 3, pathname, filtros, metricas: seleccionadas };
}

function esDashboardCompartible(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/ventas" ||
    pathname === "/productos" ||
    pathname === "/sucursales" ||
    /^\/sucursales\/[^/]+$/.test(pathname)
  );
}
