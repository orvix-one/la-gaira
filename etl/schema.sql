-- Esquema de La Gaira — Dashboard.
-- Fuente de verdad del modelo de datos. Se ejecuta completo sobre una base nueva en
-- cada corrida de la ETL (full refresh). Ver etl/README.md para el flujo completo.
--
-- Nota de diseño: las columnas de dimensión/hecho que referencian otra tabla (p.ej.
-- fact_venta_documento.sucursal -> dim_sucursal.sucursal) NO llevan una restricción
-- FOREIGN KEY física. La integridad referencial la valida etl/checks.sql fila por fila
-- y reporta cualquier huérfano en etl_issue con severidad configurable; una restricción
-- física la reportaría como una excepción cruda a mitad de la carga, sin el contexto
-- (cuántas filas, cuáles) que sí da el reporte. Las relaciones se documentan igual con
-- un comentario -- FK: <tabla>.<columna> junto a cada columna.
--
-- Las PRIMARY KEY sí son restricciones físicas: garantizan que la SQL de esta ETL
-- construyó cada dimensión/hecho correctamente (un bug propio, no un dato del cliente),
-- así que tiene sentido que fallen fuerte si algo está mal.

-- =========================================================================
-- 1. STAGING — fidelidad 1:1 con el archivo de origen. Todo VARCHAR a propósito:
--    el casteo ocurre en transform.sql con reglas explícitas, no en el lector.
-- =========================================================================

CREATE TABLE stg_ventas_raw (
  _archivo          VARCHAR NOT NULL,  -- linaje: nombre del archivo de origen
  _fila             BIGINT  NOT NULL,  -- linaje: nº de fila dentro del archivo

  factura_num       VARCHAR,           -- 'Factura N°' — correlativo por sucursal
  fecha_turno       VARCHAR,           -- 'Fecha de turno' — día operativo, no timestamp
  hora              VARCHAR,           -- 'Hora' — siempre vacía en la muestra
  codigo            VARCHAR,           -- 'Código' — código de producto
  descripcion       VARCHAR,           -- 'Descripción'
  cantidad          VARCHAR,           -- 'Cantidad'
  unidad            VARCHAR,           -- 'Unidad'
  precio_unitario   VARCHAR,           -- 'Precio Unitario'
  descuento         VARCHAR,           -- 'Descuento' — siempre 0 en la muestra
  total_neto        VARCHAR,           -- 'Total Neto' — importe cobrado, impuesto incluido
  iva               VARCHAR,           -- 'IVA'
  it                VARCHAR,           -- 'IT'
  linea              VARCHAR,          -- 'Linea'
  sub_linea          VARCHAR,          -- 'Sub-Linea'
  tipo_producto      VARCHAR,          -- 'Tipo de Producto'
  peso_unitario      VARCHAR,          -- 'Peso Unitario' — siempre 0 en la muestra
  ope                VARCHAR,          -- 'Ope.' — código de tipo de venta
  tipo_venta         VARCHAR,          -- 'Tipo de Venta'
  familia_clientes   VARCHAR,          -- 'Familia de Clientes'
  sucursal           VARCHAR,          -- 'Sucursal'
  nit                VARCHAR,          -- 'NIT'
  codigo2            VARCHAR,          -- 'Código2' -- desambiguar: casi siempre 0
  sec                VARCHAR,          -- 'Sec.' -- desambiguar: siempre 0 en la muestra
  cliente            VARCHAR,          -- 'Cliente'
  razon_social       VARCHAR,          -- 'Razon Social' -- desambiguar: campo libre, usado como notas
  total_factura      VARCHAR,          -- 'Total Factura' — total de cabecera del documento
  anulada            VARCHAR,          -- 'Anulada'
  forma_pago         VARCHAR,          -- 'Forma de Pago'
  cod_vend           VARCHAR,          -- 'Cod.Vend.'
  vendedor           VARCHAR,          -- 'Vendedor'
  operacion          VARCHAR,          -- 'Operación' — ID global único de documento
  bodega             VARCHAR,          -- 'Bodega' -- desambiguar: casi siempre 0
  linea3             VARCHAR,          -- 'Linea3' — código numérico de 'linea'
  sublin             VARCHAR,          -- 'SubLin.' — código numérico de 'sub_linea'
  clase              VARCHAR,          -- 'Clase' -- desambiguar: 3er nivel de clasificación sin etiqueta
  con                VARCHAR,          -- 'Con.' -- desambiguar: 1 solo en bebidas embotelladas
  tipo               VARCHAR,          -- 'Tipo' -- desambiguar: casi siempre 0
  observaciones      VARCHAR,          -- 'Observaciones' — siempre vacía en la muestra
  tipo_cambio        VARCHAR,          -- 'Tipo de Cambio' — siempre 7 en la muestra
  usuario            VARCHAR           -- 'Usuario' — siempre vacía en la muestra
);

