import { z } from "zod";
import { CANALES_VENTA } from "./fact-venta-linea";

// Filtro compartido por todas las páginas de analítica (dashboard, sucursal, productos,
// y las que se agreguen después). Todos los campos son opcionales: sin filtro = todo.

export const filtroVentasSchema = z.object({
  desde: z.string().optional(), // ISO 'YYYY-MM-DD', inclusive
  hasta: z.string().optional(), // ISO 'YYYY-MM-DD', inclusive
  sucursales: z.array(z.string()).optional(),
  lineas: z.array(z.string()).optional(),
  canal: z.array(z.enum(CANALES_VENTA)).optional(),
  incluirSinCargo: z.boolean().optional(), // default: true (lo decide el adapter)
});

export type FiltroVentas = z.infer<typeof filtroVentasSchema>;
