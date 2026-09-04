import { IconTablero } from "./icons";

/** Placeholder comercial para módulos futuros; no consulta ni muestra datos. */
export function ComingSoonView({ numero }: { numero: "04" | "05" }) {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-10">
      <div className="w-full max-w-2xl text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-neutral-950 text-white shadow-[0_22px_55px_rgba(23,19,19,0.18)]">
          <span className="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-canvas bg-brand-500 text-xs font-bold text-white">
            {numero}
          </span>
          <IconTablero className="h-10 w-10" />
        </div>

        <p className="mt-8 text-xs font-bold tracking-[0.22em] text-brand-600 uppercase">
          Expansión modular
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
          Coming Soon
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-600 sm:text-base">
          Este espacio está reservado para un nuevo tablero. Podemos configurarlo con los KPIs,
          filtros y visualizaciones que el negocio necesite.
        </p>

        <div className="mx-auto mt-8 flex max-w-md items-center gap-4 text-xs font-medium text-neutral-500">
          <span className="h-px flex-1 bg-neutral-200" />
          Vista configurable
          <span className="h-px flex-1 bg-neutral-200" />
        </div>
      </div>
    </section>
  );
}
