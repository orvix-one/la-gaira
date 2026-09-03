import { z } from "zod";

/**
 * Contrato canónico de ventas (spec §7.5).
 *
 * Frontera sagrada del proyecto: la UI y los casos de uso solo conocen esta
 * forma. Los adapters de `src/infrastructure/data` (demo hoy, BD mañana)
 * son responsables de entregar datos que la satisfagan.
 *
 * Fechas: strings ISO `YYYY-MM-DD` (sin hora; el origen no la provee).
 * Importes: números con semántica decimal monetaria; el almacenamiento real
 * será decimal exacto (spec §8.2) y el adapter de BD hará el mapeo.
 */

export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const CURRENCY = "BOB" as const;
export const TIMEZONE = "America/La_Paz" as const;

export const factVentaLineaSchema = z.object({
  /** Fecha de venta, ISO `YYYY-MM-DD`, inclusiva. Derivada de `Fecha de turno`. */
  saleDate: z.string().regex(ISO_DATE_REGEX),
  /** Código interno estable de la sucursal (alias controlado mientras no exista código fuente). */
  branchCode: z.string().min(1),
  /** Nombre visible de la sucursal. Derivado de `Sucursal`. */
  branchName: z.string().min(1),
  /** SKU/código del producto como texto (preserva ceros iniciales). Derivado de `Código`. */
  productCode: z.string().min(1),
  /** Nombre visible del producto. Derivado de `Descripción`. */
  productName: z.string().min(1),
  /** Categoría comercial principal. Derivada de `Linea`. */
  categoryName: z.string().min(1),
  /** Subcategoría. Derivada de `Sub-Linea`. */
  subcategoryName: z.string().min(1),
  /** Unidades vendidas; negativa solo en devoluciones documentadas. */
  quantity: z.number(),
  /** Precio unitario monetario. */
  unitPrice: z.number(),
  /** Descuento de la línea (0 en la muestra de referencia). */
  discountAmount: z.number(),
  /** Total neto de la línea: `quantity × unitPrice - discountAmount`. */
  lineNetAmount: z.number(),
  /** Total del comprobante; repetido en cada línea, agregar una sola vez por `sourceTransactionId`. */
  invoiceTotalAmount: z.number(),
  /** Número visible de factura; NO es clave única. */
  invoiceNumber: z.string().min(1),
  /** Identificador de la operación/factura. Derivado de `Operación`; obligatorio. */
  sourceTransactionId: z.string().min(1),
  /** Código ISO 4217. Una sola moneda por organización en el MVP. */
  currency: z.literal(CURRENCY),
  /** Comprobante anulado: excluido de la analítica. */
  isVoided: z.boolean(),
});

export type FactVentaLinea = z.infer<typeof factVentaLineaSchema>;

/** Entrada del catálogo de sucursales (dimensión). */
export interface Sucursal {
  code: string;
  name: string;
}

/** Cobertura temporal y frescura del dataset publicado. */
export interface CoberturaDatos {
  /** Primera fecha con datos, ISO. `null` si no hay datos. */
  desde: string | null;
  /** Última fecha con datos, ISO. `null` si no hay datos. */
  hasta: string | null;
  /** Instante ISO de la última carga exitosa. */
  ultimaCargaAt: string;
  /** Etiqueta del origen de datos (p. ej. "Datos de demostración"). */
  fuente: string;
}
