# ETL — Excel/CSV → DuckDB

Reconstruye `data/processed/gaira.duckdb` desde cero a partir de los archivos de ventas
que el cliente provea. Es un **full refresh idempotente**: cada corrida procesa todos los
archivos de entrada y reescribe la base entera; no hay merge ni estado entre corridas.

## Uso

```bash
npm run etl                        # procesa todo data/raw/*.csv y data/raw/*.xlsx
npm run etl -- ruta/a/archivo.csv  # procesa uno o más archivos puntuales
```

Formatos aceptados: `.csv` y `.xlsx` (una sola hoja, con encabezados en la primera fila).
El `.xlsx` se lee vía la extensión `excel` de DuckDB, que se descarga la primera vez que
se usa — si el entorno no tiene salida a internet, exportá el archivo a CSV.

Si algo falla con severidad `error` (ver más abajo), la corrida no toca
`data/processed/gaira.duckdb`: se aborta y el archivo anterior sigue sirviendo como estaba.
Si todo sale bien (con o sin warnings), la base se reemplaza atómicamente.

## Qué hace, en orden

1. **Descubre** los archivos de entrada (`data/raw/*.{csv,xlsx}` o los que se pasen por
   argumento).
2. **Crea la base desde cero** en un archivo temporal y ejecuta `schema.sql` (staging,
   dimensiones, hechos, auditoría, vistas — ver los comentarios ahí para el detalle de
   cada tabla y columna).
3. **Por cada archivo**, lee sus encabezados reales y los mapea contra las 40 columnas de
   `stg_ventas_raw` usando el diccionario `ALIASES` de `run.mts` — normaliza cada
   encabezado (minúsculas, sin tildes, sin puntuación) y lo busca entre los alias
   conocidos de cada columna. Una columna esperada que no aparece en el archivo se carga
   como `NULL` y queda registrada como *warning*; una columna del archivo que no coincide
   con ninguna esperada se ignora y también queda como *warning*. **`ALIASES` es el punto
   de extensión** para el día que la fuente cambie de encabezados (p.ej. una integración
   con el ERP).
4. Ejecuta `transform.sql`: castea los VARCHAR de staging con reglas explícitas (fecha:
   serial de Excel o texto `%d/%m/%Y`; número: sin separador de miles), puebla las
   dimensiones y los dos hechos, y calcula las derivadas de negocio (`es_fiscal`,
   `es_sin_cargo`, `canal_venta`, `en_cuarentena`).
5. Ejecuta `checks.sql`: valida la carga y escribe cada hallazgo en `etl_issue` con una
   severidad. Cualquier `error` aborta la corrida.
6. Escribe `etl_run`, imprime un resumen en consola y vuelca
   `data/processed/etl-report.json` con el detalle completo (útil para CI o para pegarlo
   en un reporte al cliente).

## Columnas del origen que NO llegan al modelo canónico

Se quedan solo en `stg_ventas_raw` (fidelidad total, siempre re-derivable si hicieran
falta) porque están vacías, son constantes en la muestra, o son redundantes con una
columna que sí subió:

| Columna del origen | Por qué se queda en staging |
|---|---|
| `Hora`, `Observaciones`, `Usuario` | 100% nulas en la muestra |
| `Peso Unitario`, `Sec.`, `Tipo de Cambio` | Constantes (0, 0, 7) en la muestra |
| `Ope.` | Sube como `fact_venta_documento.tipo_venta_codigo` |
| `Bodega` | Sube como `dim_sucursal.bodega_codigo` |
| `Tipo` | Redundante con `Tipo de Producto` (sube como `dim_producto.tipo_producto`) |
| `Linea3`, `SubLin.` | Suben como `dim_producto.linea_codigo` / `sub_linea_codigo` |
| `Código2` | Siempre 0 salvo un caso interno en la muestra |

Si un archivo nuevo trae valores no constantes en alguna de estas, no se pierden — siguen
en `stg_ventas_raw` — pero no aparecerán en `vw_ventas`/`vw_tickets` hasta que alguien
decida promoverlas al modelo canónico.

## Columnas marcadas `desambiguar`

Suben al modelo canónico porque son potencialmente útiles, pero su significado no está
confirmado con el cliente. Cada una lleva un comentario `desambiguar: ...` en
`etl/schema.sql` (columna) y también como `COMMENT ON COLUMN` consultable en la propia
base. No usar estas columnas en analítica publicada sin validar primero:

- `dim_sucursal.bodega_codigo`, `dim_producto.clase_codigo`, `dim_producto.flag_con`
- `fact_venta_documento.nit`, `.razon_social`, `.cliente`

## `canal_venta` es una heurística, no un dato

Se infiere por texto (`PEDIDOS YA SALSAS` a precio 0, patrones `PDY ####` / `YANGO ####`
en `Razón Social`, línea `PARA LLEVAR`) porque el origen no trae un campo de canal.
`canal_es_inferido = true` en toda la v1. Antes de publicar cualquier analítica de canal,
confirmar el patrón con el cliente — si el ERP termina exponiendo el dato real, esta
heurística se retira sin tocar el resto del esquema.

## Operaciones en cuarentena

La operación es la unidad indivisible de publicación. Si `SUM(líneas)` no reconcilia con
`Total Factura` dentro de una tolerancia de 0,02, `transform.sql` marca el documento y
todas sus líneas como `en_cuarentena = true`. `vw_ventas` y `vw_tickets` excluyen la
operación completa, igual que las anuladas; no se deduplica ni corrige silenciosamente una
mitad aunque el patrón parezca un bloque duplicado. El dato íntegro permanece en
`fact_venta_linea`/`fact_venta_documento` para auditoría, y `etl_issue` reporta por separado
las operaciones y líneas excluidas.

## Reintentar / limpiar

No hay estado que limpiar entre corridas: `npm run etl` siempre reconstruye la base
completa. Si una corrida se interrumpe a mitad de camino, `data/processed/gaira.duckdb.tmp`
puede quedar huérfano — se borra solo en la siguiente corrida, o se puede borrar a mano.
