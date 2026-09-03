"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import type { CoberturaDatos, Sucursal } from "@/domain/sales";
import { modulosVisibles, type ModuloConfig } from "../modules";
import { FilterBar } from "../filters/filter-bar";
import { IconCerrar, IconMenu } from "../components/icons";

/**
 * Estructura de navegación (spec §10.1):
 * - Escritorio (≥1024 px): navegación lateral persistente.
 * - Móvil: header con menú deslizable.
 * - Indicador visible de última actualización.
 * Los módulos vienen del registro tipado (RF-030/RF-032).
 */
export function AppShell({
  sucursales,
  cobertura,
  ultimaActualizacion,
  children,
}: {
  sucursales: Sucursal[];
  cobertura: CoberturaDatos;
  ultimaActualizacion: string;
  children: React.ReactNode;
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#090707] lg:flex">
        <div className="h-1 bg-brand-500" />
        <div className="flex items-center gap-3 px-5 py-6">
          <Image
            src="/lagaira.jpg"
            alt="La Gaira"
            width={44}
            height={44}
            className="rounded-full ring-2 ring-brand-500/80"
            priority
          />
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">LA GAIRA</p>
            <p className="text-xs text-neutral-500">Analítica comercial</p>
          </div>
        </div>
        <NavSections onNavigate={() => setMenuAbierto(false)} />
        <div className="mt-auto border-t border-white/10 px-5 py-5 text-xs text-neutral-500">
          <p className="flex items-center gap-2 font-medium text-neutral-300">
            <span className="h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_0_4px_rgba(246,45,41,0.12)]" />
            Datos actualizados
          </p>
          <p className="mt-2 pl-4">{ultimaActualizacion}</p>
        </div>
      </aside>

      {/* Header móvil */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-brand-500 bg-[#090707] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-white hover:bg-white/10"
        >
          <IconMenu className="h-6 w-6" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/lagaira.jpg" alt="La Gaira" width={28} height={28} className="rounded-full" />
          <span className="text-sm font-semibold tracking-wide text-white">LA GAIRA</span>
        </Link>
      </header>

      {/* Drawer móvil */}
      {menuAbierto ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setMenuAbierto(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-white/10 bg-[#090707] shadow-2xl">
            <div className="h-1 bg-brand-500" />
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-semibold tracking-wide text-white">LA GAIRA</span>
              <button
                type="button"
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-neutral-300 hover:bg-white/10"
              >
                <IconCerrar className="h-5 w-5" />
              </button>
            </div>
            <NavSections onNavigate={() => setMenuAbierto(false)} />
          </div>
        </div>
      ) : null}

      {/* Contenido */}
      <div className="lg:pl-64">
        <div className="sticky top-11 z-20 lg:top-0">
          <Suspense fallback={<div className="h-14 border-b border-neutral-200 bg-white" />}>
            <FilterBar sucursales={sucursales} cobertura={cobertura} />
          </Suspense>
        </div>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

function NavSections({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="flex flex-col gap-1 overflow-y-auto px-3 py-2">
      <NavGrupo titulo="Analítica" modulos={modulosVisibles("principal")} onNavigate={onNavigate} />
      <NavGrupo
        titulo="Próximamente"
        modulos={modulosVisibles("futuro")}
        onNavigate={onNavigate}
      />
      <NavGrupo
        titulo="Administración"
        modulos={modulosVisibles("administracion")}
        onNavigate={onNavigate}
      />
    </nav>
  );
}

function NavGrupo({
  titulo,
  modulos,
  onNavigate,
}: {
  titulo: string;
  modulos: ModuloConfig[];
  onNavigate: () => void;
}) {
  if (modulos.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="px-3 pt-3 pb-1 text-[0.68rem] font-semibold tracking-[0.16em] text-neutral-600 uppercase">
        {titulo}
      </p>
      {modulos.map((m) => (
        <NavItem key={m.id} modulo={m} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

function NavItem({ modulo, onNavigate }: { modulo: ModuloConfig; onNavigate: () => void }) {
  const pathname = usePathname();
  const activo =
    modulo.href === "/" ? pathname === "/" : pathname.startsWith(modulo.href);
  const Icon = modulo.icon;
  return (
    <Link
      href={modulo.href}
      onClick={onNavigate}
      aria-current={activo ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all ${
        activo
          ? "bg-brand-600 text-white shadow-[0_8px_24px_rgba(246,45,41,0.22)]"
          : "text-neutral-400 hover:bg-white/7 hover:text-white"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{modulo.label}</span>
      {modulo.estado === "coming-soon" ? (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[0.58rem] font-bold tracking-wider uppercase ${
            activo ? "bg-white/18 text-white" : "bg-brand-500/15 text-brand-300"
          }`}
        >
          Soon
        </span>
      ) : null}
    </Link>
  );
}