-- =========================================================================
-- 2. DIMENSIONES — claves naturales (full refresh: los surrogates no aportan
--    estabilidad entre corridas y las claves del origen ya son únicas y legibles).
-- =========================================================================

CREATE TABLE dim_sucursal (
  sucursal        VARCHAR PRIMARY KEY,
  bodega_codigo   SMALLINT  -- desambiguar: constante por sucursal, 0 salvo PRODUCCION SANTA CRUZ = 2
);

CREATE TABLE dim_producto (
  producto_codigo       VARCHAR PRIMARY KEY,
  descripcion           VARCHAR NOT NULL,   -- normalizada (trim + colapso de espacios); cruda en staging
  linea                 VARCHAR NOT NULL,   -- 17 valores: COMBOS, HAMBURGUESAS, JUGOS Y SODAS, ...
  linea_codigo          SMALLINT,           -- 'Linea3' del origen: código 1:1 de `linea`
  sub_linea             VARCHAR NOT NULL,   -- 10 valores: PRODUCTOS TERMINADOS, GASEOSAS, ...
  sub_linea_codigo      SMALLINT,           -- 'SubLin.' del origen: código 1:1 de `sub_linea`
  clase_codigo          SMALLINT,           -- desambiguar: 49 valores, 3er nivel de clasificación sin etiqueta del origen
  unidad                VARCHAR NOT NULL,   -- UNIDAD | LITRO | KILOGRAMO | NULO
  tipo_producto         VARCHAR NOT NULL,   -- PRODUCTOS DE VENTA | SERVICIOS DE VENTA
  flag_con              BOOLEAN,            -- desambiguar: 'Con.'=1 visto solo en bebidas embotelladas (¿envase retornable? ¿consignación?)
  es_siempre_sin_cargo  BOOLEAN NOT NULL    -- derivado: nunca se vendió a importe > 0 en ninguna carga (ver dim_producto en transform.sql)
);

CREATE TABLE dim_vendedor (
  vendedor_codigo SMALLINT PRIMARY KEY,  -- 0 = SIN ANALISIS (venta sin mesero asignado)
  vendedor        VARCHAR NOT NULL
);

CREATE TABLE dim_tipo_venta (
  tipo_venta_codigo SMALLINT PRIMARY KEY,  -- 'Ope.' del origen
  tipo_venta        VARCHAR NOT NULL,      -- etiqueta del origen
  es_fiscal         BOOLEAN NOT NULL       -- solo VENTA POS liquida IVA/IT [verificado sobre la muestra]
);

-- Semilla fija: los 3 códigos observados en la muestra. checks.sql reporta como error
-- cualquier código de tipo de venta que aparezca en un archivo y no esté aquí — no se
-- infiere solo, porque es_fiscal es una regla de negocio que alguien debe confirmar.
INSERT INTO dim_tipo_venta (tipo_venta_codigo, tipo_venta, es_fiscal) VALUES
  (11, 'VENTA POS',           true),
  (21, 'RECIBO POS',          false),
  (32, 'NOTA DE VENTA CREDITO', false);

CREATE TABLE dim_fecha (
  fecha             DATE PRIMARY KEY,
  anio              SMALLINT NOT NULL,
  mes               SMALLINT NOT NULL,
  dia               SMALLINT NOT NULL,
  dia_semana        SMALLINT NOT NULL,  -- 0=domingo ... 6=sábado (dayofweek de DuckDB)
  nombre_dia        VARCHAR NOT NULL,
  nombre_mes        VARCHAR NOT NULL,
  semana_iso        SMALLINT NOT NULL,
  anio_mes          VARCHAR NOT NULL,   -- 'YYYY-MM', llave de agrupación mensual
  es_fin_de_semana  BOOLEAN NOT NULL
);

-- =========================================================================
-- 3. HECHOS
-- =========================================================================

