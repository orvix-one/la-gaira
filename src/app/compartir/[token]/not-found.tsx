import Link from "next/link";

export default function EnlaceCompartidoNoDisponible() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-lg">
        <p className="text-xs font-semibold tracking-[0.16em] text-brand-600 uppercase">La Gaira</p>
        <h1 className="mt-2 text-2xl font-bold text-neutral-950">Enlace no disponible</h1>
        <p className="mt-3 text-sm text-neutral-600">Este enlace temporal venció, fue eliminado o no es válido. Solicita una nueva visualización compartida.</p>
        <Link href="/" className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white">Ir al dashboard</Link>
      </div>
    </main>
  );
}
