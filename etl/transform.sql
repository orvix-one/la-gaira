-- Transformación: stg_ventas_raw -> dimensiones -> hechos -> derivadas.
-- Se ejecuta una sola vez por corrida, después de cargar TODOS los archivos a staging
-- (así una fecha o vendedor no queda partido entre dos inserciones). Ver etl/README.md.

-- =========================================================================
-- 0. MACROS DE CASTEO — reglas explícitas y auditables, no implícitas en el lector.
-- =========================================================================

-- Números: quita el separador de miles (coma) y castea. TRY_CAST en vez de CAST porque
-- un archivo nuevo puede traer basura en alguna celda; checks.sql decide si eso es grave.
CREATE OR REPLACE MACRO parse_num(v) AS
  TRY_CAST(replace(trim(v), ',', '') AS DECIMAL(18,4));

-- Enteros: pasa por DOUBLE primero para tolerar "24343.0" (algunos exportadores de CSV
-- escriben enteros con decimal de punto flotante).
CREATE OR REPLACE MACRO parse_int(v) AS
  TRY_CAST(TRY_CAST(replace(trim(v), ',', '') AS DOUBLE) AS BIGINT);

-- Fechas: el origen trae o el serial de Excel (5 dígitos, época 1899-12-30) o texto.
-- %d/%m/%Y va primero por convención boliviana; checks.sql valida que el rango resultante
-- sea plausible, que es la única defensa real contra un %m/%d mal interpretado.
CREATE OR REPLACE MACRO parse_fecha(v) AS
  CASE
    WHEN v IS NULL OR trim(v) = '' THEN NULL
    WHEN regexp_matches(trim(v), '^\d{4,5}(\.0)?$')
      THEN DATE '1899-12-30' + CAST(split_part(trim(v), '.', 1) AS INTEGER) * INTERVAL 1 DAY
    ELSE COALESCE(
      TRY_CAST(trim(v) AS DATE),
      try_strptime(trim(v), '%d/%m/%Y')::DATE,
      try_strptime(trim(v), '%d-%m-%Y')::DATE
    )
  END;

-- =========================================================================
-- 1. DIM_FECHA — el rango observado en la carga, día por día. No se hardcodea: si el
--    cliente manda un mes distinto, la dimensión crece sola.
-- =========================================================================

INSERT INTO dim_fecha
SELECT
  d::DATE                                     AS fecha,
  year(d)                                     AS anio,
  month(d)                                    AS mes,
  day(d)                                      AS dia,
  dayofweek(d)                                AS dia_semana,
  dayname(d)                                  AS nombre_dia,
  monthname(d)                                AS nombre_mes,
  weekofyear(d)                               AS semana_iso,
  strftime(d, '%Y-%m')                        AS anio_mes,
  dayofweek(d) IN (0, 6)                      AS es_fin_de_semana
FROM range(
  (SELECT min(parse_fecha(fecha_turno)) FROM stg_ventas_raw),
  (SELECT max(parse_fecha(fecha_turno)) FROM stg_ventas_raw) + INTERVAL 1 DAY,
  INTERVAL 1 DAY
) AS t(d)
WHERE (SELECT min(parse_fecha(fecha_turno)) FROM stg_ventas_raw) IS NOT NULL;

-- =========================================================================
-- 2. DIMENSIONES DE PRODUCTO, SUCURSAL, VENDEDOR
-- =========================================================================

INSERT INTO dim_sucursal
SELECT
  trim(sucursal)                              AS sucursal,
  any_value(CAST(parse_int(bodega) AS SMALLINT)) AS bodega_codigo
FROM stg_ventas_raw
WHERE sucursal IS NOT NULL AND trim(sucursal) <> ''
GROUP BY trim(sucursal);

INSERT INTO dim_producto
SELECT
  trim(codigo)                                          AS producto_codigo,
  any_value(regexp_replace(trim(descripcion), '\s+', ' ', 'g')) AS descripcion,
  any_value(linea)                                      AS linea,
  any_value(CAST(parse_int(linea3) AS SMALLINT))        AS linea_codigo,
  any_value(sub_linea)                                  AS sub_linea,
  any_value(CAST(parse_int(sublin) AS SMALLINT))        AS sub_linea_codigo,
  any_value(CAST(parse_int(clase) AS SMALLINT))         AS clase_codigo,
  any_value(unidad)                                     AS unidad,
  any_value(tipo_producto)                              AS tipo_producto,
  any_value(trim(con) = '1')                            AS flag_con,
  false                                                  AS es_siempre_sin_cargo -- se corrige en el paso 5
FROM stg_ventas_raw
WHERE codigo IS NOT NULL AND trim(codigo) <> ''
GROUP BY trim(codigo);

INSERT INTO dim_vendedor
SELECT
  CAST(parse_int(cod_vend) AS SMALLINT)        AS vendedor_codigo,
  any_value(vendedor)                          AS vendedor
FROM stg_ventas_raw
WHERE cod_vend IS NOT NULL AND parse_int(cod_vend) IS NOT NULL
GROUP BY parse_int(cod_vend);

-- dim_tipo_venta ya viene sembrada por schema.sql con los 3 códigos conocidos.

