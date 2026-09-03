import { getSucursales } from "@/application/sucursales";
import { resolverFiltros } from "@/application/filtros";
import { getSalesSource } from "@/infrastructure/data";
import { PageHeader } from "@/ui/components/page-header";
import { EmptyState } from "@/ui/components/states";
import { ChartCard } from "@/ui/charts/chart-card";
import { RankingBarChart } from "@/ui/charts/ranking-bar-chart";
import { SucursalesTrendChart } from "@/ui/charts/sucursales-trend-chart";
import { SucursalesTable } from "@/ui/tables/sucursales-table";
import { cargarFiltros } from "@/ui/filters/server";

/** Vista 2 — Sucursales (spec §9.4): comparativa entre sucursales. */
export default async function SucursalesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const source = getSalesSource();
  const { filtros, cobertura } = await resolverFiltros(await cargarFiltros(searchParams), source);
  const view = await getSucursales(source, filtros, cobertura);

  const sinDatos = view.ranking.every((s) => s.transacciones === 0);

  return (
    <>
      <PageHeader
        titulo="Sucursales"
        descripcion="Comparativa de desempeño entre sucursales. Selecciona una para profundizar."
        filtros={filtros}
      />

      {sinDatos ? (
        <EmptyState
          titulo="Sin datos para el periodo seleccionado"
          descripcion="Ninguna sucursal registró ventas en este rango. Prueba con otro periodo o limpia los filtros."
        />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-5">
            <ChartCard
              titulo="Ranking por ventas netas"
              descripcion="Todas las sucursales del catálogo · BOB"
              className="xl:col-span-2"
            >
              <RankingBarChart
                datos={view.ranking.map((s) => ({ nombre: s.sucursal, valor: s.ventasNetas }))}
              />
            </ChartCard>
            <ChartCard
              titulo="Evolución comparada"
              descripcion="Las 5 sucursales con más ventas · BOB"
              className="xl:col-span-3"
            >
              <SucursalesTrendChart series={view.tendencia} granularidad={view.granularidad} />
            </ChartCard>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-sm font-semibold text-neutral-950">Detalle por sucursal</h2>
            <SucursalesTable filas={view.ranking} />
          </div>
        </>
      )}
    </>
  );
}
