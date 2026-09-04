Port `SalesSource` y sus adapters. Hoy: `adapters/duckdb-sales-source.ts`, que lee
`data/processed/gaira.duckdb` (generado por `npm run etl`) en modo solo-lectura. El día
que la fuente sea el ERP, un adapter nuevo implementa el mismo port y la UI no cambia.

El port expone líneas (`vw_ventas`) para analítica de producto, tickets (`vw_tickets`)
para KPIs de comprobante, catálogo de sucursales y cobertura/frescura de la ETL.

Ningún otro layer importa un adapter directamente ni conoce que la fuente es DuckDB.
