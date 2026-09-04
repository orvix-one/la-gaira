import { z } from "zod";

/** Contrato de documento para KPIs oficiales; espeja el subconjunto usado de `vw_tickets`. */
export const ticketVentaSchema = z.object({
  operacionId: z.number().int(),
  sucursal: z.string().min(1),
  fechaTurno: z.string(),
  totalFactura: z.number(),
  unidades: z.number(),
});

export type TicketVenta = z.infer<typeof ticketVentaSchema>;
