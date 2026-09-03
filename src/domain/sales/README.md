Contrato canónico (`FactVentaLinea`, `FiltroVentas`) y capa semántica de ventas.

Sin dependencias de otras capas. La UI y los casos de uso solo conocen estos tipos —
nunca columnas crudas del Excel/CSV/ERP. Ver `etl/schema.sql` (vista `vw_ventas`) para el
origen de cada campo.
