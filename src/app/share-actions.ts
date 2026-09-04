"use server";

import { crearReferenciaDashboard } from "@/application/dashboard-share";
import { getSalesSource } from "@/infrastructure/data";
import { guardarDashboardTemporal } from "@/infrastructure/data/temporary-dashboard-store";

export async function crearEnlaceDashboard(entrada: {
  pathname: string;
  search: string;
  metricas: string[];
}): Promise<{ ok: true; path: string; expiraAt: string } | { ok: false; message: string }> {
  try {
    const referencia = await crearReferenciaDashboard(entrada, getSalesSource());
    const { token, expiraAt } = await guardarDashboardTemporal(referencia);
    return { ok: true, path: `/compartir/${token}`, expiraAt };
  } catch {
    return { ok: false, message: "No se pudo generar el enlace temporal." };
  }
}
