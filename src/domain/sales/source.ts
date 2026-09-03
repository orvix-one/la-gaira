import type { CoberturaDatos, FactVentaLinea, Sucursal } from "./contract";
import type { RangoFechas } from "./filters";

/**
 * Port de lectura de ventas definido por el dominio.
 * Infrastructure aporta adapters; application solo depende de este contrato.
 */
export interface SalesSource {
  fetchLineas(rango: RangoFechas): Promise<FactVentaLinea[]>;
  fetchSucursales(): Promise<Sucursal[]>;
  fetchCobertura(): Promise<CoberturaDatos>;
}
