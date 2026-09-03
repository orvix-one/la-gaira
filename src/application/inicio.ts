import {
  type CoberturaDatos,
  type FiltrosGlobales,
  type SalesSource,
} from "@/domain/sales";
import { filtrarPorSucursal, kpisDe, type KpiBase } from "./compartido";

/** Inicio/resumen (spec §10.1): acceso a última carga y a las tres vistas. */

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
  const [lineasCrudas, sucursales] = await Promise.all([
    source.fetchLineas(filtros.rango),
    source.fetchSucursales(),
  ]);
  const lineas = filtrarPorSucursal(lineasCrudas, filtros);
  const kpis = kpisDe(lineas);

  return {
    cobertura,
    filtros,
    kpis,
    sucursalesActivas: sucursales.length,
  };
}
