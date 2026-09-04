import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getInicio } from "@/application/inicio";
import { getProductos } from "@/application/productos";
import { getSucursalDetalle, getSucursales } from "@/application/sucursales";
import { getVentasGeneral } from "@/application/ventas-general";
import type { DashboardCompartido } from "@/domain/sales";
import { getSalesSource, type SalesSource } from "@/infrastructure/data";
import { obtenerDashboardTemporal } from "@/infrastructure/data/temporary-dashboard-store";
import { ChartCard } from "@/ui/charts/chart-card";
import { RankingBarChart } from "@/ui/charts/ranking-bar-chart";
import { ShareDonutChart } from "@/ui/charts/share-donut-chart";
import { SucursalesTrendChart } from "@/ui/charts/sucursales-trend-chart";
import { TrendChart } from "@/ui/charts/trend-chart";
import { KpiCard } from "@/ui/components/kpi-card";
import {
  formatDateTime,
  formatMoney,
  formatNumber,
  formatRango,
  formatVariation,
} from "@/ui/format";
import { DesempenoTable } from "@/ui/tables/desempeno-table";
import { ProductosTable } from "@/ui/tables/productos-table";
import { SucursalesTable } from "@/ui/tables/sucursales-table";

export const dynamic = "force-dynamic";

export default async function DashboardCompartidoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const dashboard = await obtenerDashboardTemporal(token);
  if (!dashboard) notFound();

  const source = getSalesSource();
  const cobertura = await source.obtenerCobertura();
  let contenido: ReactNode;

  if (dashboard.pathname === "/") {
    const view = await getInicio(source, dashboard.filtros, cobertura);
    contenido = (
      <>
        {alguna(dashboard, ["ventas_netas", "transacciones", "ticket_promedio", "sucursales_activas"]) ? (
          <GridKpis>
            {incluye(dashboard, "ventas_netas") ? <KpiCard titulo="Ventas netas" valor={formatMoney(view.kpis.ventasNetas)} /> : null}
            {incluye(dashboard, "transacciones") ? <KpiCard titulo="Transacciones" valor={formatNumber(view.kpis.transacciones)} /> : null}
            {incluye(dashboard, "ticket_promedio") ? <KpiCard titulo="Ticket promedio" valor={view.kpis.ticketPromedio === null ? "—" : formatMoney(view.kpis.ticketPromedio)} /> : null}
            {incluye(dashboard, "sucursales_activas") ? <KpiCard titulo="Sucursales" valor={formatNumber(view.sucursalesActivas)} /> : null}
          </GridKpis>
        ) : null}
        {incluye(dashboard, "estado_datos") ? (
          <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-950">Estado de los datos</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <Dato label="Fuente" value={view.cobertura.fuente} />
              <Dato label="Última carga" value={formatDateTime(view.cobertura.ultimaCargaAt)} />
              <Dato label="Cobertura" value={view.cobertura.desde && view.cobertura.hasta ? formatRango({ desde: view.cobertura.desde, hasta: view.cobertura.hasta }) : "Sin datos"} />
            </dl>
          </section>
        ) : null}
      </>
    );
  } else if (dashboard.pathname === "/ventas") {
    contenido = await VentasCompartidas({ dashboard, source, cobertura });
  } else if (dashboard.pathname === "/productos") {
    contenido = await ProductosCompartidos({ dashboard, source, cobertura });
  } else if (dashboard.pathname === "/sucursales") {
    contenido = await SucursalesCompartidas({ dashboard, source, cobertura });
  } else {
    const match = dashboard.pathname.match(/^\/sucursales\/(.+)$/);
    if (!match) notFound();
    const view = await getSucursalDetalle(
      source,
      decodeURIComponent(match[1]),
      dashboard.filtros,
      cobertura,
    );
    if (!view) notFound();
    contenido = (
      <>
        {alguna(dashboard, ["ventas_netas", "unidades", "transacciones", "ticket_promedio"]) ? (
          <GridKpis>
            {incluye(dashboard, "ventas_netas") ? <KpiCard titulo="Ventas netas" valor={formatMoney(view.kpis.ventasNetas)} variacion={formatVariation(view.kpis.variacionVentas)} /> : null}
            {incluye(dashboard, "unidades") ? <KpiCard titulo="Unidades" valor={formatNumber(view.kpis.unidades)} /> : null}
            {incluye(dashboard, "transacciones") ? <KpiCard titulo="Transacciones" valor={formatNumber(view.kpis.transacciones)} /> : null}
            {incluye(dashboard, "ticket_promedio") ? <KpiCard titulo="Ticket promedio" valor={view.kpis.ticketPromedio === null ? "—" : formatMoney(view.kpis.ticketPromedio)} /> : null}
          </GridKpis>
        ) : null}
        {alguna(dashboard, ["tendencia_ventas", "productos_principales"]) ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {incluye(dashboard, "tendencia_ventas") ? (
              <ChartCard titulo="Evolución de ventas" descripcion="Ventas netas · BOB">
                <TrendChart datos={view.tendencia} granularidad={view.granularidad} />
              </ChartCard>
            ) : null}
            {incluye(dashboard, "productos_principales") ? (
              <ChartCard titulo="Productos principales" descripcion="Todos los productos destacados · BOB">
                <TablaProductosSucursal productos={view.topProductos} />
              </ChartCard>
            ) : null}
          </div>
        ) : null}
      </>
    );
  }

  return <VistaCompartida dashboard={dashboard}>{contenido}</VistaCompartida>;
}

