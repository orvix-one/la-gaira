import { getVentasGeneral } from "@/application/ventas-general";
import { resolverFiltros } from "@/application/filtros";
import { getSalesSource } from "@/infrastructure/data";
import { PageHeader } from "@/ui/components/page-header";
import { KpiCard } from "@/ui/components/kpi-card";
import { EmptyState } from "@/ui/components/states";
import { ChartCard } from "@/ui/charts/chart-card";
import { TrendChart } from "@/ui/charts/trend-chart";
import { RankingBarChart } from "@/ui/charts/ranking-bar-chart";
import { DesempenoTable } from "@/ui/tables/desempeno-table";
import { cargarFiltros } from "@/ui/filters/server";
import { formatMoney, formatNumber, formatVariation } from "@/ui/format";

/** Vista 1 — Ventas General (spec §9.3). */
export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const source = getSalesSource();
  const { filtros, cobertura } = await resolverFiltros(await cargarFiltros(searchParams), source);
  const view = await getVentasGeneral(source, filtros, cobertura);

  const sinDatos = view.kpis.transacciones.valor === 0;

  return (
    <>
      <PageHeader
        titulo="Ventas General"
        descripcion="Cuánto se vendió, cómo evoluciona y qué sucursales explican el resultado."
        filtros={filtros}
      />

      {sinDatos ? (
        <EmptyState
          titulo="Sin datos para el periodo seleccionado"
          descripcion="No hay ventas publicadas en este rango. Prueba con otro periodo o limpia los filtros."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard
              titulo="Ventas netas"
              valor={formatMoney(view.kpis.ventasNetas.valor ?? 0)}
              variacion={formatVariation(view.kpis.ventasNetas.variacion)}
            />
            <KpiCard
              titulo="Unidades"
              valor={formatNumber(view.kpis.unidades.valor ?? 0)}
              variacion={formatVariation(view.kpis.unidades.variacion)}
            />
            <KpiCard
              titulo="Transacciones"
              valor={formatNumber(view.kpis.transacciones.valor ?? 0)}
              variacion={formatVariation(view.kpis.transacciones.variacion)}
            />
            <KpiCard
              titulo="Ticket promedio"
              valor={
                view.kpis.ticketPromedio.valor === null
                  ? "—"
                  : formatMoney(view.kpis.ticketPromedio.valor)
              }
              variacion={formatVariation(view.kpis.ticketPromedio.variacion)}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-5">
            <ChartCard
              titulo="Evolución de ventas"
              descripcion={`Ventas netas por ${view.granularidad === "dia" ? "día" : view.granularidad === "semana" ? "semana" : "mes"} · BOB`}
              className="xl:col-span-3"
            >
              <TrendChart datos={view.tendencia} granularidad={view.granularidad} />
            </ChartCard>
            <ChartCard
              titulo="Ventas por sucursal"
              descripcion="Ordenadas de mayor a menor · BOB"
              className="xl:col-span-2"
            >
              <RankingBarChart
                datos={view.ventasPorSucursal.map((s) => ({ nombre: s.sucursal, valor: s.ventas }))}
              />
            </ChartCard>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-sm font-semibold text-neutral-950">
              Desempeño por periodo y sucursal
            </h2>
            <DesempenoTable filas={view.desempeno} granularidad={view.granularidad} />
          </div>
        </>
      )}
    </>
  );
}
