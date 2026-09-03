# AGENTS.md

Fuente única de verdad para cualquier agente (Claude Code, Codex, Kimi, etc.) que trabaje en este repositorio. Léelo antes de escribir código.

## 1. Stack

| Tecnología | Versión instalada |
|---|---|
| Node.js | 24.20.0 (LTS activa, ver `.nvmrc`) |
| npm | 12.0.2 |
| Next.js | 16.3.4 (App Router, Turbopack) |
| React / React DOM | 19.2.8 |
| TypeScript | 6.0.3 (fijado; ver nota abajo) |
| ESLint | 9.39.5 (fijado; ver nota abajo) |
| Tailwind CSS | 4.3.3 (CSS-first, sin `tailwind.config.js`) |
| zod | 4.5.4 — validación de contratos/inputs |
| @duckdb/node-api | 1.5.5-r.4 |

Nota: `typescript` y `eslint` están fijados por debajo de sus últimas versiones (7.x y 10.x respectivamente) porque `eslint-config-next@16.3.4` depende internamente de `typescript-eslint@8.69.0` (peer `typescript` `<6.1.0`) y `eslint-plugin-import@2.32.0` (peer `eslint` `^9`). Subir cualquiera de las dos rompe la resolución de dependencias. Revisar al actualizar `eslint-config-next`.

## 2. Comandos

```
npm run dev        # next dev — servidor de desarrollo
npm run build       # next build — build de producción (Turbopack)
npm run start        # next start — sirve el build de producción
npm run lint         # eslint . — next lint fue removido en Next 16
npm run typecheck    # tsc --noEmit
npm run etl          # node etl/run.mts — reconstruye data/processed/gaira.duckdb desde data/raw/*.{csv,xlsx}
```

## 3. Estructura

```
src/app/                    # Presentación: rutas (App Router). Página = UI + fetch de casos de uso. Sin lógica de negocio.
src/domain/                 # Contrato canónico y modelo de negocio (p.ej. FactVentaLinea). Sin dependencias de otras capas.
src/application/            # Casos de uso: orquestan queries contra el dominio. Sin JSX, sin acceso a infraestructura directo.
src/infrastructure/data/    # Port SalesSource y sus adapters (DuckDB, ERP futuro). Ningún otro layer importa un adapter directo.
src/ui/                     # Componentes presentacionales y wrappers de charts. Sin fetch de datos.
data/raw/                   # Fuente sin procesar (Excel de muestra, CSVs del cliente). Se versiona.
data/processed/             # gaira.duckdb + etl-report.json. Gitignored, se regenera con `npm run etl`.
etl/                        # ETL (CSV/XLSX → DuckDB): schema.sql, transform.sql, checks.sql, run.mts. Ver etl/README.md.
specs/                      # Spec-Driven Development. Ver specs/README.md.
```

## 4. Reglas

1. No se escribe código sin un spec aprobado en `specs/`. Ver `specs/README.md`.
2. El contrato de datos (`src/domain/sales`) es la frontera sagrada. La UI **nunca** lee columnas crudas del Excel/CSV/ERP; solo consume el contrato canónico.
3. La obtención de datos pasa **siempre** por el port `SalesSource` (`src/infrastructure/data`). Hoy el adapter es DuckDB (`data/processed/gaira.duckdb`, generado por `npm run etl`); mañana el ERP. Ningún componente importa un adapter directamente.
4. Dirección de dependencias: `app → application → domain ← infrastructure`. `domain` no importa de ninguna otra capa.
5. Charts: librería por decidir en la fase de UI (candidatos: shadcn/ui + Recharts, o Tremor Raw). Prohibido: `@tremor/react` clásico (incompatible con Tailwind v4).
6. Estado de filtros compartible vía URL con `nuqs`.
7. Estilos: Tailwind v4 (CSS-first).
8. Runtime: Node 24 LTS (ver `.nvmrc`).
9. Antes de dar por terminada una tarea: `npm run typecheck` y `npm run lint` en verde.

## 5. Definition of Done

Un PR/entrega está terminado cuando:

- Tiene un spec en `specs/NNNN-nombre/` referenciado.
- `npm run typecheck`, `npm run lint` y `npm run build` pasan sin errores.
- No introduce lecturas directas de Excel/CSV/ERP fuera de `src/infrastructure/data` (o `etl/`, que es la única capa que también puede leerlos).
- No introduce una librería de charts fuera de la decidida en la fase de UI.
- La documentación (`AGENTS.md`, `ARCHITECTURE.md`) se actualiza si el cambio afecta stack, estructura o reglas.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
