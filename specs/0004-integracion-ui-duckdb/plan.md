# Plan: Integración UI + DuckDB

1. Consolidar el dominio alrededor de `FactVentaLinea`, `FiltroVentas` y un contrato
   mínimo de ticket que refleje `vw_tickets`.
2. Extender `SalesSource` con líneas, tickets, sucursales y cobertura de carga; componer
   únicamente el adapter DuckDB.
3. Consultar KPIs oficiales por documento y analítica de producto por línea.
4. Marcar como `en_cuarentena` toda operación descuadrada y todas sus líneas. Las vistas
   semánticas aplican la misma frontera y nunca corrigen una mitad duplicada.
5. Regenerar la base y validar reconciliación, tipos, lint, build y rutas principales.
