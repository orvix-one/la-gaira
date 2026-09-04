# Plan: Compartir y exportar dashboards

## Diseño técnico

Se incorpora un componente cliente reutilizable en `src/ui/components` y se compone
desde `PageHeader` cuando la vista tiene filtros analíticos. Una Server Action recibe
únicamente la ruta, filtros efectivos y métricas seleccionadas y guarda esa referencia bajo
`data/processed/shared-dashboards`. Al abrir el enlace, la ruta compartida vuelve a ejecutar
los mismos casos de uso mediante `SalesSource` y presenta todos sus KPIs, gráficos y tablas
sin el shell administrativo. El renderer incluye únicamente las métricas elegidas, sin
recortar los datos internos de una tabla o visualización. El identificador aleatorio forma una ruta pública independiente
que vence a las 24 horas. La exportación usa
`window.print()` y los mismos identificadores estables de métricas para ocultar de la salida
los bloques no seleccionados, además de estilos `@media print` sobre el shell.

## Decisiones

| Decisión | Alternativas consideradas | Justificación |
|---|---|---|
| Referencia temporal con token aleatorio | Compartir la URL original | Conserva todos los datos sin exponer una ruta administrativa permanente |
| Selector previo por métrica | Enlace fijo con todo el dashboard | El emisor controla exactamente qué información comparte |
| Selector compartido para PDF | Exportar siempre la página completa | Mantiene el mismo control de divulgación en ambos flujos |
| Persistencia temporal local | Nueva base o servicio externo | Es coherente con el backend local actual y no suma dependencias |
| Recalcular en cada acceso | Congelar un resumen parcial | Mantiene todos los registros y reutiliza los contratos oficiales |
| Impresión nativa / Guardar como PDF | Librería de captura DOM | Mejor fidelidad vectorial, accesibilidad y cero dependencias |
| Acciones automáticas cuando hay filtros | Configurar cada página por separado | Evita duplicación y cubre todas las vistas analíticas actuales |

## Riesgos

- El diálogo y formato final dependen del navegador; se mitiga con una hoja de impresión
  explícita y orientación horizontal.
- La API Web Share no está disponible en todos los navegadores; se mitiga copiando la URL.
- El almacenamiento local no se comparte entre réplicas y se reemplazará por el backend
  persistente cuando el producto se despliegue de forma distribuida.
