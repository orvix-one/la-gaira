/**
 * Formatos locales coherentes (spec §10.2): moneda BOB, números y fechas
 * en es-BO, presentación en zona horaria America/La_Paz (DEC-006).
 */
import type { Granularidad } from "@/domain/sales";

const money = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const moneyCompacto = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  notation: "compact",
  maximumFractionDigits: 1,
});

const numero = new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 });

const numeroCompacto = new Intl.NumberFormat("es-BO", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fechaCorta = new Intl.DateTimeFormat("es-BO", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const fechaLarga = new Intl.DateTimeFormat("es-BO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const mesAnio = new Intl.DateTimeFormat("es-BO", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const fechaHora = new Intl.DateTimeFormat("es-BO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/La_Paz",
});

export const formatMoney = (v: number): string => money.format(v);
export const formatMoneyCompact = (v: number): string => moneyCompacto.format(v);
export const formatNumber = (v: number): string => numero.format(v);
export const formatNumberCompact = (v: number): string => numeroCompacto.format(v);

/** Fecha ISO `YYYY-MM-DD` → "3 ago". */
export const formatDateShort = (iso: string): string =>
  fechaCorta.format(new Date(`${iso}T00:00:00Z`));

/** Fecha ISO `YYYY-MM-DD` → "3 de agosto de 2026". */
export const formatDateLong = (iso: string): string =>
  fechaLarga.format(new Date(`${iso}T00:00:00Z`));

/** Instant ISO → "1 sept 2026, 08:30" en America/La_Paz. */
export const formatDateTime = (iso: string): string => fechaHora.format(new Date(iso));

/** Porcentaje sin signo forzado: "25,6 %". `null` → "—". */
export function formatShare(v: number | null): string {
  if (v === null) return "—";
  return `${(v * 100).toFixed(1).replace(".", ",")} %`;
}

/** Variación con signo y flecha: "+12,4 %" / "-3,1 %". `null` → "—" (spec §9.1). */
export function formatVariation(v: number | null): string {
  if (v === null) return "—";
  const pct = (v * 100).toFixed(1).replace(".", ",");
  return v > 0 ? `+${pct} %` : `${pct} %`;
}

/** Rótulo de un bucket temporal según la granularidad. */
export function formatBucketLabel(bucket: string, granularidad: Granularidad): string {
  if (granularidad === "mes") return mesAnio.format(new Date(`${bucket}-01T00:00:00Z`));
  if (granularidad === "semana") return `Sem ${formatDateShort(bucket)}`;
  return formatDateShort(bucket);
}

/** "1 de agosto de 2026 – 31 de agosto de 2026". */
export function formatRango(rango: { desde: string; hasta: string }): string {
  return `${formatDateLong(rango.desde)} – ${formatDateLong(rango.hasta)}`;
}
