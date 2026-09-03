/**
 * Reexportación pública del port `SalesSource` (regla 3 de AGENTS.md).
 *
 * El contrato se define en dominio para que `application` no dependa de
 * infraestructura. Los adapters se conectan a través de esta entrada.
 */
export type { SalesSource } from "@/domain/sales";
