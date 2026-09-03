# Arquitectura

## Fases del proyecto

1. **Fase 0 — Toolchain**. Node 24, Next 16.3, React 19.2, Tailwind v4.
2. **Boilerplate**. TypeScript estricto, ESLint, estructura de carpetas DDD-lite, documentación.
3. **Esquema + ETL**. Excel de muestra → Parquet, con el contrato canónico (`FactVentaLinea`) definido en `src/domain/sales`.
4. **UI de las 3 páginas**. Dashboard, sucursal, productos. Incluye la elección de librería de charts (shadcn/ui + Recharts, o Tremor Raw).
5. **Backend robusto + BD** (condicional a aprobación del cliente).

## Arquitectura: DDD-lite por capas + ports & adapters

```
src/app            (presentación: rutas Next.js)
      │
      ▼
src/application    (casos de uso: orquestan queries)
      │
      ▼
src/domain         (contrato canónico, sin dependencias salientes)
      ▲
      │
src/infrastructure (port SalesSource + adapters: parquet, ERP futuro)
```

`domain` no depende de ninguna otra capa; todas las demás dependen de `domain`, directa o indirectamente. `infrastructure` implementa el port que `domain`/`application` definen, no al revés (inversión de dependencias).

## El seam de datos

El port `SalesSource` (`src/infrastructure/data`) existe para que la fuente de datos sea intercambiable sin tocar la UI. Hoy los datos vienen de un Parquet generado por la ETL a partir de un Excel de muestra (`data/raw/SampleDataLaGaira.xlsx`); el día que la fuente sea el ERP de la empresa, se escribe un adapter nuevo que implemente el mismo port y la UI no cambia. Lo único que debe sobrevivir a ese cambio es el contrato canónico en `src/domain/sales`.

## Qué es desechable vs. permanente

- **Desechable**: los adapters de esta fase (parquet) y los scripts de `etl/`. Se reemplazan sin ceremonia cuando cambia la fuente.
- **Permanente**: el contrato canónico (`src/domain/sales`) y la capa de presentación (`src/app`, `src/ui`).
