# 0002 — UI de las 3 vistas con datos de demostración

> Incremento vertical basado en `specs/_template/spec.md` v0.2.0 (fuente de verdad del producto).

| Campo | Valor |
|---|---|
| Estado | Aprobado para implementación |
| Fecha | 2026-09-03 |
| Alcance | Fase 1, entregas 3 (parcial), 5, 6, 7 y 8 (parcial) de la secuencia recomendada (spec §22) |
| Fuera de alcance | Base de datos, importación CSV, autenticación (las implementa otro integrante después; la UI consume el port `SalesSource`) |

## 1. Objetivo

Entregar la aplicación web navegable con las vistas **Inicio**, **Ventas General**, **Sucursales** (comparativa + detalle) y **Productos**, alimentadas por datos de demostración controlados a través del port `SalesSource`, de modo que el adapter real (base de datos) se enchufe después sin tocar UI ni casos de uso.

## 2. Requisitos del spec cubiertos

- **RF-020** Filtros globales coherentes en las tres vistas.
- **RF-021** Ventas General: KPIs y evolución del periodo.
- **RF-022** Sucursales: comparar y profundizar por sucursal.
- **RF-023** Productos: ranking, búsqueda y análisis por producto/categoría.
- **RF-024** Métricas según fórmulas de spec §9.2.
- **RF-025** Interfaz muestra periodo, moneda y última actualización.
- **RF-027** Filtros principales restaurables desde la URL (nuqs).
- **RF-028** Tablas con ordenación y paginación.
- **RF-030 / RF-031 / RF-032** Registro tipado de módulos; módulos futuros deshabilitados no aparecen en navegación.
- **Spec §4.1** Datos de demostración controlados.
- **Spec §10** Estructura de navegación, lenguaje visual, responsive (escritorio ≥1024 px y móvil 360–767 px) y estados obligatorios (cargando, vacío, sin resultados, error recuperable).

### Postergados (dependen de backend/BD)

- RF-001 a RF-019 (auth e importación), RF-026 (campos opcionales reales), RF-029 (exportación), estados de "datos parciales" reales y RNF-034 (suite de pruebas: el repo aún no tiene runner de tests; ver Desviaciones).

## 3. Criterios de aceptación del incremento

1. Las 5 rutas (`/`, `/ventas`, `/sucursales`, `/sucursales/[id]`, `/productos`) renderizan con datos demo y muestran el periodo activo.
2. Los filtros `desde`, `hasta` y `sucursal` se reflejan en la URL y actualizan KPIs, gráficos y tablas de forma consistente.
3. Los KPIs respetan las fórmulas de spec §9.2 (ventas netas por operación única, variación `—` cuando el periodo anterior es cero).
4. Estado vacío, sin resultados, cargando (skeleton) y error con reintento presentes en las vistas.
5. A 360 px la navegación, filtros (panel + chips) y KPIs son utilizables; objetivos táctiles ≥ 44 px.
6. `/cargas` existe como página informativa (depende del backend) sin exponer funcionalidad rota.
7. `npm run typecheck`, `npm run lint` y `npm run build` en verde.

## 4. Desviaciones registradas

- **Tests automatizados:** el repositorio no tiene runner configurado (decisión de tooling pendiente). Verificación por `typecheck` + `lint` + `build` (regla 9 de AGENTS.md). Las fórmulas KPI quedan como funciones puras en `src/domain/sales` listas para testear cuando se incorpore el runner.
- **Autenticación:** no se implementa login (spec §15.1 exige auth para datos reales; este incremento solo usa datos sintéticos y no se despliega públicamente).
