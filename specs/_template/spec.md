# La Gaira Analytics — Especificación SDD

> Especificación de producto, analítica y sistema para implementación asistida por agentes de IA.

| Campo | Valor |
|---|---|
| Estado | Borrador ejecutable para revisión del equipo y validación con cliente |
| Versión | 0.2.0 |
| Fecha | 2026-09-02 |
| Propietario | Equipo La Gaira |
| Alcance | Fase 1 MVP/demo y Fase 2 producto profesional |
| Fuente inicial | Archivos CSV cargados manualmente por un usuario administrador |
| Idioma de la interfaz | Español |

## 1. Propósito

Construir una aplicación web de analítica comercial para La Gaira que transforme archivos CSV de ventas en indicadores, tablas y gráficos comprensibles. El desarrollo se divide en dos entregas:

1. **Fase 1 — MVP/demo:** demostrar valor con una carga manual de CSV y tres vistas esenciales: Ventas General, Sucursales y Productos.
2. **Fase 2 — Producto profesional:** convertir el MVP aprobado en una solución segura, robusta, observable, documentada y lista para operación continua.

La especificación es la fuente de verdad del proyecto. Los agentes de IA deben implementar únicamente requisitos aprobados y verificables contenidos aquí o en decisiones registradas posteriormente.

## 2. Resultado esperado

Al finalizar la Fase 1, un administrador podrá cargar un CSV, revisar su validez, importarlo y visualizar los resultados en los tres tableros sin intervención técnica.

Al finalizar la Fase 2, la organización contará con un producto operable en producción, con autenticación y autorización, trazabilidad completa de las cargas, recuperación ante fallos, controles de calidad, pruebas automatizadas, monitoreo y documentación.

## 3. Principios de producto y desarrollo

- **Una sola base evolutiva:** el MVP no será un prototipo descartable. Se construirá con límites y contratos que permitan endurecerlo en Fase 2.
- **Datos antes que decoración:** ningún KPI se mostrará si no tiene definición, fórmula, granularidad y reglas de nulos documentadas.
- **Importación idempotente:** volver a cargar el mismo archivo no debe duplicar ventas.
- **Trazabilidad:** cada registro importado debe vincularse con su carga y, cuando corresponda, con la fila original.
- **Divulgación progresiva:** mostrar primero el resumen ejecutivo y permitir profundizar en tablas y detalles.
- **Responsive real:** no se aceptará una versión móvil que sea solo el escritorio comprimido.
- **Seguridad por capas:** las reglas de acceso deben existir en servidor y base de datos, no solo en la interfaz.
- **Cambios verificables:** cada incremento debe tener criterios de aceptación y evidencia de prueba.
- **YAGNI:** las dos vistas futuras tendrán puntos de extensión definidos, pero no se construirán hasta conocer su objetivo y sus datos.

## 4. Alcance por fase

### 4.1 Fase 1 — MVP/demo

Incluye:

- Un usuario administrador para acceder a la aplicación.
- Carga manual de un archivo CSV desde navegador.
- Validación estructural y semántica básica antes de importar.
- Resumen de validación y vista previa de filas.
- Confirmación explícita antes de persistir la carga.
- Carga idempotente de snapshots mensuales; el mismo archivo no puede publicarse dos veces.
- Registro básico del historial y resultado de las cargas.
- Filtros globales por periodo y sucursal; filtros contextuales por producto/categoría cuando existan.
- Vistas Ventas General, Sucursales y Productos.
- Estados de carga, vacío, error y datos parciales.
- Diseño responsive para escritorio y móvil.
- Exportación CSV de la tabla visible ya filtrada, si puede completarse sin comprometer la fecha de demo.
- Datos de demostración controlados para presentar el producto cuando no se cargue un archivo real.

No incluye:

- Integración con API del ERP.
- Edición manual de ventas.
- Aplicación móvil nativa.
- Constructor self-service de dashboards.
- Permisos multirol avanzados.
- Alertas comerciales automáticas.
- Predicción o inteligencia artificial sobre ventas.
- Multiempresa, salvo que se apruebe expresamente.

### 4.2 Fase 2 — Producto profesional

Incluye todo lo aprobado en el MVP, más:

- Autenticación administrada y autorización por roles.
- Políticas de seguridad a nivel de base de datos.
- Almacenamiento seguro del archivo original y evidencia de integridad.
- Auditoría de acceso, cargas, errores y acciones administrativas.
- Validación exhaustiva, cuarentena de filas inválidas y reporte descargable de errores.
- Procesamiento confiable de archivos grandes, con progreso y recuperación.
- Reintentos seguros e idempotencia transaccional.
- Estrategia de respaldo, restauración y retención.
- Suite completa de pruebas y controles de calidad.
- Observabilidad, alertas y procedimientos operativos.
- Ambientes separados de desarrollo, preview/staging y producción.
- Pipeline de integración y despliegue continuo.
- Documentación técnica, analítica, operativa y de usuario.
- Accesibilidad y optimización de rendimiento.
- Incorporación de hasta dos vistas adicionales solo después de aprobar sus mini-especificaciones.

## 5. Usuarios y autorización

### 5.1 Rol Admin

El rol `admin` puede:

- Iniciar y cerrar sesión.
- Ver todas las vistas analíticas.
- Cargar, validar, confirmar o cancelar importaciones.
- Consultar el historial de cargas y descargar reportes de errores.
- Aplicar filtros y exportar resultados permitidos.
- En Fase 2, gestionar usuarios si esta capacidad se aprueba como parte del alcance operativo.

### 5.2 Roles futuros

La arquitectura reservará el rol `viewer`, con acceso de solo lectura y sin capacidad de carga. No es obligatorio exponerlo en el MVP. La incorporación de otros roles requiere una decisión de producto y una matriz de permisos actualizada.

### 5.3 Reglas de autorización

- Toda ruta administrativa requiere sesión válida.
- Toda mutación requiere verificación de rol en servidor.
- La base de datos debe impedir operaciones no autorizadas aunque se omita la interfaz.
- Los enlaces a archivos originales no deben ser públicos; usar acceso temporal autorizado.
- Ningún secreto debe enviarse al navegador ni almacenarse en el repositorio.

## 6. Flujos principales

### 6.1 Flujo de carga

1. El admin abre **Cargas**.
2. Selecciona o arrastra un archivo `.csv`.
3. El sistema valida tipo, tamaño, codificación, encabezados y estructura.
4. El sistema detecta el separador entre coma y punto y coma; cualquier otra variante requiere selección explícita o se rechaza.
5. El sistema normaliza encabezados según el mapa de columnas aprobado.
6. Se procesan las filas en un área de staging sin afectar los tableros publicados.
7. La interfaz muestra: nombre, tamaño, operaciones y filas leídas, válidas, en cuarentena, advertencias, cobertura temporal y una muestra de al menos 20 filas si existen.
8. Si hay errores bloqueantes, no se habilita la importación.
9. El admin confirma la importación.
10. El sistema importa las filas válidas en una transacción lógica, registra el resultado y actualiza las consultas analíticas.
11. La interfaz confirma el periodo afectado y ofrece abrir Ventas General.

### 6.2 Repetición y recuperación

- Una carga repetida del mismo archivo, identificada por `file_sha256`, se bloquea o se trata como reintento; nunca duplica registros.
- Un archivo diferente que cubra un periodo ya publicado se trata como una nueva versión del snapshot: se compara, se valida y reemplaza ese periodo de forma atómica solo después de confirmación.
- El modo incremental queda deshabilitado mientras la fuente no entregue un identificador único e inmutable por línea.
- Una carga fallida no publica datos parciales.
- Reintentar una carga fallida reutiliza el mismo identificador lógico o crea un intento relacionado, sin duplicar datos.
- En Fase 2, un admin autorizado podrá revertir una carga si ninguna carga posterior depende de ella; la reversión será auditada.

### 6.3 Exploración analítica

