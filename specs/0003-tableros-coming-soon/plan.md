# Plan: tableros adicionales Coming Soon

## Diseño técnico

- Extender `ModuloConfig` con la sección `futuro` y estado opcional `coming-soon`.
- Registrar dos módulos visibles con rutas estáticas.
- Renderizar una sección `Próximamente` entre Analítica y Administración.
- Crear un componente presentacional reutilizable `ComingSoonView`.
- Ocultar `FilterBar` en rutas `/tableros/*`, porque todavía no consumen datos.

## Decisiones

| Decisión | Alternativas consideradas | Justificación |
|---|---|---|
| Rutas estáticas independientes | Ruta dinámica `[id]` | Impide que identificadores no registrados expongan placeholders arbitrarios. |
| Nombres provisionales numerados | Inferir Clientes/Vendedores | El spec prohíbe comprometer una pregunta de negocio sin mini-spec. |
| Etiqueta `Soon` en navbar | Solo texto de módulo | Comunica claramente que no es funcional antes de entrar. |

## Riesgos

- El cliente puede interpretar el placeholder como alcance comprometido. Mitigación: texto explícito indicando que se configura después de definir la pregunta de negocio.
