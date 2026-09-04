# 0005 — Compartir y exportar dashboards

| Campo | Valor |
|---|---|
| Estado | Aprobado para implementación |
| Fecha | 2026-09-04 |
| Origen | Solicitud directa del usuario |

## Objetivo

Permitir que las vistas analíticas generen un enlace temporal hacia una presentación
limpia de solo lectura, conservando todos los datos y controles de exploración no
mutables del dashboard. La vista original también puede exportarse como PDF.

## Criterios de aceptación

1. Inicio, Ventas General, Sucursales, detalle de sucursal y Productos muestran acciones
   para compartir y exportar.
2. El enlace apunta a una página independiente y sin navegación administrativa.
3. Antes de generar el enlace, el usuario puede seleccionar individualmente los KPIs,
   gráficos y tablas que desea compartir, con opción de seleccionar o quitar todos.
4. Cada visualización o tabla seleccionada conserva todos sus datos; búsqueda, ordenación
   y paginación siguen activas en la vista compartida.
5. Cada enlace usa un identificador aleatorio, vence a las 24 horas y muestra claramente
   su fecha de expiración. Los enlaces vencidos dejan de estar disponibles.
6. En dispositivos compatibles se usa el diálogo nativo para compartir el enlace temporal;
   en los demás se copia al portapapeles con confirmación accesible.
7. Antes de exportar, el usuario utiliza el mismo selector para escoger individualmente
   los KPIs, gráficos y tablas que incluirá el PDF.
8. Exportar abre el diálogo de impresión y la salida omite navegación, filtros interactivos,
   botones de acción y cualquier métrica no seleccionada; conserva título, periodo y moneda.
9. Las acciones no requieren servicios externos ni nuevas dependencias.
10. `npm run typecheck`, `npm run lint` y `npm run build` pasan.

## Fuera de alcance

- Conservación permanente o administración de enlaces compartidos.
- Persistencia distribuida entre múltiples instancias del servidor.
- Exportar archivos Excel o imágenes rasterizadas.
- Exportar todos los registros fuera de la visualización actual.