1. El usuario abre una vista.
2. La aplicación selecciona por defecto el último periodo disponible y muestra claramente ese rango.
3. El usuario cambia filtros globales.
4. KPIs, gráficos y tabla se actualizan de forma consistente.
5. El usuario selecciona un elemento de un gráfico para cruzar o profundizar el filtro cuando la interacción esté habilitada.
6. El usuario puede limpiar filtros y volver al estado inicial.
7. La URL conserva los filtros principales para poder compartir o restaurar la vista, sin incluir datos sensibles.

## 7. Contrato del CSV

### 7.1 Estado del contrato

Se analizó `Propuesta de API Claudio.xlsx` como muestra de la salida que entregaría la API/exportación. Contiene una tabla `Ventas` con 69.627 filas de detalle y 40 columnas para el periodo 2026-07-01 a 2026-07-31. El archivo de carga del MVP seguirá siendo CSV; el Excel solo establece el esquema de referencia inicial.

El contrato se considera **provisional** porque existe una sola muestra mensual. Debe confirmarse contra al menos dos exportaciones adicionales y contra un CSV generado por el proceso real. Cambios de encabezado, tipo o significado crean una nueva versión del perfil de importación; nunca se aceptan silenciosamente.

### 7.2 Perfil de calidad de la muestra

| Evidencia | Resultado | Implicación |
|---|---:|---|
| Filas de detalle | 69.627 | El MVP debe probarse al menos con este volumen |
| Operaciones distintas | 15.975 | `Operación` es el mejor identificador observado de factura/transacción |
| Sucursales distintas | 9 | Una es `PRODUCCION SANTA CRUZ` con una sola fila; requiere clasificación |
| Productos distintos | 477 códigos / 477 nombres | Relación código-nombre 1:1 en la muestra |
| Rango de fechas | 2026-07-01 a 2026-07-31 | La muestra parece un snapshot mensual |
| Filas idénticas adicionales | 3.089 (4,4365 %) | No deben eliminarse automáticamente; varias representan unidades legítimas repetidas |
| Operaciones cuyo detalle no reconcilia con `Total Factura` | 12 de 15.975 (0,0751 %) | Tratar la operación completa como inconsistente; no duplicar ni corregir silenciosamente |
| Fórmula `Cantidad × Precio Unitario - Descuento = Total Neto` | 69.627 de 69.627 | Reconciliación de línea confiable en esta muestra |
| Filas con `Total Neto = 0` | 17.839 (25,62 %) | Pueden ser componentes/cortesías; conservar y distinguir ventas de unidades |
| Filas anuladas | 0 | La lógica de anulaciones no está validada por la muestra |
| Descuento distinto de cero | 0 | El KPI de descuentos no está validado por la muestra |
| `Razon Social` vacía | 13.420 (19,2741 %) | No puede ser clave ni dimensión obligatoria |
| Columnas 100 % vacías | `Hora`, `Observaciones`, `Usuario` | Excluir del modelo analítico del MVP; preservar solo en raw si llegan |
| Columnas constantes en la muestra | `Descuento=0`, `Peso Unitario=0`, `Sec.=0`, `Anulada=No`, `Tipo de Cambio=7` | No inferir reglas universales a partir de un mes |

Hallazgo de calidad de severidad alta: el extracto no incluye un identificador único de línea. `Operación` identifica de forma consistente una factura, pero una factura puede contener varias filas exactamente iguales. Por tanto, un hash de contenido no es una clave de línea segura y eliminaría ventas legítimas. También se observaron 12 operaciones cuyo detalle suma, en los ejemplos revisados, el doble de `Total Factura`, patrón compatible con bloques duplicados. Estas operaciones deben quedar en cuarentena hasta definir la regla con el proveedor de datos.

### 7.3 Requisitos de archivo

### 7.2 Requisitos de archivo

| Propiedad | MVP | Producción |
|---|---|---|
| Formato | CSV | CSV |
| Extensión | `.csv` | `.csv` |
| Codificación | UTF-8; intentar UTF-8 BOM | UTF-8; otras codificaciones solo con conversión controlada |
| Separador | `,` o `;`, autodetectado | Configurable por perfil de importación |
| Encabezado | Obligatorio, una fila | Obligatorio, versionado |
| Tamaño máximo | 25 MB por defecto | Configurable; procesamiento asíncrono sobre el umbral |
| Filas máximas | 250.000 por defecto | Determinado por pruebas de carga y SLA |
| Decimales | Punto o coma según perfil | Perfil explícito y versionado |
| Fechas | Perfil explícito | Perfil explícito, sin inferencias ambiguas |

El archivo de referencia pesa aproximadamente 12,5 MB y supera el límite inicial propuesto de 25 MB solo si el CSV resultante creciera más de dos veces. Antes de cerrar el límite se medirá el CSV real. El importador debe rechazar con un mensaje claro los archivos que excedan el límite vigente.

### 7.4 Mapa de columnas de la salida de referencia

| Encabezado de origen | Campo canónico | Uso MVP | Regla/observación |
|---|---|---|---|
| `Factura N°` | `invoice_number` | Núcleo | Texto; no es único globalmente |
| `Fecha de turno` | `sale_date` | Núcleo | Fecha sin hora; la muestra cubre 31 días |
| `Hora` | `source_time` | Raw | 100 % vacío; no habilitar analítica horaria |
| `Código` | `product_code` | Núcleo | Texto para preservar formato |
| `Descripción` | `product_name` | Núcleo | Nombre del producto |
| `Cantidad` | `quantity` | Núcleo | Decimal; rango observado 1 a 80 |
| `Unidad` | `unit_name` | Núcleo | Valores observados: UNIDAD, LITRO, NULO, KILOGRAMO |
| `Precio Unitario` | `unit_price` | Núcleo | Decimal monetario |
| `Descuento` | `discount_amount` | Condicional | Todo cero en la muestra; conservar sin mostrar KPI hasta validarlo |
| `Total Neto` | `line_net_amount` | Núcleo | Total por línea; reconcilia con cantidad/precio/descuento |
| `IVA` | `vat_amount` | Condicional | Significado contable y base deben confirmarse |
| `IT` | `transaction_tax_amount` | Condicional | Significado contable y base deben confirmarse |
| `Linea` | `category_name` | Núcleo | Categoría comercial principal |
| `Sub-Linea` | `subcategory_name` | Núcleo | Subcategoría; corregir alias solo mediante catálogo |
| `Tipo de Producto` | `product_type` | Núcleo | Producto o servicio de venta |
| `Peso Unitario` | `unit_weight` | Raw | Todo cero en la muestra |
| `Ope.` | `source_operation_type_code` | Raw | Código de significado no confirmado; no confundir con `Operación` |
| `Tipo de Venta` | `sale_type` | Núcleo | RECIBO POS, VENTA POS o NOTA DE VENTA CREDITO observados |
| `Familia de Clientes` | `customer_family` | Futuro | No requerida por los tres tableros núcleo |
| `Sucursal` | `branch_name` | Núcleo | No existe código de sucursal; usar catálogo/alias controlado |
| `NIT` | `customer_tax_id` | Sensible | Excluir del modelo analítico MVP salvo necesidad aprobada |
| `Código2` | `source_customer_code_2` | Raw/sensible | Significado no confirmado |
| `Sec.` | `source_sequence` | Raw | Todo cero; no sirve como identificador de línea |
| `Cliente` | `customer_label` | Sensible/futuro | Casi constante; no requerida por vistas núcleo |
| `Razon Social` | `customer_legal_name` | Sensible/futuro | 19,2741 % vacío; excluir del MVP por minimización |
| `Total Factura` | `invoice_total_amount` | Núcleo | Repetido en cada línea; agregar una sola vez por `Operación` |
| `Anulada` | `is_voided` | Núcleo | Normalizar Sí/No; solo No aparece en la muestra |
| `Forma de Pago` | `payment_term` | Futuro | CONTADO y un caso 7 DIAS observados |
| `Cod.Vend.` | `salesperson_code` | Futuro | Puede alimentar una vista futura |
| `Vendedor` | `salesperson_name` | Futuro | Puede alimentar una vista futura |
| `Operación` | `source_transaction_id` | Núcleo | Identificador de factura observado; obligatorio |
| `Bodega` | `warehouse_code` | Futuro/raw | Significado operativo a confirmar |
| `Linea3` | `source_category_code` | Raw | Código interno relacionado con `Linea`; mapping no confirmado |
| `SubLin.` | `source_subcategory_code` | Raw | Código interno relacionado con `Sub-Linea` |
| `Clase` | `source_class_code` | Raw | Código interno no documentado |
| `Con.` | `source_con_code` | Raw | Código binario no documentado |
| `Tipo` | `source_type_code` | Raw | Código binario no documentado |
| `Observaciones` | `source_notes` | Raw | 100 % vacío |
| `Tipo de Cambio` | `exchange_rate` | Condicional | Constante 7; falta columna de moneda |
| `Usuario` | `source_user` | Raw | 100 % vacío |

