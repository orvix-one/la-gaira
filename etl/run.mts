// Orquestador de la ETL. La lógica de negocio vive en schema.sql / transform.sql /
// checks.sql; este archivo solo descubre inputs, mapea encabezados y encadena los pasos.
// Ver etl/README.md para el flujo completo.
//
// Uso:
//   npm run etl                 # procesa todo data/raw/*.csv y data/raw/*.xlsx
//   npm run etl -- archivo.csv  # procesa uno o más archivos puntuales

import { DuckDBInstance, listValue, type DuckDBConnection } from "@duckdb/node-api";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const RAW_DIR = resolve("data/raw");
const OUT_DIR = resolve("data/processed");
const DB_PATH = join(OUT_DIR, "gaira.duckdb");
const TMP_DB_PATH = join(OUT_DIR, "gaira.duckdb.tmp");
const REPORT_PATH = join(OUT_DIR, "etl-report.json");

// Columnas de stg_ventas_raw, en el mismo orden que etl/schema.sql (sin _archivo/_fila).
const STAGING_COLUMNS = [
  "factura_num", "fecha_turno", "hora", "codigo", "descripcion", "cantidad", "unidad",
  "precio_unitario", "descuento", "total_neto", "iva", "it", "linea", "sub_linea",
  "tipo_producto", "peso_unitario", "ope", "tipo_venta", "familia_clientes", "sucursal",
  "nit", "codigo2", "sec", "cliente", "razon_social", "total_factura", "anulada",
  "forma_pago", "cod_vend", "vendedor", "operacion", "bodega", "linea3", "sublin",
  "clase", "con", "tipo", "observaciones", "tipo_cambio", "usuario",
] as const;

// Punto de extensión para cuando el origen cambie de encabezados (p.ej. el ERP en vez
// del Excel de muestra): cada columna de staging acepta cualquiera de sus alias, ya
// normalizados (ver normalizeHeader). El primero de cada lista es el encabezado del
// archivo de muestra.
const ALIASES: Record<(typeof STAGING_COLUMNS)[number], string[]> = {
  factura_num: ["factura_n", "factura_no", "nro_factura", "numero_factura", "num_factura"],
  fecha_turno: ["fecha_de_turno", "fecha", "fecha_venta"],
  hora: ["hora"],
  codigo: ["codigo", "cod_producto", "codigo_producto"],
  descripcion: ["descripcion", "producto", "nombre_producto"],
  cantidad: ["cantidad", "cant"],
  unidad: ["unidad"],
  precio_unitario: ["precio_unitario", "precio"],
  descuento: ["descuento"],
  total_neto: ["total_neto", "importe_neto", "importe"],
  iva: ["iva"],
  it: ["it"],
  linea: ["linea"],
  sub_linea: ["sub_linea", "sublinea"],
  tipo_producto: ["tipo_de_producto", "tipo_producto"],
  peso_unitario: ["peso_unitario"],
  ope: ["ope"],
  tipo_venta: ["tipo_de_venta", "tipo_venta"],
  familia_clientes: ["familia_de_clientes", "familia_clientes"],
  sucursal: ["sucursal", "local", "tienda"],
  nit: ["nit"],
  codigo2: ["codigo2"],
  sec: ["sec"],
  cliente: ["cliente"],
  razon_social: ["razon_social"],
  total_factura: ["total_factura"],
  anulada: ["anulada"],
  forma_pago: ["forma_de_pago", "forma_pago"],
  cod_vend: ["cod_vend", "codigo_vendedor"],
  vendedor: ["vendedor"],
  operacion: ["operacion", "nro_operacion", "operacion_id"],
  bodega: ["bodega"],
  linea3: ["linea3", "linea_codigo"],
  sublin: ["sublin", "sub_linea_codigo"],
  clase: ["clase"],
  con: ["con"],
  tipo: ["tipo"],
  observaciones: ["observaciones"],
  tipo_cambio: ["tipo_de_cambio", "tipo_cambio"],
  usuario: ["usuario"],
};

