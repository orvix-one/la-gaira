import type {
  CoberturaDatos,
  FactVentaLinea,
  RangoFechas,
  Sucursal,
} from "@/domain/sales";
import type { SalesSource } from "../../port";
import { SUCURSALES_DEMO } from "./catalogo";
import { datasetDemo } from "./generador";

/**
 * Adapter de demostración (spec §4.1): sirve datos sintéticos deterministas
 * mientras no exista la base de datos. Es desechable (ARCHITECTURE.md):
 * se reemplaza por el adapter de BD sin tocar el resto de la app.
 */
export function createDemoSalesSource(): SalesSource {
  return {
    async fetchLineas(rango: RangoFechas): Promise<FactVentaLinea[]> {
      return datasetDemo().filter(
        (l) => l.saleDate >= rango.desde && l.saleDate <= rango.hasta,
      );
    },

    async fetchSucursales(): Promise<Sucursal[]> {
      return SUCURSALES_DEMO.map((s) => ({ code: s.code, name: s.name }));
    },

    async fetchCobertura(): Promise<CoberturaDatos> {
      return {
        desde: "2026-07-01",
        hasta: "2026-08-31",
        ultimaCargaAt: "2026-09-01T08:30:00-04:00",
        fuente: "Datos de demostración",
      };
    },
  };
}