Las columnas clasificadas como `Raw` se conservan en el archivo original o staging de retención corta, pero no necesitan tablas de dominio en el MVP. Los campos sensibles no se publican en endpoints analíticos ni se registran en logs.

### 7.5 Esquema canónico mínimo

| Campo canónico | Tipo | Obligatorio | Regla |
|---|---|---:|---|
| `sale_date` | date | Sí | Derivado de `Fecha de turno`; no inventar hora |
| `branch_code` | string | Condicional | Requerido cuando el proveedor lo incorpore; mientras tanto usar alias interno |
| `branch_name` | string | Sí | Derivado de `Sucursal`; normalizar espacios, preservar texto original en staging |
| `product_code` | string | Sí | SKU/código estable; no convertir a número |
| `product_name` | string | Sí | Nombre visible no vacío |
| `quantity` | decimal | Sí | Puede ser negativa solo para devoluciones documentadas |
| `unit_price` | decimal monetario | Sí | Derivado de `Precio Unitario` |
| `discount_amount` | decimal monetario | Sí | Derivado de `Descuento`; semántica aún no probada con valores no cero |
| `line_net_amount` | decimal monetario | Sí | Derivado de `Total Neto` |
| `invoice_total_amount` | decimal monetario | Sí | Derivado de `Total Factura`; una sola vez por operación |
| `category_name` | string | Sí | Derivado de `Linea` |
| `subcategory_name` | string | Sí | Derivado de `Sub-Linea` |
| `invoice_number` | string | Sí | Identificador visible, no clave única |
| `source_transaction_id` | string | Sí | Derivado de `Operación`; clave de factura observada |
| `source_line_id` | string | Condicional | Ausente en la muestra; requerido para modo incremental seguro |
| `salesperson_code` | string | No | Campo de expansión, no requerido por vistas núcleo |
| `currency` | código ISO 4217 | Sí | No viene en el extracto; configurar `BOB` solo tras aprobación |
| `is_voided` | boolean | Sí | Derivado de `Anulada` |

### 7.6 Campos derivados de ingestión

- `import_id`: UUID de la carga.
- `source_row_number`: número de fila del archivo, contando el encabezado como fila 1.
- `file_sha256`: huella del archivo original.
- `snapshot_key`: organización + perfil + fecha inicial + fecha final.
- `source_row_ordinal`: posición física dentro del archivo; sirve para trazabilidad, no para identidad entre archivos.
- `row_payload_hash`: huella de los valores normalizados de la fila.
- `imported_at`: fecha/hora del procesamiento.
- `quality_status`: `valid`, `warning`, `rejected` o `duplicate`.

### 7.7 Identidad, snapshots y deduplicación

La política aprobada para el MVP es `period_snapshot`:

1. `source_transaction_id = Operación` identifica la factura dentro del archivo.
2. Las líneas mantienen su multiplicidad y orden fuente; no se deduplican por contenido.
3. `file_sha256` impide publicar dos veces el mismo archivo.
4. Un nuevo archivo con exactamente la misma cobertura temporal reemplaza el snapshot anterior de forma atómica después de validarse y confirmarse.
5. Un archivo con cobertura parcialmente superpuesta se bloquea hasta que el admin elija/cargue un snapshot de periodo completo.
6. Las comparaciones previas a reemplazo muestran operaciones agregadas, removidas, modificadas y el cambio en ventas.

El modo `incremental` solo puede habilitarse cuando el proveedor entregue `source_line_id` único e inmutable. En ese modo la clave será `organization_id + source_line_id`; `row_payload_hash` permitirá detectar una corrección sobre la misma línea. Esta restricción evita eliminar filas legítimas idénticas o duplicar registros de archivos superpuestos.

### 7.8 Validaciones

Errores bloqueantes del archivo:

- Archivo vacío, extensión incorrecta o estructura ilegible.
- Encabezados obligatorios ausentes o duplicados.
- Perfil de fecha o decimal ambiguo.
- Archivo ya importado completamente.
- Monedas múltiples sin columna de moneda ni regla de conversión.

Errores de fila:

- Fecha inválida.
- Sucursal o producto sin código/nombre requerido.
- Cantidad o importe no numérico.
- `Operación` ausente o inválida.
- Valor fuera de límites técnicos configurados.

Advertencias:

- Categoría o subcategoría ausente.
- `quantity × unit_price - discount_amount` no coincide con `line_net_amount` fuera de la tolerancia aprobada.
- Fechas futuras o demasiado antiguas según ventana configurable.
- Nombre diferente para un código ya conocido.
- Cantidad cero; `line_net_amount = 0` es válido pero se etiqueta para análisis.
- Sucursal con rol no comercial, como producción, hasta clasificarla.

La unidad de integridad es la operación completa. Antes de publicar, `SUM(line_net_amount)` debe coincidir con el único `invoice_total_amount` de la operación dentro de una tolerancia de 0,01. Si falla, todas las líneas de esa operación van a cuarentena. El MVP publica operaciones válidas más cuarentena; nunca publica una parte de una operación. El resumen debe advertir claramente las operaciones, filas e importe excluidos. No se permite corregir automáticamente los 12 casos observados aunque parezcan bloques duplicados.

## 8. Modelo de datos lógico

### 8.1 Entidades

| Entidad | Responsabilidad | Campos principales |
|---|---|---|
| `organizations` | Preparar aislamiento futuro | `id`, `name`, `timezone`, `default_currency` |
| `profiles` | Perfil y rol del usuario | `user_id`, `organization_id`, `display_name`, `role`, `status` |
| `branches` | Dimensión sucursal | `id`, `organization_id`, `source_code` opcional, `source_name`, `display_name`, `branch_type`, `active` |
| `products` | Dimensión producto | `id`, `organization_id`, `source_code`, `name`, `category_id`, `active` |
| `categories` | Dimensión categoría | `id`, `organization_id`, `source_code`, `name` |
| `sales` | Cabecera de comprobante | `id`, `organization_id`, `source_transaction_id`, `branch_id`, `invoice_number`, `sale_date`, `invoice_total_amount`, `currency`, `is_voided`, `quality_status` |
| `sale_lines` | Hechos de venta | `id`, `sale_id`, `product_id`, `source_line_id` opcional, `source_row_ordinal`, `quantity`, `unit_price`, `discount_amount`, `line_net_amount`, `import_id` |
| `imports` | Ciclo de vida de una carga | `id`, `organization_id`, `profile_version`, `import_mode`, `period_start`, `period_end`, `filename`, `file_sha256`, `status`, conteos, fechas, `uploaded_by`, `supersedes_import_id` |
| `import_rows` | Staging y trazabilidad | `id`, `import_id`, `row_number`, `raw_payload`, `normalized_payload`, `status`, `errors` |
| `audit_events` | Auditoría | `id`, `organization_id`, `actor_id`, `action`, `resource_type`, `resource_id`, `metadata`, `created_at` |

Para el MVP se permite un modelo físico simplificado con una sola tabla de hechos desnormalizada si las consultas y la migración están cubiertas por pruebas. El contrato lógico anterior se mantiene estable.

### 8.2 Reglas de datos

- Todos los importes se almacenan en tipo decimal exacto, nunca en punto flotante.
- Las fechas de venta se almacenan como `date`; los timestamps operativos se almacenan en UTC y se presentan en `America/La_Paz`, salvo decisión distinta.
- Los códigos fuente se almacenan como texto para preservar ceros iniciales.
- Las eliminaciones operativas serán lógicas cuando afecten trazabilidad.
- Cada tabla de negocio incluye `organization_id`, aun si inicialmente existe una sola organización.
- Las consultas analíticas excluyen filas rechazadas, anuladas o no publicadas.
- Devoluciones y notas de crédito se representan con cantidades/importes negativos si el CSV lo soporta; no se eliminan de forma silenciosa.
- `Total Factura` se almacena una vez en `sales`; nunca se suma directamente desde las filas del archivo.

