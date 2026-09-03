import { createLoader, parseAsString } from "nuqs/server";

const loadFiltros = createLoader({
  desde: parseAsString,
  hasta: parseAsString,
  sucursal: parseAsString,
});

export type SearchParamsPage = Promise<Record<string, string | string[] | undefined>>;

/**
 * Carga los filtros globales desde el `searchParams` de una página.
 *
 * Los parsers se importan desde `nuqs/server`: reutilizar aquí los parsers
 * de la entrada cliente `nuqs` produciría referencias de Client Component
 * que no pueden ejecutarse durante el render del servidor.
 */
export async function cargarFiltros(searchParams: SearchParamsPage) {
  const sp = await searchParams;
  return loadFiltros({
    desde: sp.desde,
    hasta: sp.hasta,
    sucursal: sp.sucursal,
  });
}
