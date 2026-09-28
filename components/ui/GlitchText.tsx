"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

/**
 * Propiedades del componente `GlitchText`.
 */
interface GlitchTextProps {
  /** Texto que se muestra y sobre el que se aplica el efecto glitch. */
  text: string;

  /**
   * Elemento o componente con el que se renderiza el texto (por ejemplo `"h1"`, `"p"`
   * o un componente propio). Por defecto es `"span"`.
   */
  as?: React.ElementType;

  /** Clases CSS adicionales para el contenedor exterior. */
  className?: string;
}

/**
 * Texto con efecto "glitch" (fallo digital) al pasar el ratón por encima.
 *
 * Funcionamiento:
 * - En reposo se muestra el texto normal.
 * - Al hacer hover, el texto original se vuelve transparente y aparecen tres capas
 *   superpuestas en la misma posición:
 *   1. **Capa roja** (`#ff003c`): recortada a la franja superior (0 %–45 % de la altura)
 *      y con un temblor horizontal de 0,2 s.
 *   2. **Capa cian** (`#00e5ff`): recortada a la franja inferior (55 %–100 %) y con un
 *      temblor horizontal de 0,25 s, en sentido contrario a la roja.
 *   3. **Capa blanca**: texto completo y estático, que hace de base.
 * - Las capas de color usan `mix-blend-screen` para que sus colores se mezclen con el
 *   fondo. Como los recortes dejan una franja libre entre el 45 % y el 55 %, en esa zona
 *   solo se ve la capa blanca.
 * - Al quitar el ratón, las capas se desmontan y con ellas se detienen las animaciones
 *   infinitas, así que no consumen recursos en reposo.
 *
 * Requisitos:
 * - Client Component (`"use client"`): usa estado y eventos de ratón.
 * - Dependencias: `react` y `framer-motion`.
 * - Tailwind CSS (clases de posición, `z-index`, `mix-blend-screen`, etc.).
 *
 * Notas de uso:
 * - Las capas son `position: absolute` y heredan tamaño, fuente y peso del contenedor,
 *   por lo que conviene aplicar la tipografía en el elemento padre o en `className`.
 * - El contenedor exterior es siempre un `<div>` con `inline-block`, aunque `as` sea otro
 *   elemento. `as` solo cambia la etiqueta del texto interior.
 * - El color del texto en reposo se hereda del padre; en hover, la capa base pasa a `text-white`.
 *
 * Limitaciones conocidas:
 * - **Accesibilidad:** durante el hover el texto se repite tres veces en el DOM, y un lector
 *   de pantalla puede leerlo varias veces. Añadir `aria-hidden="true"` a las capas del glitch
 *   lo evitaría.
 * - **Dispositivos táctiles:** no hay efecto, porque depende de `mouseenter` y `mouseleave`.
 * - **Movimiento reducido:** no se respeta `prefers-reduced-motion`.
 *
 * @example
 * // Uso básico
 * <GlitchText text="JAYANTA" />
 *
 * @example
 * // Como título, con clases propias
 * <GlitchText as="h1" text="Hello World" className="text-6xl font-black text-white" />
 *
 * @param props {@link GlitchTextProps}
 * @returns {JSX.Element} Contenedor con el texto y, durante el hover, las capas del efecto.
 */
export default function GlitchText({ text, as: Component = "span", className = "" }: GlitchTextProps) {
  /** Indica si el ratón está sobre el componente (activa el efecto). */
  const [isHovered, setIsHovered] = useState(false);

  /** Alias con tipo `any` para poder usar `Component` como etiqueta JSX dinámica. */
  const Tag = Component as any;

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Texto original: se mantiene en el flujo para conservar el tamaño del contenedor
          y se oculta con opacidad 0 durante el hover, en lugar de desmontarse. */}
      <Tag className={`relative z-10 ${isHovered ? "opacity-0" : "opacity-100"}`}>
        {text}
      </Tag>

      {/* Capas del efecto glitch: solo existen mientras hay hover */}
      {isHovered && (
        <>
          {/* Capa roja: mitad superior, temblor horizontal entre -2 y 3 px */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: [-2, 2, -1, 3, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
            className="absolute top-0 left-0 z-20 text-[#ff003c] mix-blend-screen pointer-events-none"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)" }}
          >
            <Tag>{text}</Tag>
          </motion.div>

          {/* Capa cian: mitad inferior, temblor en sentido opuesto y con distinta duración
              para que el movimiento de ambas capas no se sincronice */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: [2, -2, 1, -3, 0] }}
            transition={{ duration: 0.25, repeat: Infinity, repeatType: "mirror" }}
            className="absolute top-0 left-0 z-20 text-[#00e5ff] mix-blend-screen pointer-events-none"
            style={{ clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)" }}
          >
            <Tag>{text}</Tag>
          </motion.div>

          {/* Capa base blanca: texto completo y estático, visible sobre todo en la franja central */}
          <div className="absolute top-0 left-0 z-10 text-white pointer-events-none">
            <Tag>{text}</Tag>
          </div>
        </>
      )}
    </div>
  );
}