## 9. Especificación analítica

### 9.1 Convenciones

- El periodo activo siempre se muestra junto al resultado.
- El filtro de fechas es inclusivo en la zona horaria de la organización.
- Todos los KPIs se calculan sobre el mismo conjunto filtrado, salvo etiqueta explícita.
- Una comparación porcentual cuyo periodo anterior sea cero se muestra como `—`, no como infinito.
- Los importes incluyen moneda. No se agregan monedas distintas sin conversión aprobada.
- Redondeo visual: moneda a 2 decimales; cálculos internos conservan precisión original.
- Filas con devolución afectan ventas netas y unidades netas; deben poder distinguirse en detalle.

### 9.2 KPIs núcleo

| KPI | Fórmula | Granularidad | Notas |
|---|---|---|---|
| Ventas netas | `SUM(invoice_total_amount)` una vez por `source_transaction_id` válido y no anulado | Comprobante | Indicador oficial; evita sumar `Total Factura` repetido |
| Ventas atribuidas a productos | `SUM(line_net_amount)` de operaciones válidas y no anuladas | Línea | Debe reconciliar con Ventas netas antes de publicar |
| Ventas brutas derivadas | `SUM(quantity × unit_price)` | Línea | Mostrar solo después de validar descuentos no cero |
| Descuentos | `SUM(discount_amount)` | Línea | Ocultar en MVP: la muestra contiene únicamente ceros |
| Unidades netas | `SUM(quantity)` | Línea | Incluye devoluciones negativas |
| Transacciones | `COUNT(DISTINCT source_transaction_id)` de operaciones válidas y no anuladas | Comprobante | `Operación` es la clave observada en la muestra |
| Ticket promedio | `ventas_netas / transacciones` | Periodo/filtros | Basado en el total de factura una vez por operación |
| Precio medio por unidad | `ventas_netas / unidades_netas` | Periodo/filtros | `—` si unidades netas es cero |
| Variación vs. periodo anterior | `(actual - anterior) / ABS(anterior)` | KPI comparable | El periodo anterior debe tener igual duración |
| Participación | `valor_elemento / valor_total_filtrado` | Sucursal/producto | Total coherente con filtros globales |

KPIs condicionados a columnas aún no verificadas deben permanecer ocultos, no estimarse.

### 9.3 Vista 1 — Ventas General

Objetivo: responder cuánto se vendió, cómo evoluciona y qué elementos explican el resultado.

Componentes:

- Tarjetas: ventas netas, unidades, transacciones y ticket promedio; cada una con comparación cuando sea válida.
- Serie temporal de ventas con granularidad automática día/semana/mes según rango.
- Barras de ventas por sucursal, ordenadas de mayor a menor.
- Tabla de desempeño con fecha/periodo, sucursal, ventas, unidades, transacciones y variación.
- Resumen de calidad/frescura: última carga exitosa, cobertura temporal y advertencia si el periodo tiene huecos.

Filtros: fecha, sucursal y, si los datos existen, categoría/producto.

### 9.4 Vista 2 — Sucursales

Objetivo: comparar sucursales y profundizar en el desempeño de una sucursal.

Componentes:

- Ranking por ventas netas.
- Ventas, unidades, transacciones y ticket promedio por sucursal.
- Evolución temporal comparada; limitar series simultáneas para conservar legibilidad.
- Participación porcentual por sucursal.
- Tabla ordenable con búsqueda y paginación.
- Al seleccionar una sucursal, resumen de sus productos principales y tendencia.

Regla: una sucursal sin ventas en el periodo puede mostrarse con cero si pertenece al catálogo activo; no debe desaparecer cuando esto distorsione la comparación.

### 9.5 Vista 3 — Productos

Objetivo: identificar productos y categorías que impulsan o frenan ventas.

Componentes:

- Ranking de productos por ventas netas y unidades.
- Distribución por categoría cuando exista el dato.
- Tendencia de los productos seleccionados.
- Matriz o tabla con producto, categoría, ventas, unidades, precio medio, participación y variación.
- Búsqueda por código o nombre.
- Selector Top N con valores 10, 20 y 50; el resto puede agruparse como `Otros` solo en gráficos, nunca en exportaciones.

### 9.6 Dos vistas futuras configurables

Se mostrarán dos entradas de presentación en el registro de módulos con estado `coming_soon`. Cada una expone únicamente una pantalla informativa, sin consultas, KPIs ni datos. Habilitar funcionalidad analítica en cualquiera de ellas requiere una mini-especificación que defina:

- Pregunta de negocio y usuario objetivo.
- Campos fuente y nivel de calidad requerido.
- KPIs con fórmulas.
- Filtros e interacciones.
- Componentes visuales.
- Reglas de autorización.
- Criterios de aceptación y prueba.

Opciones candidatas, no comprometidas: Clientes, Vendedores, Rentabilidad, Inventario, Promociones o Comparativos de periodos. No se debe inferir margen o rentabilidad sin costos confiables.

## 10. UX/UI

### 10.1 Estructura de navegación

- Inicio/resumen con acceso a la última carga y a las tres vistas.
- Navegación principal: Ventas, Sucursales, Productos.
- Sección administrativa: Cargas; Usuarios y Auditoría en Fase 2.
- Área persistente de filtros globales en escritorio.
- Panel de filtros deslizable en móvil.
- Indicador visible de última actualización.

### 10.2 Lenguaje visual

- Apariencia profesional, sobria y orientada a decisiones.
- Jerarquía clara: título y periodo, KPIs, tendencias, explicaciones y detalle.
- Paleta accesible; el color no será el único canal para comunicar aumento, caída o estado.
- Formatos locales coherentes para moneda, fecha y números.
- Tooltips que expliquen el valor y, cuando sea útil, su definición.
- Gráficos con título descriptivo, unidad, leyenda legible y estado vacío.

### 10.3 Responsive

Escritorio, desde 1024 px:

- Navegación lateral o superior persistente.
- Cuadrícula de 4 KPIs cuando haya espacio.
- Gráficos en 2 columnas cuando mantengan legibilidad.
- Tablas con columnas clave visibles y acciones previsibles.

Móvil, de 360 a 767 px:

- KPIs en una o dos columnas según ancho.
- Gráficos de una columna, con alto mínimo legible.
- Filtros en panel; mostrar chips de filtros activos.
- Tabla transformada en lista/tarjetas o con desplazamiento horizontal claramente señalado.
- Objetivos táctiles de al menos 44 × 44 px.

### 10.4 Estados obligatorios

Cada vista y componente asíncrono debe diseñar:

- Cargando mediante skeleton sin saltos severos de layout.
- Sin datos para el periodo.
- Sin resultados para los filtros.
- Error recuperable con acción de reintento.
- Datos parciales o advertencia de calidad.
- Éxito de carga con resumen verificable.

### 10.5 Accesibilidad

En Fase 2 se exige conformidad WCAG 2.2 AA en los flujos principales: navegación por teclado, foco visible, etiquetas, contraste, estructura semántica y alternativas textuales/tabulares para información crítica de gráficos.

## 11. Arquitectura sugerida

### 11.1 Stack recomendado

- **Frontend y backend web:** Next.js con App Router y TypeScript estricto.
- **UI:** Tailwind CSS y componentes accesibles basados en shadcn/ui o equivalente.
- **Gráficos:** Recharts, encapsulado en componentes propios.
- **Base de datos:** PostgreSQL administrado por Supabase.
- **Autenticación y almacenamiento:** Supabase Auth y Storage.
- **Hosting:** Vercel para la aplicación; Supabase para datos y archivos.
- **Validación:** esquema compartido con Zod o equivalente, más restricciones SQL.
- **Pruebas:** Vitest/Jest para unidades e integración; Playwright para E2E.
- **Observabilidad:** logs estructurados, captura de errores y métricas; proveedor final por decidir.

