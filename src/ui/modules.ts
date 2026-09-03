import type { ComponentType } from "react";
import {
  IconCargas,
  IconInicio,
  IconProductos,
  IconSucursales,
  IconTablero,
  IconVentas,
} from "./components/icons";

/**
 * Registro tipado de módulos (RF-030/RF-031/RF-032).
 *
 * - La navegación se construye solo con módulos `enabled: true`.
 * - Un módulo deshabilitado no aparece en navegación ni expone rutas
 *   consultables (RF-032).
 * - Los módulos `coming-soon` muestran solo un placeholder, sin datos ni
 *   funcionalidad analítica (RF-033).
 * - `cargas` existe pero depende del backend (Fase de datos); se muestra
 *   como informativo.
 */

export interface ModuloConfig {
  id: string;
  label: string;
  href: string;
  descripcion: string;
  icon: ComponentType<{ className?: string }>;
  enabled: boolean;
  seccion: "principal" | "futuro" | "administracion";
  estado?: "coming-soon";
}

export const MODULOS: readonly ModuloConfig[] = [
  {
    id: "inicio",
    label: "Inicio",
    href: "/",
    descripcion: "Resumen ejecutivo y estado de los datos",
    icon: IconInicio,
    enabled: true,
    seccion: "principal",
  },
  {
    id: "ventas",
    label: "Ventas",
    href: "/ventas",
    descripcion: "Cuánto se vendió y cómo evoluciona",
    icon: IconVentas,
    enabled: true,
    seccion: "principal",
  },
  {
    id: "sucursales",
    label: "Sucursales",
    href: "/sucursales",
    descripcion: "Comparativa y detalle por sucursal",
    icon: IconSucursales,
    enabled: true,
    seccion: "principal",
  },
  {
    id: "productos",
    label: "Productos",
    href: "/productos",
    descripcion: "Ranking y análisis por producto y categoría",
    icon: IconProductos,
    enabled: true,
    seccion: "principal",
  },
  {
    id: "futuro-1",
    label: "Tablero adicional 1",
    href: "/tableros/futuro-1",
    descripcion: "Espacio para una nueva vista configurable",
    icon: IconTablero,
    enabled: true,
    seccion: "futuro",
    estado: "coming-soon",
  },
  {
    id: "futuro-2",
    label: "Tablero adicional 2",
    href: "/tableros/futuro-2",
    descripcion: "Espacio para una nueva vista configurable",
    icon: IconTablero,
    enabled: true,
    seccion: "futuro",
    estado: "coming-soon",
  },
  {
    id: "cargas",
    label: "Cargas",
    href: "/cargas",
    descripcion: "Importación de archivos (pendiente de backend)",
    icon: IconCargas,
    enabled: true,
    seccion: "administracion",
  },
];

export function modulosVisibles(seccion: ModuloConfig["seccion"]): ModuloConfig[] {
  return MODULOS.filter((m) => m.enabled && m.seccion === seccion);
}
