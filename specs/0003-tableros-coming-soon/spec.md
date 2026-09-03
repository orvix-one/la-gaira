# 0003 — Tableros adicionales Coming Soon

> Incremento basado en `specs/_template/spec.md` v0.2.0, RF-030 a RF-033 y DEC-013.

| Campo | Valor |
|---|---|
| Estado | Aprobado para implementación |
| Fecha | 2026-09-03 |
| Alcance | Dos placeholders visibles para demostrar extensibilidad al cliente |

## Objetivo

Agregar dos entradas diferenciadas en la navegación lateral. Cada ruta debe mostrar una pantalla profesional con el mensaje `Coming Soon`, sin consultar datos ni simular funcionalidad analítica.

## Criterios de aceptación

1. La navegación muestra `Tablero adicional 1` y `Tablero adicional 2` bajo la sección `Próximamente`.
2. Ambos elementos muestran una etiqueta visual `Soon` y conservan el estado activo al navegar.
3. `/tableros/futuro-1` y `/tableros/futuro-2` muestran un placeholder reutilizable con `Coming Soon`.
4. Las rutas no muestran filtros ni consultan `SalesSource` desde su página.
5. El diseño funciona en sidebar de escritorio y drawer móvil.
6. `npm run typecheck`, `npm run lint` y `npm run build` pasan.

## Fuera de alcance

- Definir objetivo de negocio, KPIs, datos o visualizaciones de las vistas futuras.
- Habilitar endpoints o consultas analíticas.
- Elegir nombres definitivos antes del feedback del cliente.
