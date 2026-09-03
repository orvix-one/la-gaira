# Tasks: UI de las 3 vistas con datos de demostración

- [x] Instalar `recharts` y registrar la decisión (ver plan.md)
- [x] `src/domain/sales`: contrato canónico, filtros, fórmulas KPI
- [x] `src/infrastructure/data`: port `SalesSource` + adapter demo determinista
- [x] `src/application`: casos de uso inicio / ventas / sucursales / productos
- [x] `src/ui`: AppShell + registro de módulos + FilterBar (nuqs)
- [x] `src/ui/charts`: wrappers Recharts (tendencia, barras ranking, participación)
- [x] `src/ui/components`: KpiCard, DataTable, estados (cargando/vacío/sin resultados/error), formatos
- [x] Páginas: `/`, `/ventas`, `/sucursales`, `/sucursales/[id]`, `/productos`, `/cargas`
- [x] Estados: `loading.tsx` (skeletons) y `error.tsx` (reintento) por vista
- [x] `npm run typecheck` en verde
- [x] `npm run lint` en verde
- [x] `npm run build` en verde
- [x] Smoke test HTTP con `npm run dev`: rutas y filtros de URL
- [ ] Revisión visual manual a 360 px y escritorio (requiere navegador)
- [x] Actualizar `AGENTS.md` y `ARCHITECTURE.md` (charts y seam de datos)
