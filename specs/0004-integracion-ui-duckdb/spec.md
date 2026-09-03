# 0004 — Integración UI + DuckDB

| Campo | Valor |
|---|---|
| Estado | Aprobado para implementación |
| Fecha | 2026-09-03 |
| Reemplaza | Adapter demo de `specs/0002-ui-vistas-demo/` |

## Objetivo

Conectar las vistas analíticas al DuckDB generado por la ETL, consolidando un único
contrato `SalesSource` y respetando la frontera de publicación del spec maestro: una
operación cuyo detalle no reconcilia con `Total Factura` queda completa en cuarentena.

## Criterios de aceptación

1. DuckDB es la fuente por defecto; no quedan contratos ni adapters demo duplicados.
2. Ventas netas, unidades, transacciones y ticket promedio se calculan desde `vw_tickets`.
3. Productos, categorías y unidades por producto se calculan desde `vw_ventas`.
4. `vw_tickets` y `vw_ventas` excluyen las mismas operaciones inconsistentes o anuladas.
5. La ETL conserva documentos y líneas en cuarentena para auditoría, sin corregir ni
   publicar parcialmente una operación.
6. `npm run etl`, `npm run typecheck`, `npm run lint` y `npm run build` pasan.

## Fuera de alcance

- Autenticación, cargas desde la UI y conexión directa al ERP.
- Cambiar el significado de columnas del origen todavía marcadas `desambiguar`.
