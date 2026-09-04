"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { crearEnlaceDashboard } from "@/app/share-actions";
import { metricasCompartiblesDe } from "@/domain/sales";
import { IconCompartir, IconExportar } from "./icons";

type EstadoCompartir = "inactivo" | "generando" | "listo" | "copiado" | "error";
type ModoSelector = "compartir" | "exportar";

/** Acciones del dashboard que operan sobre la URL y visualización actuales. */
export function DashboardActions({ titulo }: { titulo: string }) {
  const pathname = usePathname();
  const opciones = metricasCompartiblesDe(pathname);
  const [estado, setEstado] = useState<EstadoCompartir>("inactivo");
  const [enlace, setEnlace] = useState<string | null>(null);
  const [modoSelector, setModoSelector] = useState<ModoSelector | null>(null);
  const [seleccionadas, setSeleccionadas] = useState<string[]>(() =>
    opciones.map((opcion) => opcion.id),
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  function mostrarEstado(nuevoEstado: EstadoCompartir) {
    setEstado(nuevoEstado);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setEstado("inactivo"), 2500);
  }

  async function generarEnlace() {
    setEstado("generando");
    setEnlace(null);
    try {
      const resultado = await crearEnlaceDashboard({
        pathname: window.location.pathname,
        search: window.location.search,
        metricas: seleccionadas,
      });
      if (!resultado.ok) {
        mostrarEstado("error");
        return;
      }
      setEnlace(new URL(resultado.path, window.location.origin).toString());
      setEstado("listo");
      setModoSelector(null);
    } catch {
      mostrarEstado("error");
    }
  }

  function alternarMetrica(id: string) {
    setSeleccionadas((actuales) =>
      actuales.includes(id)
        ? actuales.filter((metrica) => metrica !== id)
        : [...actuales, id],
    );
  }

  function exportarPdf() {
    const bloques = Array.from(
      document.querySelectorAll<HTMLElement>("[data-dashboard-metric]"),
    );
    for (const bloque of bloques) {
      if (!seleccionadas.includes(bloque.dataset.dashboardMetric ?? "")) {
        bloque.setAttribute("data-export-hidden", "");
      }
    }
    setModoSelector(null);
    requestAnimationFrame(() => {
      window.print();
      for (const bloque of bloques) bloque.removeAttribute("data-export-hidden");
    });
  }

  async function compartirEnlace() {
    if (!enlace) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${titulo} · La Gaira`,
          text: "Resumen temporal del dashboard de La Gaira. Disponible durante 24 horas.",
          url: enlace,
        });
        return;
      }
      await copiarAlPortapapeles(enlace);
      mostrarEstado("copiado");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      mostrarEstado("error");
    }
  }

  return (
    <div data-print-hidden className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => setModoSelector("compartir")}
        disabled={estado === "generando"}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
      >
        <IconCompartir className="h-4 w-4" />
        {estado === "generando" ? "Generando…" : "Generar enlace"}
      </button>
      {modoSelector ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="selector-metricas-titulo"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 text-left shadow-2xl sm:p-6">
            <h2 id="selector-metricas-titulo" className="text-lg font-semibold text-neutral-950">
              Selecciona qué quieres {modoSelector === "compartir" ? "compartir" : "exportar"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {modoSelector === "compartir"
                ? "El enlace mostrará únicamente las métricas y visualizaciones seleccionadas."
                : "El PDF incluirá únicamente las métricas y visualizaciones seleccionadas."}
            </p>
            <div className="mt-4 flex items-center justify-between border-b border-neutral-200 pb-3">
              <span className="text-xs font-medium text-neutral-500">
                {seleccionadas.length} de {opciones.length} seleccionadas
              </span>
              <button
                type="button"
                onClick={() =>
                  setSeleccionadas(
                    seleccionadas.length === opciones.length
                      ? []
                      : opciones.map((opcion) => opcion.id),
                  )
                }
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                {seleccionadas.length === opciones.length ? "Quitar todas" : "Seleccionar todas"}
              </button>
            </div>
            <fieldset className="mt-3 grid gap-2 sm:grid-cols-2">
              <legend className="sr-only">Métricas disponibles</legend>
              {opciones.map((opcion) => (
                <label
                  key={opcion.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    seleccionadas.includes(opcion.id)
                      ? "border-brand-300 bg-brand-50"
                      : "border-neutral-200 hover:border-brand-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={seleccionadas.includes(opcion.id)}
                    onChange={() => alternarMetrica(opcion.id)}
                    className="mt-0.5 h-4 w-4 accent-brand-600"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-neutral-800">{opcion.label}</span>
                    <span className="mt-0.5 block text-[0.65rem] font-semibold tracking-wide text-neutral-400 uppercase">
                      {opcion.tipo}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            {seleccionadas.length === 0 ? (
              <p className="mt-3 text-xs font-medium text-brand-700">Selecciona al menos una métrica.</p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModoSelector(null)}
                className="min-h-10 rounded-lg border border-neutral-300 px-4 text-sm font-medium text-neutral-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={modoSelector === "compartir" ? generarEnlace : exportarPdf}
                disabled={seleccionadas.length === 0 || estado === "generando"}
                className="min-h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {estado === "generando"
                  ? "Generando…"
                  : modoSelector === "compartir"
                    ? "Crear enlace temporal"
                    : "Exportar selección"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {enlace ? (
        <div className="basis-full rounded-xl border border-brand-100 bg-brand-50 p-2.5">
          <p className="mb-2 text-xs font-medium text-brand-800">Vista completa de solo lectura · disponible durante 24 horas</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={enlace}
              aria-label="Enlace temporal del dashboard"
              className="min-w-0 flex-1 rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-neutral-700"
              onFocus={(event) => event.currentTarget.select()}
            />
            <button
              type="button"
              onClick={compartirEnlace}
              className="min-h-9 shrink-0 rounded-lg bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700"
            >
              Compartir
            </button>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setModoSelector("exportar")}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-neutral-950 px-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        <IconExportar className="h-4 w-4" />
        Exportar PDF
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {mensajeEstado(estado)}
      </span>
      {estado !== "inactivo" ? (
        <span
          aria-hidden="true"
          className={`basis-full text-right text-xs ${estado === "error" ? "text-brand-700" : "text-emerald-700"}`}
        >
          {mensajeEstado(estado)}
        </span>
      ) : null}
    </div>
  );
}

async function copiarAlPortapapeles(texto: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(texto);
    return;
  }

  const input = document.createElement("textarea");
  input.value = texto;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copiado = document.execCommand("copy");
  input.remove();
  if (!copiado) throw new Error("No se pudo copiar el enlace");
}

function mensajeEstado(estado: EstadoCompartir): string {
  if (estado === "generando") return "Generando enlace temporal";
  if (estado === "listo") return "Enlace temporal generado";
  if (estado === "copiado") return "Enlace temporal copiado";
  if (estado === "error") return "No se pudo compartir";
  return "";
}
