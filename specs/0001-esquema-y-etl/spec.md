# Spec: Esquema de BD + ETL

## Qué

Un pipeline ETL (`etl/`) que lee los archivos de ventas del cliente (CSV o XLSX, con el
layout de `data/raw/SampleDataLaGaira.xlsx`) y reconstruye una base DuckDB
(`data/processed/gaira.duckdb`) con un esquema en tres capas: staging fiel al origen,
dimensiones/hechos canónicos, y vistas de analítica. Incluye el contrato de dominio
(`src/domain/sales`) y el port + adapter (`src/infrastructure/data`) que la futura UI usará
para leer esos datos sin tocar DuckDB directamente.

## Por qué

Es la Fase 3 de `ARCHITECTURE.md`. El sistema tendrá varias páginas de analítica (no solo
las tres de la Fase 4), así que el esquema de datos es la pieza de mayor vida útil de todo
el proyecto — los adapters y scripts de ETL son desechables, el modelo de datos no. La ETL
es hoy el único método de ingesta: podría seguir siéndolo (implementación llave en mano
donde el cliente sube archivos periódicamente) o ser reemplazada mañana por una integración
con el ERP. Se busca mantenibilidad media: lógica de negocio en SQL legible, TypeScript
solo para orquestación.

## Alcance

- Incluye:
  - `etl/schema.sql`, `etl/transform.sql`, `etl/checks.sql`, `etl/run.mts`, `etl/README.md`.
  - `npm run etl` en `package.json`.
  - `src/domain/sales/*` (contrato canónico `FactVentaLinea`, filtros compartidos).
  - `src/infrastructure/data/sales-source.ts` (port) y
    `src/infrastructure/data/adapters/duckdb-sales-source.ts` (adapter DuckDB).
  - Actualización de `ARCHITECTURE.md` y `AGENTS.md` reflejando el esquema/artefacto reales.
- No incluye:
  - UI de ninguna página de analítica (siguen como stubs).
  - Integración con el ERP real.
  - Autenticación, multi-tenant, o despliegue del `.duckdb` a un servidor.
  - Resolución definitiva de las columnas marcadas `desambiguar` — quedan documentadas, no
    resueltas, hasta confirmar con el cliente.

## Criterios de aceptación

- [ ] `npm run etl` corre sobre `data/raw/SampleDataLaGaira.xlsx` y genera
      `data/processed/gaira.duckdb` sin issues de severidad `error` en el reporte.
- [ ] Los conteos y totales de la sección "Verificación" del plan
      (`specs/0001-esquema-y-etl/plan.md`) coinciden exactamente al consultar la BD generada.
- [ ] `npm run etl` es idempotente: correrlo dos veces seguidas produce el mismo resultado.
- [ ] El pipeline acepta también un CSV con las mismas columnas (aunque en otro orden o con
      alias de encabezado conocidos) y produce los mismos conteos/totales.
- [ ] `src/infrastructure/data/adapters/duckdb-sales-source.ts` es el único archivo del repo
      que importa `@duckdb/node-api` fuera de `etl/`.
- [ ] Toda operación cuyo detalle no reconcilia con `total_factura` queda completa en
      cuarentena: ninguna de sus líneas aparece en `vw_ventas` ni el documento en
      `vw_tickets`, pero ambos permanecen auditables en las tablas canónicas.
- [ ] `npm run typecheck` y `npm run lint` pasan sin errores.
