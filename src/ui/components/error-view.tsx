"use client";

import { useEffect } from "react";

/**
 * Error recuperable con acción de reintento (spec §10.4). Los mensajes
 * orientan la siguiente acción del usuario (RNF-035).
 */
export function ErrorView({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sin datos sensibles en logs (RNF-025): solo el mensaje técnico.
    console.error("Error en vista analítica:", error.message);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-200 bg-brand-50 px-6 py-16 text-center">
      <p className="text-base font-semibold text-brand-800">No pudimos cargar esta vista</p>
      <p className="mt-1 max-w-md text-sm text-brand-700">
        Ocurrió un problema al obtener los datos. Puedes reintentar; si el problema persiste,
        informa al equipo técnico.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 min-h-11 rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Reintentar
      </button>
    </div>
  );
}
