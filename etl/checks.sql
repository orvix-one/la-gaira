-- Validaciones post-carga. Cada regla inserta en etl_issue con una severidad:
--   error   -> run.mts aborta la corrida y descarta la base generada.
--   warning -> se registra y se imprime, pero la base se sirve igual.
--   info    -> solo informativo (conteos de referencia para comparar contra otra carga).
--
-- run.mts hace SET VARIABLE run_id = '<uuid>' antes de ejecutar este archivo.

-- 1. Aritmética de línea: importe debe ser cantidad x precio_unitario.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'error', 'importe_coherente',
       'Líneas donde importe != cantidad * precio_unitario (tolerancia 0.02)', count(*)
FROM fact_venta_linea
WHERE abs(importe - cantidad * precio_unitario) > 0.02
HAVING count(*) > 0.01 * (SELECT count(*) FROM fact_venta_linea);

-- 2. Fechas: ninguna fila de staging con fecha no parseable.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'error', 'fecha_parseable',
       'Filas de staging con fecha_turno no parseable', count(*)
FROM stg_ventas_raw
WHERE fecha_turno IS NOT NULL AND trim(fecha_turno) <> '' AND parse_fecha(fecha_turno) IS NULL
HAVING count(*) > 0;

-- 3. Rango de fechas plausible: delata un %d/%m interpretado como %m/%d, o un serial mal leído.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'error', 'rango_fechas_plausible',
       'fecha_turno fuera del rango 2020-01-01 .. hoy+1 día: rango observado '
         || CAST(min(fecha_turno) AS VARCHAR) || ' .. ' || CAST(max(fecha_turno) AS VARCHAR),
       count(*) FILTER (WHERE fecha_turno < DATE '2020-01-01' OR fecha_turno > current_date + 1)
FROM fact_venta_documento
HAVING count(*) FILTER (WHERE fecha_turno < DATE '2020-01-01' OR fecha_turno > current_date + 1) > 0;

-- 4. tipo_venta_codigo debe estar en la semilla conocida de dim_tipo_venta. Si aparece uno
--    nuevo, es_fiscal no se puede inferir con confianza: mejor frenar que adivinar.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'error', 'tipo_venta_conocido',
       'Documentos con tipo_venta_codigo fuera de dim_tipo_venta (11, 21, 32)', count(*)
FROM fact_venta_documento d
LEFT JOIN dim_tipo_venta t USING (tipo_venta_codigo)
WHERE t.tipo_venta_codigo IS NULL
HAVING count(*) > 0;

-- 5. (sucursal, factura_num) debe ser único por operación — es la clave de negocio real.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'error', 'factura_unica_por_sucursal',
       'Pares (sucursal, factura_num) con más de un operacion_id', count(*)
FROM (
  SELECT sucursal, factura_num FROM fact_venta_documento
  GROUP BY sucursal, factura_num HAVING count(*) > 1
)
HAVING count(*) > 0;

-- 6. Integridad referencial línea -> documento.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'error', 'fk_linea_documento',
       'Líneas cuyo operacion_id no existe en fact_venta_documento', count(*)
FROM fact_venta_linea l
LEFT JOIN fact_venta_documento d USING (operacion_id)
WHERE d.operacion_id IS NULL
HAVING count(*) > 0;

-- 7. Integridad referencial línea -> producto.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'error', 'fk_linea_producto',
       'Líneas cuyo producto_codigo no existe en dim_producto', count(*)
FROM fact_venta_linea l
LEFT JOIN dim_producto p USING (producto_codigo)
WHERE p.producto_codigo IS NULL
HAVING count(*) > 0;

-- 8. es_fiscal debería implicar IVA > 0 cuando el importe es positivo (regla de negocio
--    verificada sobre la muestra; un archivo nuevo que la rompa merece una advertencia,
--    no un aborto, porque podría ser una tasa distinta y no un error de carga.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'warning', 'iva_coherente_con_fiscal',
       'Líneas fiscales con importe > 0 pero IVA = 0 (o viceversa)', count(*)
FROM fact_venta_linea l
JOIN fact_venta_documento d USING (operacion_id)
WHERE d.es_fiscal AND l.importe > 0 AND l.iva = 0
HAVING count(*) > 0;

-- 9. Operaciones en cuarentena: se conservan completas, pero no se publican.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'warning', 'operacion_en_cuarentena',
       'Operaciones excluidas: importe_lineas != total_factura (tolerancia 0.02)', count(*)
FROM fact_venta_documento
WHERE en_cuarentena
HAVING count(*) > 0;

-- 10. Líneas sin cargo: puramente informativo, para comparar entre cargas.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'info', 'lineas_sin_cargo',
       'Líneas con importe = 0 (combos, empaques, cortesías)', count(*)
FROM fact_venta_linea
WHERE es_sin_cargo
HAVING count(*) > 0;

-- 11. Canal de venta inferido: informativo, recuerda que canal_venta es heurístico.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'info', 'canal_inferido',
       'Documentos con canal_venta inferido distinto de SALON (heurístico, no confirmado con el cliente)',
       count(*)
FROM fact_venta_documento
WHERE canal_venta <> 'SALON'
HAVING count(*) > 0;

-- 12. Filas conservadas en cuarentena para auditoría.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'info', 'lineas_en_cuarentena',
       'Líneas excluidas de vw_ventas por pertenecer a operaciones inconsistentes', count(*)
FROM fact_venta_linea
WHERE en_cuarentena
HAVING count(*) > 0;

-- 13. Las dos vistas semánticas deben compartir la misma frontera de publicación.
INSERT INTO etl_issue
SELECT getvariable('run_id'), 'error', 'operaciones_publicadas_reconciliadas',
       'Operaciones publicadas donde SUM(vw_ventas.importe) != vw_tickets.total_factura', count(*)
FROM (
  SELECT t.operacion_id
  FROM vw_tickets t
  JOIN vw_ventas v USING (operacion_id)
  GROUP BY t.operacion_id, t.total_factura
  HAVING abs(sum(v.importe) - t.total_factura) > 0.02
)
HAVING count(*) > 0;
