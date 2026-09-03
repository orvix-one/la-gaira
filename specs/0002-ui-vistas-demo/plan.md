# Plan: UI de las 3 vistas con datos de demostración

## Diseño técnico

### Capas (respeta la dirección `app → application → domain ← infrastructure`)

```
src/domain/sales/
  contract.ts     FactVentaLinea (tipo + esquema zod), Branch, ProductRef — contrato canónico (spec §7.5)
  filters.ts      DateRange, GlobalFilters, resolución de periodo por defecto (último periodo disponible)
  kpis.ts         Fórmulas puras de spec §9.2 (ventas netas, transacciones, ticket promedio,
                  unidades netas, precio medio, variación, participación)
  source.ts       Port SalesSource definido en dominio (inversión de dependencias)

src/infrastructure/data/
  port.ts         Reexportación pública de SalesSource para los adapters
  index.ts        getSalesSource(): selección de adapter por env SALES_SOURCE (default "demo")
  adapters/demo/  Adapter determinista (PRNG con semilla fija): julio + agosto 2026,
                  8 sucursales comerciales, ~96 productos en 8 categorías, moneda BOB

src/application/
  ventas-general.ts   KPIs + serie temporal (granularidad auto día/semana/mes) + barras por sucursal
                      + tabla de desempeño + resumen de calidad/frescura
  sucursales.ts       Ranking + KPIs por sucursal + participación + detalle de una sucursal
  productos.ts        Ranking + distribución por categoría + tabla con búsqueda + Top N (10/20/50)
  inicio.ts           Resumen ejecutivo + acceso a vistas + estado de la última carga

src/ui/
  layout/         AppShell (sidebar escritorio / header + drawer móvil), registro de módulos (RF-030/032)
  filters/        FilterBar cliente (nuqs): rango de fechas + sucursal; parsers compartidos server/client
  charts/         Wrappers propios sobre Recharts (nada de lógica de datos)
  components/     KpiCard, DataTable, estados (Empty, NoResults, ErrorState, skeletons), formatos es-BO/BOB

src/app/(dashboard)/
  layout.tsx      AppShell + NuqsAdapter
  page.tsx        Inicio
  ventas/ sucursales/ sucursales/[id]/ productos/ cargas/
```

### Flujo de datos por página

1. La página (Server Component) lee `searchParams` con el caché de parsers nuqs compartido.
2. Resuelve filtros efectivos (si no hay fechas → último periodo disponible del dataset).
3. Llama al caso de uso de `application`, que pide líneas al port `SalesSource`.
4. El caso de uso calcula con las funciones puras de `domain` y devuelve un view model tipado.
5. La página pasa el view model a componentes de `src/ui` (charts son Client Components).

### Reglas de negocio aplicadas

- **Ventas netas** = `SUM(invoice_total_amount)` una vez por `source_transaction_id` válido y no anulado (spec §9.2).
- **Variación** = `(actual - anterior) / ABS(anterior)`; si el anterior es 0 → `—`.
- **Periodo anterior** de igual duración que el activo, inmediatamente precedente.
- **Participación** = valor del elemento / total filtrado.
- **Sucursal sin ventas en el periodo** se muestra con cero (spec §9.4).
- **Top N** (10/20/50); agrupar "Otros" solo en gráficos, nunca en tablas/exportaciones.
- Filtro de fechas inclusivo; zona horaria de presentación `America/La_Paz`; moneda única BOB (DEC-005/006, fallback del MVP).
- Comparación y tendencia **no** mezclan sucursales: el filtro global de sucursal aplica a todas las vistas.

## Decisiones

| Decisión | Alternativas consideradas | Justificación |
|---|---|---|
| Charts: **Recharts** encapsulado en `src/ui/charts` | shadcn/ui (wrapper de Recharts), Tremor Raw | Spec §11.1 recomienda "Recharts, encapsulado en componentes propios". shadcn/ui es un generador de código, no una librería; se puede adoptar después sin cambiar los wrappers. Tremor Raw queda descartado por ahora. |
| Paleta de marca: negro, blanco cálido y rojo `#F62D29` | Sistema neutral inicial | El usuario aprobó usar los colores del logo el 2026-09-03. El rojo se reserva para acciones, selección y series principales; verde/rojo semántico conserva flechas y texto para no depender solo del color. |
| Adapter demo determinista en memoria | Mockear JSON estático | Generador con semilla fija da volúmenes realistas (~miles de líneas) y estabilidad entre builds; el archivo real llega con la BD. |
| Agregación en `application` sobre líneas del port | Agregados precomputados en el adapter | El contrato estable es la línea (`FactVentaLinea`); el adapter de BD devolverá la misma forma vía SQL. Para ~70k líneas el cálculo en Node es trivial. |
| `/cargas` como página informativa | Ocultar la entrada | Spec §10.1 la incluye en la navegación; se muestra deshabilitada/informativa sin funcionalidad rota. |
| Período demo: julio y agosto 2026 | Un solo mes | Permite comparación vs. periodo anterior (KPI con variación) desde el primer día. |
| Sin runner de tests todavía | Instalar Vitest ahora | Tooling no definido en el boilerplate; se registra como deuda y las fórmulas KPI quedan puras y aisladas. |

## Riesgos

- **Desajuste demo vs. datos reales** → el contrato canónico (`src/domain/sales`) es la única frontera; el adapter real debe satisfacer el mismo port (verificado por `typecheck`).
- **Volumen del adapter real** → si el adapter de BD devuelve 70k líneas por consulta, el cálculo en `application` sigue siendo viable; si crece, se mueven agregaciones al adapter sin tocar UI (el view model no cambia).
- **Recharts y SSR** → los charts se declaran `"use client"` y reciben datos serializables; evita problemas de hidratación.
