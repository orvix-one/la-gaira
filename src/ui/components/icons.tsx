/**
 * Iconos SVG en línea (sin dependencias). Estilo outline, trazo heredado
 * (`currentColor`) para que tomen el color del texto.
 */

interface IconProps {
  className?: string;
}

function base(props: IconProps, path: React.ReactNode) {
  return (
    <svg
      className={props.className ?? "h-5 w-5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

export const IconInicio = (p: IconProps) =>
  base(p, <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z" />);

export const IconVentas = (p: IconProps) =>
  base(p, <path d="M3 3v16a1 1 0 0 0 1 1h16M7 14l4-4 3 3 5-6" />);

export const IconSucursales = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M4 21V8l5-4 5 4v13" />
      <path d="M14 12h5a1 1 0 0 1 1 1v8M4 21h17" />
    </>,
  );

export const IconProductos = (p: IconProps) =>
  base(
    p,
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>,
  );

export const IconCargas = (p: IconProps) =>
  base(p, <path d="M12 16V4m0 0 4 4m-4-4L8 8M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />);

export const IconTablero = (p: IconProps) =>
  base(
    p,
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M17.5 14v7M14 17.5h7" />
    </>,
  );

export const IconMenu = (p: IconProps) => base(p, <path d="M4 6h16M4 12h16M4 18h16" />);

export const IconCerrar = (p: IconProps) => base(p, <path d="m6 6 12 12M18 6 6 18" />);

export const IconFiltro = (p: IconProps) =>
  base(p, <path d="M4 5h16l-6 8v5l-4 2v-7Z" />);

export const IconAtras = (p: IconProps) => base(p, <path d="M15 6l-6 6 6 6" />);