-- =========================================================================
-- 3. FACT_VENTA_DOCUMENTO — grano: una operación. Los atributos de cabecera dependen
--    100% de 'Operación' [verificado], así que any_value() es seguro: no promedia ni
--    elige al azar entre valores distintos, solo toma el único valor que existe.
-- =========================================================================

INSERT INTO fact_venta_documento
SELECT
  CAST(parse_int(operacion) AS INTEGER)                        AS operacion_id,
  CAST(any_value(parse_int(factura_num)) AS INTEGER)           AS factura_num,
  any_value(trim(sucursal))                                    AS sucursal,
  any_value(parse_fecha(fecha_turno))                          AS fecha_turno,
  CAST(any_value(parse_int(ope)) AS SMALLINT)                  AS tipo_venta_codigo,
  CAST(any_value(parse_int(cod_vend)) AS SMALLINT)             AS vendedor_codigo,
  any_value(parse_num(total_factura))                          AS total_factura,
  sum(parse_num(total_neto))                                   AS importe_lineas,
  sum(parse_num(total_neto)) - any_value(parse_num(total_factura)) AS descuadre,
  sum(parse_num(cantidad))                                     AS unidades,
  count(*)                                                     AS lineas,
  CASE
    WHEN bool_or(upper(trim(descripcion)) LIKE 'PEDIDOS YA%')
      OR bool_or(regexp_matches(upper(coalesce(razon_social, '')), '(^|[^A-Z])(PDY|PDYA|PEDIDOS ?YA)'))
      THEN 'PEDIDOSYA'
    WHEN bool_or(regexp_matches(upper(coalesce(razon_social, '')), '(^|[^A-Z])(YANGO|YNG)'))
      THEN 'YANGO'
    WHEN bool_or(upper(trim(linea)) = 'PARA LLEVAR')
      THEN 'LLEVAR'
    ELSE 'SALON'
  END                                                           AS canal_venta,
  true                                                          AS canal_es_inferido,
  any_value(parse_int(ope)) = 11                                AS es_fiscal,
  any_value(parse_num(total_factura)) > 0
    AND abs(sum(parse_num(total_neto)) - 2 * any_value(parse_num(total_factura))) < 0.01
                                                                  AS es_duplicado_sospechoso,
  any_value(forma_pago)                                        AS forma_pago,
  any_value(familia_clientes)                                  AS familia_clientes,
  nullif(any_value(trim(nit)), '0')                             AS nit,
  any_value(razon_social)                                      AS razon_social,
  any_value(cliente)                                           AS cliente,
  any_value(upper(trim(anulada))) IN ('SI', 'SÍ', 'S', 'TRUE')  AS anulada
FROM stg_ventas_raw
WHERE operacion IS NOT NULL AND parse_int(operacion) IS NOT NULL
GROUP BY parse_int(operacion);

-- =========================================================================
-- 4. FACT_VENTA_LINEA — grano: una fila del archivo de origen.
-- =========================================================================

INSERT INTO fact_venta_linea
SELECT
  row_number() OVER (ORDER BY _archivo, _fila)   AS venta_linea_id,
  CAST(parse_int(operacion) AS INTEGER)          AS operacion_id,
  trim(codigo)                                   AS producto_codigo,
  parse_num(cantidad)                            AS cantidad,
  parse_num(precio_unitario)                     AS precio_unitario,
  parse_num(total_neto)                          AS importe,
  parse_num(iva)                                 AS iva,
  parse_num(it)                                  AS it,
  coalesce(parse_num(descuento), 0)              AS descuento,
  parse_num(total_neto) = 0                      AS es_sin_cargo,
  false                                           AS es_duplicado_sospechoso,
  _archivo,
  _fila
FROM stg_ventas_raw
WHERE operacion IS NOT NULL AND parse_int(operacion) IS NOT NULL
  AND codigo IS NOT NULL AND trim(codigo) <> '';

-- =========================================================================
-- 5. DERIVADAS DE SEGUNDA PASADA — necesitan que fact_venta_linea ya exista completo.
-- =========================================================================

-- Marca la mitad sobrante de las líneas repetidas SOLO dentro de los documentos que ya
-- calificaron como sospechosos (SUM(líneas) ~= 2 x total_factura). Las repeticiones
-- legítimas (mismo producto pedido dos veces, fuera de esos documentos) no se tocan.
UPDATE fact_venta_linea SET es_duplicado_sospechoso = true
WHERE venta_linea_id IN (
  SELECT venta_linea_id FROM (
    SELECT
      venta_linea_id,
      row_number() OVER (
        PARTITION BY operacion_id, producto_codigo, cantidad, precio_unitario, importe
        ORDER BY _archivo, _fila
      ) AS n
    FROM fact_venta_linea
    WHERE operacion_id IN (
      SELECT operacion_id FROM fact_venta_documento WHERE es_duplicado_sospechoso
    )
  ) numeradas
  WHERE n % 2 = 0
);

-- Un producto es "siempre sin cargo" si nunca se vendió a importe > 0 en toda la carga
-- (combos, empaques, salsas de delivery). Distinto de es_sin_cargo, que es por línea.
UPDATE dim_producto SET es_siempre_sin_cargo = true
WHERE producto_codigo IN (
  SELECT producto_codigo FROM fact_venta_linea
  GROUP BY producto_codigo
  HAVING max(importe) = 0
);
