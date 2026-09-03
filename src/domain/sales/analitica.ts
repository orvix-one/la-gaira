/**
 * Filtros globales compartidos por las tres vistas (spec §6.3, RF-020).
 * Las fechas son ISO `YYYY-MM-DD` y el rango es inclusivo (spec §9.1).
 */

export interface RangoFechas {
  desde: string;
  hasta: string;
}

export interface FiltrosGlobales {
  rango: RangoFechas;
  /** Código de sucursal; `undefined` = todas. */
  sucursal?: string;
}

export interface Sucursal {
  code: string;
  name: string;
}

export interface CoberturaDatos {
  desde: string | null;
  hasta: string | null;
  ultimaCargaAt: string;
  fuente: string;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function esFechaIsoValida(valor: string): boolean {
  if (!ISO_DATE_REGEX.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

export function esRangoValido(rango: RangoFechas): boolean {
  return (
    esFechaIsoValida(rango.desde) &&
    esFechaIsoValida(rango.hasta) &&
    rango.desde <= rango.hasta
  );
}

function toUtcDay(fechaIso: string): number {
  return Date.parse(`${fechaIso}T00:00:00Z`);
}

function toIsoDay(utcMs: number): string {
  return new Date(utcMs).toISOString().slice(0, 10);
}

const DIA_MS = 24 * 60 * 60 * 1000;

/** Cantidad de días inclusivos del rango. */
export function diasEnRango(rango: RangoFechas): number {
  return Math.round((toUtcDay(rango.hasta) - toUtcDay(rango.desde)) / DIA_MS) + 1;
}

/**
 * Periodo anterior de igual duración, inmediatamente precedente (spec §9.2:
 * "El periodo anterior debe tener igual duración").
 */
export function rangoAnterior(rango: RangoFechas): RangoFechas {
  const dias = diasEnRango(rango);
  const hastaAnterior = toUtcDay(rango.desde) - DIA_MS;
  return {
    desde: toIsoDay(hastaAnterior - (dias - 1) * DIA_MS),
    hasta: toIsoDay(hastaAnterior),
  };
}

export type Granularidad = "dia" | "semana" | "mes";

/**
 * Granularidad automática de la serie temporal según el rango (spec §9.3):
 * hasta 45 días → día; hasta 120 → semana; más → mes.
 */
export function granularidadPara(rango: RangoFechas): Granularidad {
  const dias = diasEnRango(rango);
  if (dias <= 45) return "dia";
  if (dias <= 120) return "semana";
  return "mes";
}

/** Clave de bucket temporal para una fecha ISO según la granularidad. */
export function claveBucket(fechaIso: string, granularidad: Granularidad): string {
  if (granularidad === "mes") return fechaIso.slice(0, 7);
  if (granularidad === "semana") {
    // Lunes de la semana (ISO 8601) como inicio del bucket.
    const ms = toUtcDay(fechaIso);
    const diaSemana = new Date(ms).getUTCDay(); // 0 = domingo
    const offset = diaSemana === 0 ? 6 : diaSemana - 1;
    return toIsoDay(ms - offset * DIA_MS);
  }
  return fechaIso;
}

/**
 * Todas las claves de bucket que cubren el rango, en orden. Permite
 * construir series temporales sin huecos (buckets sin ventas valen 0).
 */
export function bucketsDelRango(rango: RangoFechas, granularidad: Granularidad): string[] {
  const claves: string[] = [];
  const vistas = new Set<string>();
  for (let ms = toUtcDay(rango.desde); ms <= toUtcDay(rango.hasta); ms += DIA_MS) {
    const clave = claveBucket(toIsoDay(ms), granularidad);
    if (!vistas.has(clave)) {
      vistas.add(clave);
      claves.push(clave);
    }
  }
  return claves;
}
