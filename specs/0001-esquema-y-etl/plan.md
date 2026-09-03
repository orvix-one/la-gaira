# Plan: Esquema de BD + ETL

## Diseño técnico

Ver el perfilado completo y el detalle línea por línea del esquema en
`/home/codespace/.claude/plans/ahora-si-trabajemos-en-cryptic-scott.md` (plan de
implementación aprobado). Resumen:

**Modelo de datos** (DuckDB, `data/processed/gaira.duckdb`), en tres capas:

1. **Staging** (`stg_ventas_raw`): las 40 columnas del origen, todas VARCHAR, con linaje
   (`_archivo`, `_fila`). Fidelidad total — siempre re-derivable.
2. **Canónico**: dimensiones con clave natural (`dim_sucursal`, `dim_producto`,
   `dim_vendedor`, `dim_tipo_venta`, `dim_fecha`) y dos hechos —
   `fact_venta_documento` (grano: operación/ticket) y `fact_venta_linea` (grano: línea,
   PK sintética `venta_linea_id`). Las columnas de significado no verificable llevan
   `COMMENT ... 'desambiguar: ...'`. Derivadas incluidas: `es_fiscal`, `es_sin_cargo`,
   `canal_venta` (heurístico, `canal_es_inferido = true`), `es_duplicado_sospechoso`.
3. **Semántica**: `vw_ventas` (línea + documento + dimensiones, excluye duplicados) y
   `vw_tickets` (documento, excluye duplicados) — lo único que la app consulta.

Auditoría: `etl_run` y `etl_issue` registran cada corrida y sus validaciones.

**Pipeline** (`etl/`), SQL-first — la lógica de negocio vive en `.sql`, TypeScript solo
orquesta:

- `schema.sql` — DDL completo, incluye los `COMMENT ON COLUMN`.
- `run.mts` — descubre archivos en `data/raw/`, crea la BD en un `.tmp`, mapea encabezados
  contra un diccionario de alias (`ALIASES`, el punto de extensión para el día del ERP),
  carga `stg_ventas_raw`, ejecuta `transform.sql` y `checks.sql`, escribe
  `data/processed/etl-report.json`, renombra el `.tmp` a destino final solo si no hubo
  errores.
- `transform.sql` — reglas de casteo explícitas (fecha: serial de Excel o texto
  `%d/%m/%Y`; número: sin separador de miles) y las derivadas de negocio.
- `checks.sql` — validaciones con severidad `error|warning|info`; aborta la corrida ante
  cualquier `error`.

Full refresh idempotente: cada corrida reconstruye la BD completa desde todos los archivos
de `data/raw/`. Sin merge, sin estado entre corridas.

**Contrato de dominio y acceso**:

- `src/domain/sales/fact-venta-linea.ts` — tipo `FactVentaLinea` + schema `zod`, espejando
  `vw_ventas`. Sin dependencias de otras capas.
- `src/domain/sales/filtros.ts` — `FiltroVentas` compartido por las futuras páginas.
- `src/infrastructure/data/sales-source.ts` — port `SalesSource`.
- `src/infrastructure/data/adapters/duckdb-sales-source.ts` — único adapter, único archivo
  que sabe que la fuente es DuckDB (`DuckDBInstance.fromCache(..., {access_mode:'READ_ONLY'})`,
  instancia cacheada a nivel de módulo).

## Decisiones

| Decisión | Alternativas consideradas | Justificación |
|---|---|---|
| DuckDB persistente vs. solo Parquet vs. Postgres | Parquet + DuckDB in-memory por request; Postgres con migraciones | DuckDB persistente da DDL versionado real sin agregar infra de servidor; `@duckdb/node-api` ya está instalado. Postgres es prematuro antes de la Fase 5 (backend robusto, condicional a aprobación del cliente). |
| Claves naturales (sin surrogates) | IDs autoincrementales en todas las tablas | Con full refresh los surrogates no aportan estabilidad entre corridas; las claves del origen (`Operación`, `Código`, `Sucursal`) ya son únicas y legibles en SQL. Única excepción: `venta_linea_id` sintético, porque la línea no tiene clave natural. |
| Staging fiel + comentarios `desambiguar` | Solo columnas 100% seguras; o todo en una tabla ancha con comentarios | Preserva la fidelidad total (nada se pierde ni hay que reprocesar el Excel si una columna dudosa resulta importante) sin ensuciar el modelo canónico con incertidumbre no resuelta. |
| Marcar duplicados, no borrarlos | Borrar la mitad sobrante; cargar todo sin marcar | El dato crudo queda íntegro y auditable; las vistas de analítica excluyen los duplicados por defecto, así que el efecto práctico es el mismo que borrar pero reversible. |
| Full refresh idempotente | Upsert por período; append con `carga_id` | Volumen mensual (~70k filas) hace la reconstrucción completa trivial en tiempo; evita mantener lógica de merge o esquema de lotes antes de que exista una necesidad real. |
| SQL-first (tres `.sql` + orquestador TS delgado) | Toda la lógica en TypeScript con un query builder | Mantenibilidad media: SQL legible y diffable es más fácil de auditar por alguien que no escribió el pipeline que TypeScript con transformaciones dispersas. |

## Riesgos

- `canal_venta` es una heurística sobre `Razón Social`/`Descripción`, no un dato del ERP.
  Mitigación: `canal_es_inferido = true` explícito en el esquema; no usarlo en analítica
  publicada sin confirmar el patrón con el cliente.
- Un CSV con fechas en `%m/%d` en vez de `%d/%m` podría cargar mal. Mitigación: `checks.sql`
  aborta si el rango de fechas resultante cae fuera de 2020–hoy+1.
- La extensión `excel` de DuckDB requiere red la primera vez. Mitigación: `run.mts` debe dar
  un mensaje de error explícito si la descarga falla, en vez de un fallo críptico.
- Datos de un solo mes: ninguna comparación interanual o estacional es válida todavía.