async function VentasCompartidas({ dashboard, source, cobertura }: PropsVista) {
  const view = await getVentasGeneral(source, dashboard.filtros, cobertura);
  return (
    <>
      {alguna(dashboard, ["ventas_netas", "unidades", "transacciones", "ticket_promedio"]) ? (
        <GridKpis>
          {incluye(dashboard, "ventas_netas") ? <KpiCard titulo="Ventas netas" valor={formatMoney(view.kpis.ventasNetas.valor ?? 0)} variacion={formatVariation(view.kpis.ventasNetas.variacion)} /> : null}
          {incluye(dashboard, "unidades") ? <KpiCard titulo="Unidades" valor={formatNumber(view.kpis.unidades.valor ?? 0)} variacion={formatVariation(view.kpis.unidades.variacion)} /> : null}
          {incluye(dashboard, "transacciones") ? <KpiCard titulo="Transacciones" valor={formatNumber(view.kpis.transacciones.valor ?? 0)} variacion={formatVariation(view.kpis.transacciones.variacion)} /> : null}
          {incluye(dashboard, "ticket_promedio") ? <KpiCard titulo="Ticket promedio" valor={view.kpis.ticketPromedio.valor === null ? "—" : formatMoney(view.kpis.ticketPromedio.valor)} variacion={formatVariation(view.kpis.ticketPromedio.variacion)} /> : null}
        </GridKpis>
      ) : null}
      {alguna(dashboard, ["tendencia_ventas", "ventas_sucursal"]) ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-5">
          {incluye(dashboard, "tendencia_ventas") ? <ChartCard titulo="Evolución de ventas" descripcion="Ventas netas del periodo · BOB" className="xl:col-span-3"><TrendChart datos={view.tendencia} granularidad={view.granularidad} /></ChartCard> : null}
          {incluye(dashboard, "ventas_sucursal") ? <ChartCard titulo="Ventas por sucursal" descripcion="Todas las sucursales · BOB" className="xl:col-span-2"><RankingBarChart datos={view.ventasPorSucursal.map((item) => ({ nombre: item.sucursal, valor: item.ventas }))} /></ChartCard> : null}
        </div>
      ) : null}
      {incluye(dashboard, "desempeno") ? <section className="mt-5"><h2 className="mb-2 text-sm font-semibold text-neutral-950">Desempeño completo por periodo y sucursal</h2><DesempenoTable filas={view.desempeno} granularidad={view.granularidad} /></section> : null}
    </>
  );
}

async function ProductosCompartidos({ dashboard, source, cobertura }: PropsVista) {
  const view = await getProductos(source, dashboard.filtros, cobertura);
  return (
    <>
      {alguna(dashboard, ["productos_vendidos", "categorias", "producto_lider", "categoria_lider"]) ? <GridKpis>
        {incluye(dashboard, "productos_vendidos") ? <KpiCard titulo="Productos vendidos" valor={formatNumber(view.totalProductos)} /> : null}
        {incluye(dashboard, "categorias") ? <KpiCard titulo="Categorías" valor={formatNumber(view.porCategoria.length)} /> : null}
        {incluye(dashboard, "producto_lider") ? <KpiCard titulo="Producto líder" valor={view.productos[0]?.nombre ?? "—"} ayuda={view.productos[0]?.categoria} /> : null}
        {incluye(dashboard, "categoria_lider") ? <KpiCard titulo="Categoría líder" valor={view.porCategoria[0]?.categoria ?? "—"} /> : null}
      </GridKpis> : null}
      {alguna(dashboard, ["ranking_productos", "distribucion_categorias"]) ? <div className="mt-5 grid gap-4 xl:grid-cols-5">
        {incluye(dashboard, "ranking_productos") ? <ChartCard titulo="Productos por ventas" descripcion="Top 10 · BOB" className="xl:col-span-3"><RankingBarChart datos={view.productos.slice(0, 10).map((item) => ({ nombre: item.nombre, valor: item.ventas }))} /></ChartCard> : null}
        {incluye(dashboard, "distribucion_categorias") ? <ChartCard titulo="Distribución por categoría" descripcion="Todas las categorías" className="xl:col-span-2"><ShareDonutChart datos={view.porCategoria.map((item) => ({ nombre: item.categoria, valor: item.ventas, participacion: item.participacion }))} /></ChartCard> : null}
      </div> : null}
      {incluye(dashboard, "tabla_productos") ? <section className="mt-5"><h2 className="mb-2 text-sm font-semibold text-neutral-950">Todos los productos ({formatNumber(view.totalProductos)})</h2><ProductosTable filas={view.productos} /></section> : null}
    </>
  );
}

