import { randomBytes } from "node:crypto";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  dashboardCompartidoSchema,
  type DashboardCompartido,
  type DashboardCompartidoBase,
} from "@/domain/sales";

const SHARE_DIR = join(process.cwd(), "data", "processed", "shared-dashboards");
const DURACION_MS = 24 * 60 * 60 * 1000;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32}$/;

/** Persistencia temporal local; se reemplazará por el backend compartido en producción distribuida. */
export async function guardarDashboardTemporal(
  base: DashboardCompartidoBase,
): Promise<{ token: string; expiraAt: string }> {
  await mkdir(SHARE_DIR, { recursive: true });
  await limpiarExpirados();

  const token = randomBytes(24).toString("base64url");
  const ahora = new Date();
  const snapshot: DashboardCompartido = {
    ...base,
    generadoAt: ahora.toISOString(),
    expiraAt: new Date(ahora.getTime() + DURACION_MS).toISOString(),
  };
  const temporal = ruta(`${token}.tmp`);
  await writeFile(temporal, JSON.stringify(snapshot), { encoding: "utf8", mode: 0o600 });
  await rename(temporal, ruta(`${token}.json`));
  return { token, expiraAt: snapshot.expiraAt };
}

export async function obtenerDashboardTemporal(token: string): Promise<DashboardCompartido | null> {
  if (!TOKEN_PATTERN.test(token)) return null;
  try {
    const snapshot = dashboardCompartidoSchema.parse(JSON.parse(await readFile(ruta(`${token}.json`), "utf8")));
    if (Date.parse(snapshot.expiraAt) <= Date.now()) {
      await unlink(ruta(`${token}.json`)).catch(() => undefined);
      return null;
    }
    return snapshot;
  } catch {
    return null;
  }
}

async function limpiarExpirados() {
  const archivos = await readdir(SHARE_DIR).catch(() => [] as string[]);
  await Promise.all(
    archivos.filter((archivo) => archivo.endsWith(".json")).map(async (archivo) => {
      try {
        const data = dashboardCompartidoSchema.parse(JSON.parse(await readFile(ruta(archivo), "utf8")));
        if (Date.parse(data.expiraAt) <= Date.now()) await unlink(ruta(archivo));
      } catch {
        await unlink(ruta(archivo)).catch(() => undefined);
      }
    }),
  );
}

function ruta(nombre: string) {
  return join(SHARE_DIR, nombre);
}