-- Grano: una operación (ticket/factura). 'Operación' del origen es un ID global único
-- de documento [verificado]; (Sucursal, Factura N°) es 1:1 con él.
CREATE TABLE fact_venta_documento (
  operacion_id              INTEGER PRIMARY KEY,
  factura_num               INTEGER,           -- correlativo por sucursal, NO global
  sucursal                  VARCHAR NOT NULL,   -- FK: dim_sucursal.sucursal
  fecha_turno               DATE    NOT NULL,   -- FK: dim_fecha.fecha — día operativo, no timestamp
  tipo_venta_codigo         SMALLINT NOT NULL,  -- FK: dim_tipo_venta.tipo_venta_codigo
  vendedor_codigo           SMALLINT NOT NULL,  -- FK: dim_vendedor.vendedor_codigo
  total_factura             DECIMAL(14,2) NOT NULL,  -- cabecera declarada por el origen
  importe_lineas            DECIMAL(14,2) NOT NULL,  -- SUM(importe) de TODAS las líneas del documento (control cruzado, sin ajustar)
  descuadre                 DECIMAL(14,2) NOT NULL,  -- importe_lineas - total_factura; distinto de 0 delata un problema de origen
  unidades                  DECIMAL(14,3) NOT NULL,
  lineas                    INTEGER NOT NULL,
  canal_venta               VARCHAR NOT NULL,   -- heurístico: SALON | PEDIDOSYA | YANGO | LLEVAR
  canal_es_inferido         BOOLEAN NOT NULL DEFAULT true,  -- siempre true en v1: no viene del origen, se infiere por texto
  es_fiscal                 BOOLEAN NOT NULL,   -- copiado de dim_tipo_venta al momento de la carga
  en_cuarentena              BOOLEAN NOT NULL DEFAULT false,  -- detalle no reconcilia con total_factura: operación completa no publicable
  forma_pago                VARCHAR,            -- 'CONTADO' salvo 1 fila en la muestra
  familia_clientes          VARCHAR,            -- 'SIN FAMILIA' salvo 1 fila en la muestra
  nit                       VARCHAR,            -- desambiguar: '0' en el 45% de los documentos, '77777777' genérico en otro 8%
  razon_social              VARCHAR,            -- desambiguar: campo libre, usado como notas de cobro/delivery (ver README)
  cliente                   VARCHAR,            -- desambiguar: 'NO APLICA' salvo 1 fila en la muestra
  anulada                   BOOLEAN NOT NULL    -- siempre false en la muestra; se conserva por si el ERP la usa
);

-- Grano: una línea del archivo de origen. No existe clave natural de línea (no hay
-- número de línea en el origen, y hay filas duplicadas exactas legítimas), por eso
-- venta_linea_id es sintético.
CREATE TABLE fact_venta_linea (
  venta_linea_id            BIGINT PRIMARY KEY,  -- sintética, asignada en la carga
  operacion_id              INTEGER NOT NULL,    -- FK: fact_venta_documento.operacion_id
  producto_codigo           VARCHAR NOT NULL,    -- FK: dim_producto.producto_codigo
  cantidad                  DECIMAL(12,3) NOT NULL,
  precio_unitario           DECIMAL(14,4) NOT NULL,  -- transaccional: 108 productos tuvieron 2-3 precios distintos en el mes
  importe                   DECIMAL(14,2) NOT NULL,  -- 'Total Neto': cantidad x precio_unitario, impuesto incluido
  iva                       DECIMAL(14,2) NOT NULL,
  it                        DECIMAL(14,2) NOT NULL,
  descuento                 DECIMAL(14,2) NOT NULL,  -- siempre 0 en la muestra
  es_sin_cargo               BOOLEAN NOT NULL,   -- importe = 0: componente de combo, empaque, salsa de delivery o cortesía
  en_cuarentena               BOOLEAN NOT NULL DEFAULT false,  -- hereda la cuarentena de la operación; nunca se publica parcialmente
  _archivo                   VARCHAR NOT NULL,   -- linaje hasta la fila original
  _fila                      BIGINT  NOT NULL
);

-- =========================================================================
-- 4. AUDITORÍA — una fila por corrida de la ETL, y el detalle de sus hallazgos.
-- =========================================================================

CREATE TABLE etl_run (
  run_id          VARCHAR PRIMARY KEY,
  ejecutado_en    TIMESTAMP NOT NULL,
  archivos        VARCHAR[] NOT NULL,
  filas_leidas    BIGINT NOT NULL,
  filas_cargadas  BIGINT NOT NULL,
  duracion_ms     BIGINT NOT NULL
);

