import type { SalesSource } from "./port";
import { createDemoSalesSource } from "./adapters/demo";

export type { SalesSource } from "./port";

/**
 * Punto único de obtención del `SalesSource` (regla 3 de AGENTS.md).
 *
 * La implementación se elige con la variable de entorno `SALES_SOURCE`:
 * - `demo` (default): datos sintéticos deterministas.
 * - futuro: `postgres`/`parquet`, implementados por otro adapter.
 *
 * Ningún componente o página importa un adapter directamente; solo este
 * factory conoce la selección.
 */
export function getSalesSource(): SalesSource {
  const seleccion = process.env.SALES_SOURCE ?? "demo";
  switch (seleccion) {
    case "demo":
      return createDemoSalesSource();
    default:
      throw new Error(
        `SALES_SOURCE="${seleccion}" no tiene un adapter registrado. ` +
          `Valores válidos: "demo".`,
      );
  }
}
