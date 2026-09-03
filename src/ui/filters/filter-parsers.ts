import { parseAsString } from "nuqs";

/**
 * Parsers de los filtros globales en URL (RF-027), compartidos entre el
 * cliente (`useQueryStates`) y el servidor (`createSearchParamsCache`).
 * Las fechas viajan como texto `YYYY-MM-DD` y se validan en dominio
 * (`esRangoValido`); así evitamos ambigüedades de zona horaria.
 */
export const filterParsers = {
  desde: parseAsString,
  hasta: parseAsString,
  sucursal: parseAsString,
};

export type FiltrosUrl = {
  desde?: string | null;
  hasta?: string | null;
  sucursal?: string | null;
};
