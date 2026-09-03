# Arquitectura

## Fases del proyecto

1. **Fase 0 — Toolchain**. Node 24, Next 16.3, React 19.2, Tailwind v4.
2. **Boilerplate**. TypeScript estricto, ESLint, estructura de carpetas DDD-lite, documentación.
3. **Esquema + ETL** — hecha. Excel/CSV → DuckDB (`data/processed/gaira.duckdb`), con el contrato canónico (`FactVentaLinea`) definido en `src/domain/sales`. Ver `etl/README.md` y `specs/0001-esquema-y-etl/`.
4. **UI de las páginas de analítica**. Ventas General, sucursales y productos sobre el contrato canónico; Recharts 3.10.1 encapsulado en `src/ui/charts`. Incluye dos placeholders para vistas futuras configurables.
5. **Backend robusto + BD** (condicional a aprobación del cliente).

## Arquitectura: DDD-lite por capas + ports & adapters

```
src/app            (presentación: rutas Next.js)
      │
      ▼
src/application    (casos de uso: orquestan queries)
      │
      ▼
src/domain         (contrato canónico, sin dependencias salientes)
      ▲
      │
src/infrastructure (port SalesSource + adapters: DuckDB, ERP futuro)
```

`domain` no depende de ninguna otra capa; todas las demás dependen de `domain`, directa o indirectamente. `infrastructure` implementa el port que `domain`/`application` definen, no al revés (inversión de dependencias).

## El seam de datos

El port `SalesSource` (`src/infrastructure/data`) existe para que la fuente de datos sea intercambiable sin tocar la UI. Hoy los datos vienen de `data/processed/gaira.duckdb`, una base DuckDB reconstruida por `npm run etl` (`etl/`) a partir de los archivos de `data/raw/` (el Excel de muestra, `SampleDataLaGaira.xlsx`, o los CSV que el cliente vaya subiendo); el día que la fuente sea el ERP de la empresa, se escribe un adapter nuevo que implemente el mismo port y la UI no cambia. Lo único que debe sobrevivir a ese cambio es el contrato canónico en `src/domain/sales`.

La ETL es hoy el único método de ingesta y podría seguir siéndolo indefinidamente (una implementación llave en mano donde el cliente sube archivos periódicamente); por eso `npm run etl` es un full refresh idempotente — cada corrida reconstruye la base completa desde cero, sin estado ni merge entre corridas. El esquema de datos (`etl/schema.sql`) es la pieza de mayor vida útil de esta fase: soporta hoy las páginas de analítica planeadas y las que se agreguen después, aunque los adapters y scripts que lo alimentan sean desechables.

## Qué es desechable vs. permanente

- **Desechable**: los adapters de esta fase (DuckDB) y los scripts de `etl/`. Se reemplazan sin ceremonia cuando cambia la fuente.
- **Permanente**: el esquema de datos (`etl/schema.sql`), el contrato canónico (`src/domain/sales`) y la capa de presentación (`src/app`, `src/ui`).