async function SucursalesCompartidas({ dashboard, source, cobertura }: PropsVista) {
  const view = await getSucursales(source, dashboard.filtros, cobertura);
  return (
    <>
      {alguna(dashboard, ["ranking_sucursales", "tendencia_sucursales"]) ? <div className="grid gap-4 xl:grid-cols-5">
        {incluye(dashboard, "ranking_sucursales") ? <ChartCard titulo="Ranking por ventas netas" descripcion="Todas las sucursales · BOB" className="xl:col-span-2"><RankingBarChart datos={view.ranking.map((item) => ({ nombre: item.sucursal, valor: item.ventasNetas }))} /></ChartCard> : null}
        {incluye(dashboard, "tendencia_sucursales") ? <ChartCard titulo="Evolución comparada" descripcion="Sucursales con más ventas · BOB" className="xl:col-span-3"><SucursalesTrendChart series={view.tendencia} granularidad={view.granularidad} /></ChartCard> : null}
      </div> : null}
      {incluye(dashboard, "tabla_sucursales") ? <section className="mt-5"><h2 className="mb-2 text-sm font-semibold text-neutral-950">Detalle completo por sucursal</h2><SucursalesTable filas={view.ranking} enlacesDetalle={false} /></section> : null}
    </>
  );
}

function VistaCompartida({ dashboard, children }: { dashboard: DashboardCompartido; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-canvas px-4 py-8 sm:px-6">
      <article className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-2xl bg-[#090707] p-6 text-white shadow-xl sm:p-8">
          <div className="flex items-center gap-3">
            <Image src="/lagaira.jpg" alt="La Gaira" width={40} height={40} className="rounded-full" />
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-brand-300 uppercase">La Gaira · Dashboard compartido</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{tituloDe(dashboard.pathname)}</h1>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/10 px-3 py-1.5">{formatRango(dashboard.filtros.rango)}</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">{dashboard.filtros.sucursal ?? "Todas las sucursales"}</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">Moneda: BOB</span>
            <span className="rounded-full bg-brand-600 px-3 py-1.5">Solo lectura</span>
          </div>
        </header>
        {children}
        <footer className="mt-6 flex flex-wrap justify-between gap-2 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
          <span>Enlace generado: {formatDateTime(dashboard.generadoAt)}</span>
          <span>Disponible hasta: {formatDateTime(dashboard.expiraAt)}</span>
        </footer>
      </article>
    </main>
  );
}

function GridKpis({ children }: { children: ReactNode }) {
  return <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</section>;
}

function Dato({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-neutral-500">{label}</dt><dd className="mt-1 font-medium text-neutral-800">{value}</dd></div>;
}

function TablaProductosSucursal({ productos }: { productos: Array<{ productCode: string; productName: string; categoryName: string; ventas: number; unidades: number }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-neutral-200 text-left text-xs text-neutral-500"><th className="py-2">Producto</th><th className="py-2 text-right">Ventas</th><th className="py-2 text-right">Unidades</th></tr></thead>
        <tbody className="divide-y divide-neutral-100">
          {productos.map((item) => <tr key={item.productCode}><td className="py-2.5"><span className="font-medium text-neutral-950">{item.productName}</span><small className="block text-neutral-400">{item.categoryName}</small></td><td className="py-2.5 text-right font-medium">{formatMoney(item.ventas)}</td><td className="py-2.5 text-right">{formatNumber(item.unidades)}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

function tituloDe(pathname: string): string {
  if (pathname === "/") return "Resumen ejecutivo";
  if (pathname === "/ventas") return "Ventas General";
  if (pathname === "/productos") return "Productos";
  if (pathname === "/sucursales") return "Sucursales";
  return decodeURIComponent(pathname.slice("/sucursales/".length));
}

function incluye(dashboard: DashboardCompartido, metrica: string): boolean {
  return dashboard.metricas.includes(metrica);
}

function alguna(dashboard: DashboardCompartido, metricas: string[]): boolean {
  return metricas.some((metrica) => incluye(dashboard, metrica));
}

type PropsVista = {
  dashboard: DashboardCompartido;
  source: SalesSource;
  cobertura: Awaited<ReturnType<SalesSource["obtenerCobertura"]>>;
};
