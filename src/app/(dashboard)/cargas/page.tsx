import { PageHeader } from "@/ui/components/page-header";

/**
 * Cargas (spec §10.1, sección administrativa): la importación CSV depende
 * del backend (Fase de datos). Página informativa sin funcionalidad rota.
 */
export default function CargasPage() {
  return (
    <>
      <PageHeader
        titulo="Cargas"
        descripcion="Importación y validación de archivos de ventas."
      />
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_8px_28px_rgba(23,19,19,0.05)]">
        <p className="text-sm text-neutral-700">
          La carga de archivos estará disponible cuando el backend esté implementado. El flujo
          previsto (según la especificación) es:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-600 marker:font-semibold marker:text-brand-500">
          <li>Seleccionar o arrastrar un archivo CSV.</li>
          <li>Validación automática de estructura y contenido.</li>
          <li>Resumen de filas válidas, advertencias y cuarentena, con vista previa.</li>
          <li>Confirmación explícita antes de publicar.</li>
          <li>Historial de cargas con conteos y resultado.</li>
        </ol>
        <p className="mt-4 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-xs text-brand-800">
          Mientras tanto, las vistas analíticas funcionan con datos de demostración.
        </p>
      </div>
    </>
  );
}
