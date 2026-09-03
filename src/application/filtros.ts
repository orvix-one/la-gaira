import {
  esRangoValido,
  type CoberturaDatos,
  type FiltrosGlobales,
  type RangoFechas,
  type SalesSource,
} from "@/domain/sales";

/**
 * Parámetros crudos de URL → filtros efectivos.
 *
 * Reglas (spec §6.3):
 * - Sin fechas válidas en la URL, el periodo por defecto es el último mes
 *   completo disponible en el dataset, y se muestra claramente ese rango.
 * - Un código de sucursal desconocido se descarta (equivale a "todas").
 */
export async function resolverFiltros(
  params: { desde?: string | null; hasta?: string | null; sucursal?: string | null },
  source: SalesSource,
): Promise<{ filtros: FiltrosGlobales; cobertura: CoberturaDatos }> {
  const [cobertura, sucursales] = await Promise.all([
    source.fetchCobertura(),
    source.fetchSucursales(),
  ]);

  const rango = rangoDesdeParams(params, cobertura);
  const sucursalValida =
    params.sucursal && sucursales.some((s) => s.code === params.sucursal)
      ? params.sucursal
      : undefined;

  return { filtros: { rango, sucursal: sucursalValida }, cobertura };
}

function rangoDesdeParams(
  params: { desde?: string | null; hasta?: string | null },
  cobertura: CoberturaDatos,
): RangoFechas {
  const crudo: RangoFechas = {
    desde: params.desde ?? "",
    hasta: params.hasta ?? "",
  };
  if (esRangoValido(crudo)) {
    // Acota al universo con datos para no consultar vacíos.
    const desde = cobertura.desde && crudo.desde < cobertura.desde ? cobertura.desde : crudo.desde;
    const hasta = cobertura.hasta && crudo.hasta > cobertura.hasta ? cobertura.hasta : crudo.hasta;
    if (desde <= hasta) return { desde, hasta };
  }
  return ultimoMesDisponible(cobertura);
}

/** Último mes calendario cubierto por el dataset. */
function ultimoMesDisponible(cobertura: CoberturaDatos): RangoFechas {
  const hasta = cobertura.hasta ?? new Date().toISOString().slice(0, 10);
  return { desde: `${hasta.slice(0, 7)}-01`, hasta };
}
