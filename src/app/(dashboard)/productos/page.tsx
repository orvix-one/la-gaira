import { getProductos } from "@/application/productos";
import { resolverFiltros } from "@/application/filtros";
import { getSalesSource } from "@/infrastructure/data";
import { PageHeader } from "@/ui/components/page-header";
import { KpiCard } from "@/ui/components/kpi-card";
import { EmptyState } from "@/ui/components/states";
import { ChartCard } from "@/ui/charts/chart-card";
import { ShareDonutChart } from "@/ui/charts/share-donut-chart";
import { RankingBarChart } from "@/ui/charts/ranking-bar-chart";
import { ProductosTable } from "@/ui/tables/productos-table";
import { cargarFiltros } from "@/ui/filters/server";
import { formatNumber } from "@/ui/format";

const TOP_GRAFICO = 10;

/** Vista 3 — Productos (spec §9.5). */
export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const source = getSalesSource();
  const { filtros, cobertura } = await resolverFiltros(await cargarFiltros(searchParams), source);
  const view = await getProductos(source, filtros, cobertura);

  const sinDatos = view.productos.length === 0;

  return (
    <>
      <PageHeader
        titulo="Productos"
        descripcion="Productos y categorías que impulsan o frenan las ventas."
        filtros={filtros}
      />

      {sinDatos ? (
        <EmptyState
          titulo="Sin datos para el periodo seleccionado"
          descripcion="No hay ventas de productos en este rango. Prueba con otro periodo o limpia los filtros."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard titulo="Productos vendidos" valor={formatNumber(view.totalProductos)} />
            <KpiCard titulo="Categorías" valor={formatNumber(view.porCategoria.length)} />
            <KpiCard
              titulo="Líder del periodo"
              valor={view.productos[0]?.nombre ?? "—"}
              ayuda={view.productos[0]?.categoria}
            />
            <KpiCard
              titulo="Categoría líder"
              valor={view.porCategoria[0]?.categoria ?? "—"}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-5">
            <ChartCard
              titulo={`Top ${TOP_GRAFICO} productos`}
              descripcion="Por ventas atribuidas · BOB"
              className="xl:col-span-3"
            >
              <RankingBarChart
                datos={view.productos
                  .slice(0, TOP_GRAFICO)
                  .map((p) => ({ nombre: p.nombre, valor: p.ventas }))}
              />
            </ChartCard>
            <ChartCard
              titulo="Distribución por categoría"
              descripcion="Participación en ventas del periodo"
              className="xl:col-span-2"
            >
              <ShareDonutChart
                datos={view.porCategoria.map((c) => ({
                  nombre: c.categoria,
                  valor: c.ventas,
                  participacion: c.participacion,
                }))}
              />
            </ChartCard>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-sm font-semibold text-neutral-950">
              Todos los productos ({formatNumber(view.totalProductos)})
            </h2>
            <ProductosTable filas={view.productos} />
          </div>
        </>
      )}
    </>
  );
}
