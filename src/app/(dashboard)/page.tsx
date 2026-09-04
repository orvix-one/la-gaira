import Link from "next/link";
import { getInicio } from "@/application/inicio";
import { resolverFiltros } from "@/application/filtros";
import { getSalesSource } from "@/infrastructure/data";
import { modulosVisibles } from "@/ui/modules";
import { PageHeader } from "@/ui/components/page-header";
import { KpiCard } from "@/ui/components/kpi-card";
import { formatDateLong, formatDateTime, formatMoney, formatNumber } from "@/ui/format";
import { cargarFiltros } from "@/ui/filters/server";

/** Inicio/resumen (spec §10.1): acceso a la última carga y a las tres vistas. */
export default async function InicioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const source = getSalesSource();
  const { filtros, cobertura } = await resolverFiltros(await cargarFiltros(searchParams), source);
  const view = await getInicio(source, filtros, cobertura);

  return (
    <>
      <PageHeader
        titulo="Resumen ejecutivo"
        descripcion="Panorama del último periodo disponible y acceso a las vistas analíticas."
        filtros={filtros}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard metricaId="ventas_netas" titulo="Ventas netas" valor={formatMoney(view.kpis.ventasNetas)} />
        <KpiCard metricaId="transacciones" titulo="Transacciones" valor={formatNumber(view.kpis.transacciones)} />
        <KpiCard
          metricaId="ticket_promedio"
          titulo="Ticket promedio"
          valor={view.kpis.ticketPromedio === null ? "—" : formatMoney(view.kpis.ticketPromedio)}
        />
        <KpiCard metricaId="sucursales_activas" titulo="Sucursales" valor={formatNumber(view.sucursalesActivas)} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {modulosVisibles("principal")
          .filter((m) => m.id !== "inicio")
          .map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(23,19,19,0.05)] transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_14px_36px_rgba(23,19,19,0.09)]"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-brand-500 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <m.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-base font-semibold text-neutral-950 group-hover:text-brand-700">
                {m.label}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">{m.descripcion}</p>
            </Link>
          ))}
      </div>

      <section data-dashboard-metric="estado_datos" className="mt-6 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(23,19,19,0.05)]">
        <h2 className="text-sm font-semibold text-neutral-950">Estado de los datos</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-neutral-500">Fuente</dt>
            <dd className="mt-0.5 font-medium text-neutral-800">{view.cobertura.fuente}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Última carga exitosa</dt>
            <dd className="mt-0.5 font-medium text-neutral-800">
              {formatDateTime(view.cobertura.ultimaCargaAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Cobertura temporal</dt>
            <dd className="mt-0.5 font-medium text-neutral-800">
              {view.cobertura.desde && view.cobertura.hasta
                ? `${formatDateLong(view.cobertura.desde)} – ${formatDateLong(view.cobertura.hasta)}`
                : "Sin datos"}
            </dd>
          </div>
        </dl>
        <p className="mt-4 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-xs text-brand-800">
          Estás viendo datos de demostración. La conexión con la fuente real se habilita cuando el
          backend esté disponible.
        </p>
      </section>
    </>
  );
}