Las versiones exactas se fijarán en el plan de implementación usando versiones estables vigentes. No introducir dependencias alternativas sin registrar la decisión.

### 11.2 Componentes y límites

1. **Web UI:** navegación, filtros, tablas, gráficos y accesibilidad.
2. **Application API:** autenticación, autorización, orquestación de cargas y consultas.
3. **Import pipeline:** lectura, mapeo, normalización, validación, deduplicación y publicación.
4. **Analytics query layer:** consultas/funciones que implementan definiciones de KPI estables.
5. **PostgreSQL:** fuente de verdad para datos publicados, staging y auditoría.
6. **Object storage:** originales del CSV y reportes de errores.
7. **Observability:** eventos, métricas y alertas sin datos sensibles.

Los tableros no calcularán KPIs críticos de forma independiente en el navegador. Consumirán resultados tipados de la capa analítica.

### 11.3 Flujo de datos

`CSV -> almacenamiento temporal -> staging -> normalización/validación -> deduplicación -> publicación transaccional -> consultas analíticas -> UI`

Los tableros solo consultan datos publicados. Un fallo antes de la publicación deja los datos anteriores intactos.

### 11.4 Evolución MVP a producción

| Capacidad | MVP | Fase 2 |
|---|---|---|
| Login | Una cuenta admin controlada | Auth administrado, recuperación, sesiones y políticas |
| Importación | Síncrona mientras cumpla límites medidos | Asíncrona para archivos grandes, progreso, reintentos |
| Calidad | Archivo completo + errores básicos | Cuarentena, reglas versionadas, tendencias de calidad |
| Auditoría | Historial de cargas | Eventos completos e inmutables |
| Consultas | Agregaciones indexadas | Vistas materializadas/caché solo si las métricas lo justifican |
| Ambientes | Local + demo | Desarrollo + preview/staging + producción |
| Operación | Diagnóstico manual | Alertas, runbooks, SLO y recuperación probada |

## 12. Requisitos funcionales

### 12.1 Acceso

- **RF-001:** El sistema permite al admin autenticarse y cerrar sesión.
- **RF-002:** Las vistas y rutas de carga rechazan usuarios no autenticados.
- **RF-003:** El sistema verifica el rol en toda operación administrativa.

### 12.2 Importación

- **RF-010:** El admin puede seleccionar o arrastrar un CSV dentro de los límites configurados.
- **RF-011:** El sistema valida el archivo antes de publicar datos.
- **RF-012:** El sistema presenta resumen, advertencias, errores y vista previa.
- **RF-013:** El admin debe confirmar la importación.
- **RF-014:** El sistema registra estado y conteos de cada intento.
- **RF-015:** El mismo archivo no puede publicarse dos veces; un snapshot nuevo del mismo periodo sustituye al anterior de forma atómica.
- **RF-016:** Un fallo no altera el conjunto de datos publicado.
- **RF-017:** El admin puede consultar el historial de cargas.
- **RF-018:** En Fase 2, el admin puede descargar el reporte de filas rechazadas.
- **RF-019:** El modo incremental permanece deshabilitado hasta disponer de `source_line_id` estable.

### 12.3 Analítica

- **RF-020:** Las tres vistas aplican los filtros globales de forma coherente.
- **RF-021:** Ventas General presenta KPIs y evolución del periodo.
- **RF-022:** Sucursales permite comparar y profundizar por sucursal.
- **RF-023:** Productos permite ranking, búsqueda y análisis por producto/categoría.
- **RF-024:** Todas las métricas respetan las fórmulas de la sección 9.
- **RF-025:** La interfaz muestra periodo, moneda y última actualización.
- **RF-026:** La ausencia de un campo opcional oculta el KPI dependiente y explica por qué.
- **RF-027:** Los filtros principales se pueden restaurar desde la URL.
- **RF-028:** Las tablas permiten ordenar y paginar conjuntos que exceden una pantalla.
- **RF-029:** La exportación, cuando esté habilitada, refleja filtros y permisos activos.

### 12.4 Extensibilidad

- **RF-030:** Las vistas se registran mediante una configuración tipada de módulo.
- **RF-031:** Un módulo futuro puede reutilizar filtros, layout, estados, autorización y componentes de datos sin modificar los tres módulos núcleo.
- **RF-032:** Un módulo deshabilitado no aparece en navegación ni expone rutas consultables.
- **RF-033:** Los dos módulos `coming_soon` aparecen en una sección diferenciada de la navegación y sus rutas muestran únicamente un placeholder profesional, sin consultar ni exponer datos.

## 13. Requisitos no funcionales

### 13.1 Rendimiento

- **RNF-001:** En producción, p75 de carga de una vista analítica <= 2,5 s en conexión móvil moderna, con periodo típico.
- **RNF-002:** Interacciones de filtros ya cargados muestran respuesta visual <= 200 ms.
- **RNF-003:** Consultas analíticas típicas completan p95 <= 1,5 s en servidor.
- **RNF-004:** El MVP procesa el archivo de referencia aprobado dentro de 60 s; si no lo logra, debe pasar a procesamiento asíncrono antes de la demo.
- **RNF-005:** Tablas usan paginación/virtualización; no se renderizan miles de filas simultáneamente.

### 13.2 Confiabilidad

- **RNF-010:** Importaciones son idempotentes; el snapshot validado se publica atómicamente y ninguna operación se publica parcialmente.
- **RNF-011:** Disponibilidad objetivo de producción: 99,5 % mensual, excluyendo mantenimiento comunicado.
- **RNF-012:** Objetivos de recuperación iniciales: RPO <= 24 h y RTO <= 4 h; validar con cliente.
- **RNF-013:** Restauración desde respaldo se prueba al menos trimestralmente.

### 13.3 Seguridad y privacidad

- **RNF-020:** TLS en tránsito y cifrado administrado en reposo.
- **RNF-021:** Principio de mínimo privilegio en base, almacenamiento y CI/CD.
- **RNF-022:** RLS por organización en tablas expuestas por Supabase.
- **RNF-023:** Validación en cliente para UX y nuevamente en servidor como autoridad.
- **RNF-024:** Protección contra CSV injection en exportaciones: valores que comienzan con `=`, `+`, `-` o `@` se neutralizan según política documentada.
- **RNF-025:** Logs y eventos no incluyen CSV completo, tokens, contraseñas ni datos personales innecesarios.
- **RNF-026:** Dependencias y secretos se revisan automáticamente en CI.
- **RNF-027:** Política de retención y eliminación de archivos se define antes de producción.

### 13.4 Calidad y mantenibilidad

- **RNF-030:** TypeScript estricto; no usar `any` sin justificación registrada.
- **RNF-031:** Lint, formato, validación de tipos y pruebas deben pasar en CI.
- **RNF-032:** Contratos de API y esquemas de importación están versionados.
- **RNF-033:** Migraciones de base son revisables, reversibles cuando sea viable y probadas en staging.
- **RNF-034:** Toda métrica visible tiene prueba sobre un dataset fixture pequeño y auditable.
- **RNF-035:** Los textos de error orientan la siguiente acción del usuario.

### 13.5 Compatibilidad

- Últimas dos versiones estables de Chrome, Edge, Firefox y Safari en Fase 2.
- Anchos soportados desde 360 px hasta escritorio amplio.
- Zona horaria, moneda y locale se obtienen de configuración de organización.

## 14. Calidad de datos

### 14.1 Dimensiones de calidad

- **Completitud:** porcentaje de valores requeridos presentes.
- **Validez:** porcentaje que cumple tipo, dominio y formato.
- **Unicidad:** repetición de archivo/snapshot y, cuando exista `source_line_id`, duplicados de línea; filas de contenido idéntico no se consideran duplicadas por sí solas.
- **Consistencia:** reconciliación entre importes y catálogos.
- **Oportunidad:** tiempo entre última venta y última carga.
- **Cobertura:** días esperados con datos versus días presentes.

### 14.2 Reporte por carga

Cada carga debe producir:

