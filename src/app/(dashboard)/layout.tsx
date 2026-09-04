import { getSalesSource } from "@/infrastructure/data";
import { formatDateTime } from "@/ui/format";
import { AppShell } from "@/ui/layout/app-shell";

/**
 * Layout del área de dashboard: obtiene catálogo de sucursales y cobertura
 * a través del port `SalesSource` (nunca del adapter directo, regla 3 de
 * AGENTS.md) y los pasa al shell persistente.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const source = getSalesSource();
  const [sucursales, cobertura] = await Promise.all([
    source.obtenerSucursales(),
    source.obtenerCobertura(),
  ]);

  return (
    <AppShell
      sucursales={sucursales}
      cobertura={cobertura}
      ultimaActualizacion={formatDateTime(cobertura.ultimaCargaAt)}
    >
      {children}
    </AppShell>
  );
}
