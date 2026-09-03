import type { FactVentaLinea } from "./contract";

/**
 * Fórmulas de KPI según spec §9.2. Funciones puras, sin dependencias,
 * listas para pruebas unitarias cuando el proyecto incorpore un runner.
 *
 * Convenciones (spec §9.1):
 * - Todos los KPIs se calculan sobre el mismo conjunto filtrado.
 * - Las anuladas quedan excluidas de la analítica.
 * - Una comparación cuyo periodo anterior sea cero se muestra como `—`
 *   (aquí: `null`).
 */

/** Líneas que participan en la analítica: publicadas y no anuladas. */
export function lineasAnaliticas(lineas: readonly FactVentaLinea[]): FactVentaLinea[] {
  return lineas.filter((l) => !l.isVoided);
}

/**
 * Ventas netas: `SUM(invoice_total_amount)` una sola vez por
 * `source_transaction_id` válido y no anulado. Nunca se suma el total de
 * factura repetido en cada línea (spec §9.2, indicador oficial).
 */
export function ventasNetas(lineas: readonly FactVentaLinea[]): number {
  const vistos = new Set<string>();
  let total = 0;
  for (const linea of lineasAnaliticas(lineas)) {
    if (vistos.has(linea.sourceTransactionId)) continue;
    vistos.add(linea.sourceTransactionId);
    total += linea.invoiceTotalAmount;
  }
  return total;
}

/**
 * Ventas atribuidas a productos: `SUM(line_net_amount)` de operaciones
 * válidas y no anuladas. Base de la vista Productos (spec §9.2).
 */
export function ventasAtribuidas(lineas: readonly FactVentaLinea[]): number {
  let total = 0;
  for (const linea of lineasAnaliticas(lineas)) total += linea.lineNetAmount;
  return total;
}

/** Unidades netas: `SUM(quantity)`, incluye devoluciones negativas. */
export function unidadesNetas(lineas: readonly FactVentaLinea[]): number {
  let total = 0;
  for (const linea of lineasAnaliticas(lineas)) total += linea.quantity;
  return total;
}

/** Transacciones: `COUNT(DISTINCT source_transaction_id)` válidas y no anuladas. */
export function transacciones(lineas: readonly FactVentaLinea[]): number {
  const vistos = new Set<string>();
  for (const linea of lineasAnaliticas(lineas)) vistos.add(linea.sourceTransactionId);
  return vistos.size;
}

/** Ticket promedio: `ventas_netas / transacciones`. `null` si no hay transacciones. */
export function ticketPromedio(ventas: number, numTransacciones: number): number | null {
  return numTransacciones === 0 ? null : ventas / numTransacciones;
}

/** Precio medio por unidad: `ventas_netas / unidades_netas`. `null` si unidades es cero. */
export function precioMedio(ventas: number, unidades: number): number | null {
  return unidades === 0 ? null : ventas / unidades;
}

/**
 * Variación vs. periodo anterior: `(actual - anterior) / ABS(anterior)`.
 * `null` cuando el periodo anterior es cero (se muestra `—`, spec §9.1).
 */
export function variacion(actual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return (actual - anterior) / Math.abs(anterior);
}

/** Participación: `valor / total_filtrado`. `null` si el total es cero. */
export function participacion(valor: number, total: number): number | null {
  return total === 0 ? null : valor / total;
}