- Conteo total, válido, importado, en cuarentena y advertido, separado por operaciones y filas.
- Porcentaje de aceptación.
- Errores agrupados por código y columna.
- Primeras filas afectadas como muestra, sin exponer datos sensibles.
- Periodo mínimo y máximo encontrado.
- Número de sucursales y productos nuevos o con cambios de nombre.
- Resultado de reconciliación de importes cuando aplique.

### 14.3 Umbrales iniciales

- 100 % de campos obligatorios presentes a nivel de encabezado.
- 0 errores de parseo de archivo; las operaciones inconsistentes se aíslan completas en cuarentena.
- 0 publicaciones duplicadas del mismo archivo o snapshot activo.
- Diferencia monetaria de reconciliación <= 0,01 por línea, salvo regla de redondeo fuente documentada.
- Diferencia monetaria de reconciliación <= 0,01 entre suma de líneas y total de factura por operación publicada.
- Advertir si más del 5 % de filas carece de un campo opcional usado por una visualización.

Los umbrales deben revisarse con al menos tres archivos reales antes de producción.

## 15. Seguridad por fase

### 15.1 Mínimo obligatorio para la demo

- La demo no se publica sin autenticación si contiene datos reales.
- Usar datos anonimizados cuando se comparta fuera del equipo autorizado.
- Cuenta admin con contraseña fuerte y rotación posterior a la demo.
- Rutas de mutación verificadas en servidor.
- Límites de tipo y tamaño de archivo.
- Variables secretas fuera del repositorio.

### 15.2 Endurecimiento de producción

- MFA para administradores si el proveedor y operación lo permiten.
- Políticas de sesión, recuperación y desactivación de cuentas.
- Rate limiting en login, carga y endpoints costosos.
- RLS probada con casos positivos y negativos.
- Cabeceras de seguridad y política CSP.
- Escaneo de dependencias, análisis estático y revisión de migraciones.
- Registro de auditoría para login, carga, reversión, exportación y gestión de usuarios.
- Revisión de privacidad y clasificación de datos antes de usar campos de cliente.
- Plan de respuesta a incidentes y contactos responsables.

## 16. Testing y verificación

### 16.1 Pirámide de pruebas

- **Unitarias:** normalizadores, fechas, decimales, deduplicación, fórmulas KPI y utilidades de filtros.
- **Integración:** importador con PostgreSQL, restricciones, transacciones, RLS y consultas analíticas.
- **Contrato:** encabezados CSV, esquemas de API y compatibilidad entre UI y servidor.
- **Componentes:** estados visuales, formato, accesibilidad básica e interacciones.
- **E2E:** login, carga válida, rechazo inválido, repetición idempotente, filtros y navegación.
- **Visuales:** páginas clave en escritorio y móvil, con tolerancia controlada.
- **Rendimiento:** archivo real de referencia y volumen objetivo de consultas.
- **Seguridad:** acceso no autorizado, elevación de rol, archivos maliciosos y exposición de objetos.

### 16.2 Fixtures mínimos

Mantener datasets pequeños y legibles que cubran:

- Una venta normal.
- Varias líneas en una transacción.
- Dos sucursales y dos productos.
- Descuento.
- Devolución.
- Fecha límite de periodo.
- Código con cero inicial.
- Dos líneas idénticas legítimas dentro de una misma operación.
- Una operación con bloque de líneas repetido que no reconcilia con `Total Factura`.
- Misma identidad con contenido cambiado.
- Campo opcional nulo.
- Decimal con coma y con punto en perfiles separados.
- Snapshot corregido que reemplaza el mismo periodo.
- Archivo con cobertura parcialmente superpuesta que debe bloquearse.

### 16.3 Matriz crítica de E2E

| Caso | Resultado esperado |
|---|---|
| Admin carga CSV válido | Se publica una vez y los tres tableros reflejan los datos |
| Admin repite el mismo archivo | No se duplican datos; se informa que ya fue procesado |
| Snapshot nuevo cubre exactamente el mismo periodo | Reemplaza la versión previa de forma atómica; no suma ambos archivos |
| Archivo nuevo se superpone parcialmente con un snapshot | Se bloquea y explica cómo cargar un periodo completo |
| CSV carece de columna obligatoria | Importación bloqueada con columna identificada |
| CSV falla a mitad del proceso | Ninguna fila parcial aparece publicada |
| Usuario no autenticado abre Cargas | Se redirige a login o recibe 401/403 apropiado |
| Periodo anterior tiene cero | Variación aparece como `—` |
| Vista móvil a 360 px | Navegación, filtros y KPIs son utilizables sin contenido cortado |

## 17. Observabilidad y operación

### 17.1 Eventos estructurados

Registrar como mínimo:

- `auth.login_succeeded`, `auth.login_failed`, `auth.logout`.
- `import.uploaded`, `import.validation_completed`, `import.confirmed`, `import.completed`, `import.failed`, `import.reverted`.
- `analytics.query_failed` y consultas que superen el umbral lento.
- `export.created`.

Cada evento tendrá timestamp, ambiente, request/correlation ID, actor seudonimizado, organización, recurso, resultado y duración cuando aplique.

### 17.2 Métricas

- Tasa de cargas exitosas.
- Duración y throughput de importación.
- Filas rechazadas/advertidas/duplicadas.
- Latencia y errores de consultas analíticas.
- Errores frontend y backend.
- Frescura de datos por organización.

### 17.3 Alertas iniciales

- Tres cargas fallidas consecutivas.
- Ninguna carga exitosa dentro de la ventana operativa acordada.
- Error rate del servidor por encima del 5 % durante 5 minutos.
- Consulta p95 por encima del objetivo durante 15 minutos.
- Fallo de backup o de prueba de restauración.

### 17.4 Runbooks

Antes de producción deben existir procedimientos para: carga fallida, CSV con esquema nuevo, datos duplicados, métricas incorrectas, indisponibilidad, rotación de secretos, restauración y alta/baja de admin.

## 18. Deployment y ambientes

### 18.1 Ambientes

- **Local:** desarrollo con datos sintéticos/anónimos.
- **Preview:** una instancia por cambio para revisión, sin datos reales.
- **Staging:** configuración similar a producción y dataset de prueba controlado.
- **Producción:** acceso restringido, datos reales, backups y alertas.

Nunca compartir base de datos ni credenciales entre staging y producción.

### 18.2 Pipeline

Por cada cambio:

1. Instalar dependencias de forma reproducible.
2. Ejecutar formato/lint, tipos y pruebas unitarias.
3. Ejecutar pruebas de integración aplicables.
4. Construir la aplicación.
5. Crear preview.
6. Ejecutar smoke/E2E sobre preview o staging.
7. Requerir aprobación humana para producción.
8. Aplicar migraciones con estrategia documentada.
9. Ejecutar smoke test y verificar observabilidad.

### 18.3 Rollback

- La aplicación debe poder volver a una versión anterior sin corromper datos.
- Migraciones destructivas requieren estrategia expand-and-contract.
- La publicación de una carga es independiente del deployment.
- Todo release de producción registra versión, migraciones, responsable y resultado.

## 19. Criterios de aceptación

### 19.1 Fase 1 — MVP/demo

- **CA-MVP-001:** Dado un admin autenticado y el CSV de referencia válido, al confirmar la carga, el sistema publica todas las filas válidas una sola vez y presenta los conteos finales.
- **CA-MVP-002:** Dado el mismo archivo previamente completado, al intentar cargarlo nuevamente, el sistema impide duplicar datos y comunica el estado anterior.
- **CA-MVP-003:** Dado un CSV con encabezado obligatorio ausente, la validación identifica la columna y no habilita Confirmar.
- **CA-MVP-004:** Después de una carga exitosa, Ventas General refleja ventas netas y unidades reconciliadas con el fixture aprobado.
- **CA-MVP-005:** Los filtros por fecha y sucursal actualizan todos los componentes de la vista sin inconsistencias.
- **CA-MVP-006:** Sucursales ordena correctamente por ventas y permite seleccionar una sucursal.
- **CA-MVP-007:** Productos permite buscar por código/nombre y muestra Top N correcto.
- **CA-MVP-008:** Las tres vistas incluyen estados cargando, vacío, sin resultados y error recuperable.
- **CA-MVP-009:** A 360 px no hay contenido esencial inaccesible ni controles imposibles de operar.
- **CA-MVP-010:** Una falla simulada de importación no publica filas parciales.
- **CA-MVP-011:** Todas las cifras del dataset fixture coinciden con cálculos manuales documentados.
- **CA-MVP-012:** La demo puede ejecutarse de principio a fin siguiendo un guion sin comandos ni intervención de desarrollo.
- **CA-MVP-013:** Dado un snapshot corregido con la misma cobertura temporal, al confirmarlo sustituye completamente la versión anterior y conserva el historial, sin sumar ambos snapshots.
- **CA-MVP-014:** Dada una operación cuyo detalle no reconcilia con `Total Factura`, todas sus líneas quedan en cuarentena y ninguna afecta KPIs.
- **CA-MVP-015:** Dadas dos líneas idénticas legítimas dentro de una operación reconciliada, ambas se conservan y contabilizan.

