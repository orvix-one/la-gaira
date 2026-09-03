# Tasks: Esquema de BD + ETL

- [ ] `etl/schema.sql` — staging, dimensiones, hechos, auditoría, vistas semánticas, `COMMENT ON COLUMN` en las columnas `desambiguar`
- [ ] `etl/run.mts` — descubrimiento de archivos, mapeo de encabezados (`ALIASES`), carga a staging, orquestación, `.tmp` + rename atómico, `etl-report.json`
- [ ] `etl/transform.sql` — casteo de fechas/números, población de dimensiones y hechos, derivadas (`es_fiscal`, `es_sin_cargo`, `canal_venta`, `es_duplicado_sospechoso`)
- [ ] `etl/checks.sql` — validaciones con severidad `error|warning|info`
- [ ] `etl/README.md` — qué hace, cómo correrlo, qué columnas se descartan y por qué
- [ ] `"etl": "node etl/run.mts"` en `package.json`
- [ ] `src/domain/sales/fact-venta-linea.ts` + `src/domain/sales/filtros.ts`
- [ ] `src/infrastructure/data/sales-source.ts` (port)
- [ ] `src/infrastructure/data/adapters/duckdb-sales-source.ts` (adapter)
- [ ] Actualizar `ARCHITECTURE.md` y `AGENTS.md` (Fase 3 completa, artefacto `.duckdb`, comando `npm run etl`)
- [ ] `npm run etl` corre limpio sobre `data/raw/SampleDataLaGaira.xlsx`, sin issues `error`
- [ ] Verificar conteos/totales de la sección "Verificación" del plan contra la BD generada
- [ ] Probar con un CSV exportado de la misma hoja (flexibilidad del lector)
- [ ] `npm run typecheck` en verde
- [ ] `npm run lint` en verde
