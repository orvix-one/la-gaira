import type { FactVentaLinea } from "@/domain/sales/fact-venta-linea";
import type { FiltroVentas } from "@/domain/sales/filtros";

// Port: la única forma en que application/ obtiene datos de venta. Hoy lo implementa el
// adapter de DuckDB (src/infrastructure/data/adapters/duckdb-sales-source.ts); el día que
// la fuente sea el ERP, se escribe un adapter nuevo que cumpla este mismo contrato y la
// UI no cambia.
export type SalesSource = {
  obtenerLineas(filtro?: FiltroVentas): Promise<FactVentaLinea[]>;
};