### 19.2 Fase 2 — Producción

- **CA-PROD-001:** Pruebas automáticas demuestran que un `viewer` no puede cargar ni mutar datos por UI, API o acceso a base.
- **CA-PROD-002:** Un archivo grande de volumen objetivo se procesa dentro del SLA aprobado y muestra progreso.
- **CA-PROD-003:** Las filas inválidas quedan en cuarentena con reporte descargable y las reglas de publicación aprobadas.
- **CA-PROD-004:** Los eventos de auditoría permiten reconstruir quién cargó, confirmó, revirtió o exportó información.
- **CA-PROD-005:** Backup y restauración cumplen RPO/RTO en un ejercicio registrado.
- **CA-PROD-006:** Los flujos principales superan pruebas de accesibilidad WCAG 2.2 AA.
- **CA-PROD-007:** Rendimiento medido cumple los RNF-001 a RNF-004 bajo el volumen objetivo.
- **CA-PROD-008:** Alertas críticas se prueban y dirigen al responsable correcto.
- **CA-PROD-009:** El pipeline bloquea despliegues con fallos de tipos, pruebas, build o migración.
- **CA-PROD-010:** Documentación de usuario y runbooks permiten operar el sistema sin depender del equipo de desarrollo.

## 20. Definition of Done

### 20.1 DoD por historia o cambio

- Requisito y criterio de aceptación vinculados.
- Diseño/contrato actualizado si cambia comportamiento observable.
- Implementación revisada y sin cambios fuera de alcance.
- Pruebas añadidas primero o junto con el cambio y ejecutadas.
- Tipos, lint, tests y build exitosos.
- Estados de error, vacío y carga cubiertos cuando aplican.
- Seguridad y privacidad revisadas cuando toca datos, roles o archivos.
- Evidencia adjunta: salida de pruebas y capturas para UI relevante.
- Documentación actualizada.

### 20.2 DoD de Fase 1

- Todos los `CA-MVP-*` aprobados.
- CSV real anonimizado incorporado como caso de contrato o fixture reducido.
- Demo desplegada en ambiente controlado.
- Cuenta admin entregada por canal seguro.
- Guion de demo y plan de recuperación preparados.
- Limitaciones conocidas documentadas y aceptadas.
- Feedback del cliente registrado como decisiones, defectos o backlog; no como notas ambiguas.

### 20.3 DoD de Fase 2

- Todos los `CA-PROD-*` aprobados.
- Revisión de seguridad sin hallazgos críticos/altos abiertos.
- Migración de datos ensayada en staging.
- Observabilidad, backups y runbooks probados.
- Manuales técnico, operativo y de usuario entregados.
- Responsable de operación y soporte definido.
- Aprobación de negocio y técnica para producción.

## 21. Metodología Spec-Driven Development

### 21.1 Jerarquía de fuentes de verdad

1. Decisiones aprobadas en este spec y su registro de cambios.
2. Contratos versionados: CSV, esquema de datos, API y definiciones de KPI.
3. Criterios de aceptación.
4. Plan de implementación vigente.
5. Código y pruebas.

Si código y spec divergen, el agente debe detener la parte afectada, señalar la contradicción y solicitar una decisión; no debe modificar silenciosamente el significado del producto.

### 21.2 Etapas

#### Etapa 0 — Descubrimiento de datos

Entregables:

- CSV real anonimizado y validación del diccionario de 40 columnas derivado del Excel de referencia.
- Perfil de datos: tipos, nulos, duplicados, rangos, cardinalidades y ejemplos.
- Confirmación de que cada carga es un snapshot completo de periodo; si se requiere incremental, provisión de un ID estable de línea.
- Confirmación de `Operación` como clave de factura y definición/provisión de clave de línea.
- Zona horaria, moneda y reglas de devoluciones/anulaciones.
- Dataset fixture con resultados esperados calculados manualmente.

Puerta: no implementar el importador definitivo hasta aprobar el contrato CSV.

#### Etapa 1 — Especificación y decisiones

- Revisar alcance, KPIs, mockups básicos y criterios.
- Resolver decisiones bloqueantes.
- Asignar versión al spec.
- Obtener aprobación de producto y técnica.

#### Etapa 2 — Plan de implementación

- Descomponer Fase 1 en incrementos verticales pequeños y verificables.
- Mapear cada requisito y criterio a tareas y pruebas.
- Definir archivos, interfaces, migraciones y comandos de verificación.
- Evitar planificar Fase 2 en detalle hasta validar el MVP; mantener épicas y contratos de evolución.

#### Etapa 3 — Implementación guiada por pruebas

Para cada tarea:

1. Leer spec, decisión y criterio aplicables.
2. Escribir o actualizar una prueba que falle por la ausencia del comportamiento.
3. Implementar el cambio mínimo.
4. Ejecutar pruebas enfocadas y luego la suite relevante.
5. Revisar seguridad, datos, UX y alcance.
6. Registrar evidencia y commit atómico.

#### Etapa 4 — Verificación integral

- Ejecutar suite automatizada.
- Reconciliar fixture contra resultados manuales.
- Probar el flujo completo en escritorio y móvil.
- Validar seguridad y acceso negativo.
- Ejecutar demo/release checklist.
- Documentar desviaciones como decisiones o defectos.

#### Etapa 5 — Aprendizaje y promoción

- Recoger feedback del cliente.
- Clasificarlo como: corrección, requisito nuevo, decisión o hipótesis.
- Actualizar spec antes de cambiar comportamiento.
- Aprobar el paso a Fase 2.
- Crear planes separados para endurecimiento técnico y para cada vista futura.

### 21.3 Protocolo para agentes de IA

Todo prompt de implementación debe incluir:

- Ruta y versión de este spec.
- IDs de requisitos y criterios incluidos.
- Archivos permitidos o área de trabajo.
- Resultado observable esperado.
- Pruebas que deben demostrarlo.
- Restricciones y decisiones relevantes.
- Instrucción de reportar supuestos, riesgos y desviaciones.

Reglas para agentes:

- No inventar encabezados, fórmulas, roles ni reglas de negocio ausentes.
- No ampliar alcance para “completar” funcionalidades futuras.
- No editar material de referencia bajo `sources/`.
- No usar datos reales en pruebas, screenshots o logs.
- No declarar una tarea terminada sin ejecutar verificaciones proporcionales al cambio.
- No corregir una inconsistencia de datos ocultándola en la visualización.
- Mantener commits pequeños y vinculados a IDs del spec.
- Si falta una decisión bloqueante, entregar diagnóstico y opciones concretas, no una implementación especulativa.

Formato sugerido de reporte de tarea:

```text
Alcance: RF-___ / CA-___
Cambios: ...
Decisiones aplicadas: DEC-___
Pruebas ejecutadas y resultado: ...
Evidencia: ...
Riesgos o desviaciones: ...
Siguiente tarea desbloqueada: ...
```

## 22. Secuencia recomendada de entrega

### Fase 1

1. Descubrimiento y contrato del CSV.
2. Fixture analítico y definición final de KPIs.
3. Base de app, autenticación admin y navegación.
4. Importación vertical mínima con historial.
5. Ventas General con filtros y reconciliación.
6. Sucursales.
7. Productos.
8. Responsive, estados, accesibilidad básica y exportación opcional.
9. E2E, rendimiento con archivo real, deployment de demo y guion.
10. Revisión del cliente y decisión de avanzar.

