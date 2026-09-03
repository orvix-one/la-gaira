import Link from "next/link";
import { notFound } from "next/navigation";
import { getSucursalDetalle } from "@/application/sucursales";
import { resolverFiltros } from "@/application/filtros";
import { getSalesSource } from "@/infrastructure/data";
import { PageHeader } from "@/ui/components/page-header";
import { KpiCard, VariacionBadge } from "@/ui/components/kpi-card";
import { EmptyState } from "@/ui/components/states";
import { ChartCard } from "@/ui/charts/chart-card";
import { TrendChart } from "@/ui/charts/trend-chart";
import { cargarFiltros } from "@/ui/filters/server";
import { IconAtras } from "@/ui/components/icons";
import {
  formatMoney,
  formatNumber,
  formatVariation,
} from "@/ui/format";

/** Detalle de una sucursal (spec §9.4): resumen, tendencia y productos principales. */
export default async function SucursalDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const source = getSalesSource();
  const { filtros, cobertura } = await resolverFiltros(await cargarFiltros(searchParams), source);
  const view = await getSucursalDetalle(source, id, filtros, cobertura);

  if (!view) notFound();

  const sinDatos = view.kpis.transacciones === 0;

  return (
    <>
      <Link
        href="/sucursales"
        className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-neutral-600 transition-colors hover:text-brand-700"
      >
        <IconAtras className="h-4 w-4" />
        Volver a Sucursales
      </Link>

      <PageHeader
        titulo={view.sucursal.name}
        descripcion="Desempeño de la sucursal en el periodo seleccionado."
        filtros={filtros}
        acciones={
          <VariacionBadge
            valor={formatVariation(view.kpis.variacionVentas)}
            direccion={
              view.kpis.variacionVentas === null
                ? "neutral"
                : view.kpis.variacionVentas > 0
                  ? "sube"
                  : view.kpis.variacionVentas < 0
                    ? "baja"
                    : "neutral"
            }
          />
        }
      />

      {sinDatos ? (
        <EmptyState
          titulo="Sin ventas en el periodo seleccionado"
          descripcion="Esta sucursal no registró ventas en el rango elegido. Prueba con otro periodo."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard titulo="Ventas netas" valor={formatMoney(view.kpis.ventasNetas)} />
            <KpiCard titulo="Unidades" valor={formatNumber(view.kpis.unidades)} />
            <KpiCard titulo="Transacciones" valor={formatNumber(view.kpis.transacciones)} />
            <KpiCard
              titulo="Ticket promedio"
              valor={view.kpis.ticketPromedio === null ? "—" : formatMoney(view.kpis.ticketPromedio)}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <ChartCard titulo="Evolución de ventas" descripcion="Ventas netas · BOB">
              <TrendChart datos={view.tendencia} granularidad={view.granularidad} />
            </ChartCard>
            <ChartCard
              titulo="Productos principales"
              descripcion={`Top ${view.topProductos.length} por ventas atribuidas · BOB`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                      <th className="py-2 pr-3">Producto</th>
                      <th className="py-2 pr-3 text-right">Ventas</th>
                      <th className="py-2 text-right">Unidades</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {view.topProductos.map((p) => (
                      <tr key={p.productCode}>
                        <td className="py-2.5 pr-3">
                          <p className="font-medium text-neutral-950">{p.productName}</p>
                          <p className="text-xs text-neutral-400">{p.categoryName}</p>
                        </td>
                        <td className="py-2.5 pr-3 text-right font-medium text-neutral-950 tabular-nums">
                          {formatMoney(p.ventas)}
                        </td>
                        <td className="py-2.5 text-right text-neutral-700 tabular-nums">
                          {formatNumber(p.unidades)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </>
  );
}
