import type { FactVentaLinea } from "@/domain/sales";
import { PRODUCTOS_DEMO, SUCURSALES_DEMO } from "./catalogo";

/**
 * Generador determinista del dataset de demostración.
 *
 * - Semilla fija → los mismos datos en cada build/ejecución.
 * - Periodo: julio y agosto de 2026 (permite comparación vs. periodo anterior).
 * - Volumen aproximado: ~50.000 líneas (mismo orden que la muestra real de
 *   referencia: 69.627 filas, spec §7.2).
 * - Incluye una fracción mínima de operaciones anuladas para ejercitar la
 *   regla de exclusión de la analítica.
 */

const DIA_MS = 24 * 60 * 60 * 1000;
const INICIO = Date.parse("2026-07-01T00:00:00Z");
const FIN = Date.parse("2026-08-31T00:00:00Z");

/** PRNG mulberry32: pequeño, rápido y determinista. */
function mulberry32(semilla: number): () => number {
  let estado = semilla;
  return () => {
    estado |= 0;
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Factor de popularidad por sucursal (índice en SUCURSALES_DEMO). */
const FACTOR_SUCURSAL = [1.3, 1.2, 0.9, 1.15, 0.8, 0.7, 0.55, 0.45];

function factorDiaSemana(utcMs: number): number {
  const dia = new Date(utcMs).getUTCDay(); // 0 = domingo
  if (dia === 0 || dia === 6) return 1.4;
  if (dia === 5) return 1.2;
  if (dia === 1) return 0.85;
  return 1;
}

function generarDataset(): FactVentaLinea[] {
  const rand = mulberry32(20260701);
  const lineas: FactVentaLinea[] = [];
  let secuenciaFactura = 0;

  for (let dia = INICIO; dia <= FIN; dia += DIA_MS) {
    const fechaIso = new Date(dia).toISOString().slice(0, 10);
    const yyyymmdd = fechaIso.replaceAll("-", "");
    // Tendencia leve al alza dentro del dataset (+~10 % de julio a fin de agosto).
    const progreso = (dia - INICIO) / (FIN - INICIO);
    const tendencia = 1 + progreso * 0.1;

    for (let s = 0; s < SUCURSALES_DEMO.length; s++) {
      const sucursal = SUCURSALES_DEMO[s];
      const base = 42 * FACTOR_SUCURSAL[s] * factorDiaSemana(dia) * tendencia;
      const numOperaciones = Math.round(base * (0.85 + rand() * 0.3));

      for (let op = 0; op < numOperaciones; op++) {
        secuenciaFactura += 1;
        const transactionId = `OP-${sucursal.code}-${yyyymmdd}-${String(op + 1).padStart(4, "0")}`;
        const invoiceNumber = `F-${String(secuenciaFactura).padStart(6, "0")}`;
        const isVoided = rand() < 0.006;

        const numLineas = 1 + Math.floor(rand() * 3.2);
        const elegidos = new Set<number>();
        const items: Array<{ index: number; qty: number }> = [];
        for (let i = 0; i < numLineas; i++) {
          let index = Math.floor(rand() * PRODUCTOS_DEMO.length);
          while (elegidos.has(index)) index = Math.floor(rand() * PRODUCTOS_DEMO.length);
          elegidos.add(index);
          items.push({ index, qty: 1 + Math.floor(rand() * 4) });
        }

        let totalFactura = 0;
        for (const item of items) totalFactura += item.qty * PRODUCTOS_DEMO[item.index].price;

        for (const item of items) {
          const producto = PRODUCTOS_DEMO[item.index];
          lineas.push({
            saleDate: fechaIso,
            branchCode: sucursal.code,
            branchName: sucursal.name,
            productCode: producto.code,
            productName: producto.name,
            categoryName: producto.categoryName,
            subcategoryName: producto.subcategoryName,
            quantity: item.qty,
            unitPrice: producto.price,
            discountAmount: 0,
            lineNetAmount: item.qty * producto.price,
            invoiceTotalAmount: totalFactura,
            invoiceNumber,
            sourceTransactionId: transactionId,
            currency: "BOB",
            isVoided,
          });
        }
      }
    }
  }

  return lineas;
}

let cache: FactVentaLinea[] | null = null;

/** Dataset completo (julio y agosto 2026), generado una sola vez por proceso. */
export function datasetDemo(): readonly FactVentaLinea[] {
  if (cache === null) cache = generarDataset();
  return cache;
}
