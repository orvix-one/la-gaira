import type { CoberturaDatos, FiltrosGlobales } from "@/domain/sales";
import type { SalesSource } from "@/infrastructure/data/sales-source";
import { filtroFuente, kpisDe, type KpiBase } from "./compartido";

/** Inicio/resumen (spec §10.1): acceso a la última carga y a las tres vistas. */
export interface InicioView {
  cobertura: CoberturaDatos;
  filtros: FiltrosGlobales;
  kpis: KpiBase;
  sucursalesActivas: number;
}

export async function getInicio(
  source: SalesSource,
  filtros: FiltrosGlobales,
  cobertura: CoberturaDatos,
): Promise<InicioView> {
  const [tickets, sucursales] = await Promise.all([
    source.obtenerTickets(filtroFuente(filtros)),
    source.obtenerSucursales(),
  ]);

  return {
    cobertura,
    filtros,
    kpis: kpisDe(tickets),
    sucursalesActivas: sucursales.length,
  };
}
