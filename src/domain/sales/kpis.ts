import type { FactVentaLinea } from "./fact-venta-linea";
import type { TicketVenta } from "./ticket-venta";

/**
 * Fórmulas de KPI según spec §9.2. Funciones puras, sin dependencias,
 * listas para pruebas unitarias cuando el proyecto incorpore un runner.
 *
 * Convenciones (spec §9.1):
 * - Todos los KPIs se calculan sobre el mismo conjunto filtrado.
 * - `vw_ventas` y `vw_tickets` ya excluyen anuladas y operaciones en
 *   cuarentena; estas funciones no corrigen datos silenciosamente.
 * - Una comparación cuyo periodo anterior sea cero se muestra como `—`
 *   (aquí: `null`).
 */

/** Líneas que participan en la analítica; la vista ya entrega solo datos publicados. */
export function lineasAnaliticas(lineas: readonly FactVentaLinea[]): FactVentaLinea[] {
  return [...lineas];
}

/**
 * Ventas netas: `SUM(total_factura)` una sola vez por
 * operación válida. `vw_tickets` tiene una fila por operación, evitando
 * sumar `Total Factura` repetido por línea (spec §9.2).
 */
export function ventasNetas(tickets: readonly TicketVenta[]): number {
  let total = 0;
  for (const ticket of tickets) total += ticket.totalFactura;
  return total;
}

/**
 * Ventas atribuidas a productos: `SUM(importe)` de operaciones
 * válidas y no anuladas. Base de la vista Productos (spec §9.2).
 */
export function ventasAtribuidas(lineas: readonly FactVentaLinea[]): number {
  let total = 0;
  for (const linea of lineasAnaliticas(lineas)) total += linea.importe;
  return total;
}

/** Unidades netas: `SUM(unidades)`, incluye devoluciones negativas. */
export function unidadesNetas(tickets: readonly TicketVenta[]): number {
  let total = 0;
  for (const ticket of tickets) total += ticket.unidades;
  return total;
}

/** Transacciones: una fila válida de `vw_tickets` equivale a una operación. */
export function transacciones(tickets: readonly TicketVenta[]): number {
  return tickets.length;
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
