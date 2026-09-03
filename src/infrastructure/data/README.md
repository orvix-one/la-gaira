Port `SalesSource` y sus adapters. Hoy: `adapters/duckdb-sales-source.ts`, que lee
`data/processed/gaira.duckdb` (generado por `npm run etl`) en modo solo-lectura. El día
que la fuente sea el ERP, un adapter nuevo implementa el mismo port y la UI no cambia.

Ningún otro layer importa un adapter directamente ni conoce que la fuente es DuckDB.