function normalizeHeader(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function quoteIdent(name: string): string {
  return '"' + name.replace(/"/g, '""') + '"';
}

type HeaderMap = {
  projection: Record<(typeof STAGING_COLUMNS)[number], string | null>;
  unmatchedSource: string[];
  missingTarget: string[];
};

function mapHeaders(sourceColumns: string[]): HeaderMap {
  const bySourceNormalized = new Map<string, string>();
  for (const col of sourceColumns) bySourceNormalized.set(normalizeHeader(col), col);

  const projection = {} as HeaderMap["projection"];
  const missingTarget: string[] = [];
  const matchedSource = new Set<string>();

  for (const target of STAGING_COLUMNS) {
    const aliases = ALIASES[target];
    const hit = aliases.map((a) => bySourceNormalized.get(a)).find((v) => v !== undefined);
    if (hit === undefined) {
      projection[target] = null;
      missingTarget.push(target);
    } else {
      projection[target] = hit;
      matchedSource.add(hit);
    }
  }

  const unmatchedSource = sourceColumns.filter((c) => !matchedSource.has(c));
  return { projection, unmatchedSource, missingTarget };
}

function discoverFiles(explicitArgs: string[]): string[] {
  if (explicitArgs.length > 0) return explicitArgs.map((p) => resolve(p));
  if (!existsSync(RAW_DIR)) return [];
  return readdirSync(RAW_DIR)
    .filter((f) => [".csv", ".xlsx"].includes(extname(f).toLowerCase()))
    .sort()
    .map((f) => join(RAW_DIR, f));
}

async function readSourceColumns(conn: DuckDBConnection, path: string): Promise<string[]> {
  const tableFn = extname(path).toLowerCase() === ".xlsx" ? "read_xlsx" : "read_csv";
  const result = await conn.run(
    `SELECT * FROM ${tableFn}($path, all_varchar=true) LIMIT 0`,
    { path },
  );
  return result.columnNames();
}

async function loadFile(
  conn: DuckDBConnection,
  path: string,
  issues: { severidad: string; regla: string; detalle: string; filas_afectadas: number }[],
): Promise<number> {
  const isXlsx = extname(path).toLowerCase() === ".xlsx";
  const tableFn = isXlsx ? "read_xlsx" : "read_csv";
  const archivo = path.split("/").pop() ?? path;

  if (isXlsx) {
    try {
      await conn.run("INSTALL excel; LOAD excel;");
    } catch (err) {
      throw new Error(
        `No se pudo cargar la extensión 'excel' de DuckDB (necesaria para leer ${archivo}). ` +
          `Requiere acceso a internet la primera vez (descarga desde extensions.duckdb.org). ` +
          `Si este entorno no tiene salida a internet, exportá el archivo a CSV. Error original: ${String(err)}`,
      );
    }
  }

  const sourceColumns = await readSourceColumns(conn, path);
  const { projection, unmatchedSource, missingTarget } = mapHeaders(sourceColumns);

  for (const col of missingTarget) {
    issues.push({
      severidad: "warning",
      regla: "columna_esperada_ausente",
      detalle: `${archivo}: no se encontró la columna '${col}' (ni sus alias conocidos); se cargó como NULL`,
      filas_afectadas: 0,
    });
  }
  for (const col of unmatchedSource) {
    issues.push({
      severidad: "warning",
      regla: "columna_no_reconocida",
      detalle: `${archivo}: la columna '${col}' no coincide con ninguna columna esperada; se ignoró`,
      filas_afectadas: 0,
    });
  }

  const selectList = STAGING_COLUMNS.map((target) => {
    const source = projection[target];
    return source === null ? `NULL::VARCHAR AS ${target}` : `${quoteIdent(source)} AS ${target}`;
  }).join(",\n    ");

  const sql = `
    INSERT INTO stg_ventas_raw
    SELECT
      $archivo AS _archivo,
      row_number() OVER () AS _fila,
      ${selectList}
    FROM ${tableFn}($path, all_varchar=true)
  `;
  await conn.run(sql, { archivo, path });

  const countResult = await conn.run(
    `SELECT count(*) AS n FROM stg_ventas_raw WHERE _archivo = $archivo`,
    { archivo },
  );
  const rows = await countResult.getRowObjects();
  return Number(rows[0]?.n ?? 0);
}

async function main() {
  const files = discoverFiles(process.argv.slice(2));
  if (files.length === 0) {
    console.error(`No se encontraron archivos .csv/.xlsx en ${RAW_DIR} (ni se pasaron por argumento).`);
    process.exitCode = 1;
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  if (existsSync(TMP_DB_PATH)) rmSync(TMP_DB_PATH);

  const startedAt = Date.now();
  const runId = randomUUID();
  const issues: { severidad: string; regla: string; detalle: string; filas_afectadas: number }[] = [];

  const instance = await DuckDBInstance.create(TMP_DB_PATH);
  const conn = await instance.connect();

  try {
    await conn.run(readFileSync(join(import.meta.dirname, "schema.sql"), "utf8"));

    let filasLeidas = 0;
    for (const path of files) {
      console.log(`Cargando ${path} ...`);
      filasLeidas += await loadFile(conn, path, issues);
    }

    await conn.run(readFileSync(join(import.meta.dirname, "transform.sql"), "utf8"));

    await conn.run("SET VARIABLE run_id = $runId", { runId });
    await conn.run(readFileSync(join(import.meta.dirname, "checks.sql"), "utf8"));

    for (const issue of issues) {
      await conn.run(
        `INSERT INTO etl_issue (run_id, severidad, regla, detalle, filas_afectadas)
         VALUES ($runId, $severidad, $regla, $detalle, $filas)`,
        { runId, severidad: issue.severidad, regla: issue.regla, detalle: issue.detalle, filas: issue.filas_afectadas },
      );
    }

    const issueRows = (await (await conn.run("SELECT severidad, regla, detalle, filas_afectadas FROM etl_issue")).getRowObjects())
      .map((r) => ({
        severidad: String(r.severidad),
        regla: String(r.regla),
        detalle: String(r.detalle),
        filas_afectadas: Number(r.filas_afectadas),
      }));

    const errores = issueRows.filter((i) => i.severidad === "error");
    const filasCargadasRows = await (await conn.run("SELECT count(*) AS n FROM stg_ventas_raw")).getRowObjects();
    const filasCargadas = Number(filasCargadasRows[0]?.n ?? 0);
    const duracionMs = Date.now() - startedAt;

    await conn.run(
      `INSERT INTO etl_run (run_id, ejecutado_en, archivos, filas_leidas, filas_cargadas, duracion_ms)
       VALUES ($runId, current_timestamp, $archivos, $leidas, $cargadas, $duracion)`,
      {
        runId,
        archivos: listValue(files.map((f) => f.split("/").pop() ?? f)),
        leidas: filasLeidas,
        cargadas: filasCargadas,
        duracion: duracionMs,
      },
    );

    const report = {
      run_id: runId,
      ejecutado_en: new Date().toISOString(),
      archivos: files,
      filas_leidas: filasLeidas,
      filas_cargadas: filasCargadas,
      duracion_ms: duracionMs,
      ok: errores.length === 0,
      issues: issueRows,
    };
    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

    conn.closeSync();

    if (errores.length > 0) {
      rmSync(TMP_DB_PATH);
      console.error(`\nLa carga encontró ${errores.length} error(es). No se actualizó ${DB_PATH}.`);
      for (const e of errores) console.error(`  [error] ${e.regla}: ${e.detalle} (${e.filas_afectadas} filas)`);
      console.error(`\nReporte completo en ${REPORT_PATH}`);
      process.exitCode = 1;
      return;
    }

    if (existsSync(DB_PATH)) rmSync(DB_PATH);
    renameSync(TMP_DB_PATH, DB_PATH);

    console.log(`\nOK — ${filasCargadas} filas cargadas desde ${files.length} archivo(s) en ${duracionMs}ms.`);
    const warnings = issueRows.filter((i) => i.severidad === "warning");
    if (warnings.length > 0) {
      console.log(`${warnings.length} advertencia(s):`);
      for (const w of warnings) console.log(`  [warning] ${w.regla}: ${w.detalle} (${w.filas_afectadas} filas)`);
    }
    console.log(`Base de datos: ${DB_PATH}`);
    console.log(`Reporte: ${REPORT_PATH}`);
  } catch (err) {
    conn.closeSync();
    if (existsSync(TMP_DB_PATH)) rmSync(TMP_DB_PATH);
    throw err;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