### Fase 2

1. Revisión de arquitectura y deuda aceptada del MVP.
2. Modelo normalizado/migración si las métricas lo justifican.
3. Auth, RLS, auditoría y gestión operativa de usuarios.
4. Pipeline asíncrono, cuarentena, reintentos y reversión.
5. Observabilidad, alertas, backup/restauración y runbooks.
6. Suite de seguridad, rendimiento, accesibilidad y compatibilidad.
7. CI/CD y separación completa de ambientes.
8. Documentación y capacitación.
9. Mini-spec e implementación de cada vista futura aprobada.
10. Go-live controlado y seguimiento posterior.

## 23. Backlog de mejoras

Prioridad alta después del MVP:

- Perfilado automatizado de cada carga y tendencia de calidad.
- Viewer de solo lectura.
- Procesamiento asíncrono y notificación de finalización.
- Exportaciones auditadas.
- Comparación flexible con periodo anterior/año anterior.
- Filtros guardados y vistas compartibles.

Prioridad media:

- Catálogo y alias administrables para sucursales/productos.
- Anotaciones de eventos comerciales sobre series temporales.
- Programación de reportes.
- PWA instalable si la frecuencia móvil lo justifica.
- Integración API con ERP, diseñada como nuevo adaptador de ingestión.

Exploración futura:

- Forecasting con intervalos de incertidumbre.
- Detección de anomalías.
- Alertas por umbral o tendencia.
- Métricas de rentabilidad cuando exista costo confiable.
- Multiempresa y benchmarking interno.

Ninguna mejora futura debe implementarse sin una hipótesis de valor, datos disponibles y criterio de éxito.

## 24. Decisiones abiertas

| ID | Decisión | Recomendación inicial | Bloquea |
|---|---|---|---|
| `DEC-001` | ¿Cada carga es un snapshot completo del periodo? | Sí para MVP; bloquear superposición parcial | Flujo operativo del MVP |
| `DEC-002` | ¿Puede la fuente agregar un ID estable por línea? | Solicitarlo; sin él no habilitar modo incremental | Importación incremental de producción |
| `DEC-003` | Encabezados, separador, fechas y decimales exactos del CSV | Usar el mapa de 40 columnas de la sección 7 y verificarlo con el CSV real | Importador |
| `DEC-004` | ¿Venta neta incluye impuestos y devoluciones? | Usar valor contable del ERP y documentar composición | KPI principal |
| `DEC-005` | Moneda y posibilidad de múltiples monedas | Una moneda por organización en MVP | Agregaciones |
| `DEC-006` | Zona horaria operativa | `America/La_Paz` | Cortes diarios |
| `DEC-007` | Política ante operaciones inválidas | Publicar operaciones válidas y enviar operaciones completas inconsistentes a cuarentena | Flujo de carga |
| `DEC-008` | Volumen máximo y frecuencia de carga | La muestra tiene 69.627 filas y ~12,5 MB en XLSX; medir CSV y otros 2 periodos | Rendimiento/arquitectura |
| `DEC-009` | Retención del CSV original | 90 días iniciales; validar requisitos legales/operativos | Storage y privacidad |
| `DEC-010` | Usuarios y roles de producción | Admin + viewer | Auth/RLS |
| `DEC-011` | ¿Exportación entra en la demo? | Incluir solo si no arriesga criterios núcleo | Alcance MVP |
| `DEC-012` | Branding, logo, colores y tipografía | Aprobado 2026-09-03: usar negro, blanco cálido y rojo `#F62D29` extraídos del logo; mantener colores semánticos accesibles | UI final |
| `DEC-013` | Dos vistas adicionales | Aprobado 2026-09-03: mostrar dos placeholders `Coming Soon`; cada vista funcional requiere mini-spec después del feedback | Fase 2 |
| `DEC-014` | SLO, RPO y RTO definitivos | Adoptar objetivos iniciales de RNF y validar | Go-live |
| `DEC-015` | Proveedor de observabilidad | Elegir por costo, integración y residencia de datos | Operación Fase 2 |
| `DEC-016` | ¿`PRODUCCION SANTA CRUZ` participa en ventas comerciales? | Excluir de rankings hasta clasificarla; conservar en staging | KPIs por sucursal |
| `DEC-017` | Significado de 17.839 líneas con venta cero | Conservar unidades y monto cero; validar si son componentes/cortesías | Vista Productos |
| `DEC-018` | ¿Se necesita analítica futura de clientes? | No ingerir NIT/razón social al modelo publicado del MVP | Privacidad y retención |

## 25. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| CSV cambia sin aviso | Cargas bloqueadas o datos erróneos | Perfil versionado, detección de esquema y mensaje claro |
| No existe ID estable de línea | Duplicados o eliminación de líneas legítimas idénticas | Usar snapshots de periodo; exigir ID de línea antes de modo incremental |
| Bloques de detalle duplicados dentro de una operación | Inflado de ventas/productos | Reconciliar cada operación con `Total Factura` y enviarla completa a cuarentena |
| KPIs ambiguos | Pérdida de confianza | Fixture reconciliado y definiciones aprobadas |
| MVP se convierte en producción sin endurecimiento | Riesgo operativo y de seguridad | Gate formal entre fases y lista de limitaciones |
| Gráficos agregan monedas o periodos incompatibles | Decisiones incorrectas | Validaciones y etiquetas explícitas |
| Archivos grandes agotan request web | Carga fallida | Umbral medido y migración a job asíncrono |
| NIT y razón social aparecen en logs/demos | Incidente de privacidad | No ingerirlos al modelo analítico MVP, anonimizar y filtrar logs |
| Dos vistas futuras acoplan el núcleo | Retrabajo | Registro de módulos y mini-spec independiente |

## 26. Documentación requerida

### MVP

- Este spec y registro de decisiones.
- Diccionario/mapa del CSV.
- Catálogo de KPIs con ejemplos.
- README de instalación y configuración.
- Guía breve de carga y resolución de errores.
- Guion de demo.
- Limitaciones conocidas.

### Producción

- Arquitectura y diagramas de flujo/datos.
- Referencia de contratos/API y migraciones.
- Matriz de roles y RLS.
- Manual de usuario y administración.
- Runbooks y contactos de escalamiento.
- Backup/restauración y continuidad.
- Política de retención/privacidad.
- Registro de releases y cambios analíticos.

## 27. Gate de inicio y aprobación

### Ready para Fase 1

- [x] Excel de referencia perfilado: 69.627 filas, 40 columnas y periodo julio de 2026.
- [ ] CSV real anonimizado disponible.
- [ ] Mapa de encabezados aprobado.
- [ ] `DEC-001` a `DEC-008` y `DEC-016` a `DEC-018` resueltas o con fallback explícitamente aceptado.
- [ ] Fixture y resultados esperados revisados por negocio.
- [ ] Wireframe/navegación de las tres vistas aprobado.
- [ ] Ambiente y cuenta de demo definidos.

### Gate Fase 1 -> Fase 2

- [ ] DoD del MVP completada.
- [ ] Demo y feedback documentados.
- [ ] Métricas y visualizaciones aprobadas por cliente.
- [ ] Deuda técnica y limitaciones clasificadas.
- [ ] Alcance, presupuesto y objetivos operativos de Fase 2 aprobados.
- [ ] Decisión separada para cada tablero adicional.

### Ready para producción

- [ ] DoD de Fase 2 completada.
- [ ] Aprobaciones técnica, seguridad, datos y negocio.
- [ ] Responsables de operación y respuesta a incidentes asignados.
- [ ] Plan de go-live y rollback ensayado.

## 28. Registro de cambios

| Versión | Fecha | Cambio | Aprobación |
|---|---|---|---|
| 0.1.0 | 2026-09-02 | Primera especificación integral de MVP y producto profesional | Pendiente |
| 0.2.0 | 2026-09-02 | Contrato actualizado con perfil del Excel de referencia, snapshot mensual, cuarentena por operación y mapeo de 40 columnas | Pendiente |
