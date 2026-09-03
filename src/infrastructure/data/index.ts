import { duckdbSalesSource } from "./adapters/duckdb-sales-source";
import type { SalesSource } from "./sales-source";

export type { SalesSource } from "./sales-source";

/**
 * Punto único de obtención del `SalesSource` (regla 3 de AGENTS.md).
 *
 * DuckDB es el adapter vigente. Ningún componente o página importa el
 * adapter directamente; este factory es el único punto de composición.
 */
export function getSalesSource(): SalesSource {
  return duckdbSalesSource;
}