CREATE TABLE etl_issue (
  run_id            VARCHAR NOT NULL,  -- FK: etl_run.run_id
  severidad         VARCHAR NOT NULL,  -- error | warning | info
  regla             VARCHAR NOT NULL,
  detalle           VARCHAR NOT NULL,
  filas_afectadas   BIGINT NOT NULL
);

-- =========================================================================
-- 5. CAPA SEMÁNTICA — lo único que la aplicación consulta (src/infrastructure/data).
-- =========================================================================

-- Una fila por línea de venta publicada: excluye operaciones completas en cuarentena
-- y anuladas. Para métricas de documento (ticket promedio, conteo de tickets) usar
-- vw_tickets en su lugar — sumar total_factura sobre vw_ventas sobre-cuenta por línea.
CREATE VIEW vw_ventas AS
SELECT
  l.venta_linea_id,
  l.operacion_id,
  l.cantidad,
  l.precio_unitario,
  l.importe,
  l.iva,
  l.it,
  l.es_sin_cargo,
  d.factura_num,
  d.sucursal,
  d.fecha_turno,
  d.canal_venta,
  d.canal_es_inferido,
  d.es_fiscal,
  d.forma_pago,
  p.producto_codigo,
  p.descripcion,
  p.linea,
  p.sub_linea,
  p.tipo_producto,
  p.es_siempre_sin_cargo,
  f.anio,
  f.mes,
  f.anio_mes,
  f.dia_semana,
  f.nombre_dia,
  f.es_fin_de_semana,
  v.vendedor_codigo,
  v.vendedor,
  t.tipo_venta
FROM fact_venta_linea l
JOIN fact_venta_documento d ON d.operacion_id = l.operacion_id
JOIN dim_producto p ON p.producto_codigo = l.producto_codigo
JOIN dim_fecha f ON f.fecha = d.fecha_turno
JOIN dim_vendedor v ON v.vendedor_codigo = d.vendedor_codigo
JOIN dim_tipo_venta t ON t.tipo_venta_codigo = d.tipo_venta_codigo
WHERE NOT d.en_cuarentena AND NOT l.en_cuarentena AND NOT d.anulada;

-- Una fila por documento (ticket/factura) publicado: aplica exactamente la misma
-- frontera de cuarentena y anulaciones que vw_ventas.
CREATE VIEW vw_tickets AS
SELECT d.*, f.anio, f.mes, f.anio_mes, f.dia_semana, f.nombre_dia, f.es_fin_de_semana
FROM fact_venta_documento d
JOIN dim_fecha f ON f.fecha = d.fecha_turno
WHERE NOT d.en_cuarentena AND NOT d.anulada;

-- =========================================================================
-- 6. COMENTARIOS 'desambiguar' — queryables vía duckdb_columns()/information_schema
--    para quien inspeccione la base sin abrir este archivo. El texto completo de cada
--    columna vive arriba, junto a su definición; esto es un espejo consultable.
-- =========================================================================

COMMENT ON COLUMN dim_sucursal.bodega_codigo IS
  'desambiguar: constante por sucursal, 0 salvo PRODUCCION SANTA CRUZ = 2';
COMMENT ON COLUMN dim_producto.clase_codigo IS
  'desambiguar: 49 valores, 3er nivel de clasificación de producto sin etiqueta en el origen';
COMMENT ON COLUMN dim_producto.flag_con IS
  'desambiguar: Con.=1 visto solo en bebidas embotelladas — ¿envase retornable? ¿consignación?';
COMMENT ON COLUMN fact_venta_documento.nit IS
  'desambiguar: 0 en ~45% de los documentos, 77777777 genérico en otro ~8% — no usar para analítica de cliente sin validar';
COMMENT ON COLUMN fact_venta_documento.razon_social IS
  'desambiguar: campo libre, usado como notas de cobro/canal de delivery (PDY ####, YANGO ####) más que como razón social real';
COMMENT ON COLUMN fact_venta_documento.cliente IS
  'desambiguar: NO APLICA en casi todos los documentos de la muestra';
COMMENT ON COLUMN fact_venta_documento.canal_venta IS
  'heurístico, no es un dato del origen — ver canal_es_inferido y etl/README.md';
