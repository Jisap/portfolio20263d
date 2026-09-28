"use client";

import React from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

/**
 * Propiedades del componente `Overlay`.
 */
interface OverlayProps {
  /**
   * Progreso de scroll (de 0 a 1) de la secuencia a la que se superpone el texto.
   * Normalmente lo proporciona `useScroll` en `ScrollyCanvas`.
   */
  scrollYProgress: MotionValue<number>;
}

/**
 * Capa de texto que se superpone a la animación de `ScrollyCanvas`.
 *
 * Muestra tres mensajes sucesivos que aparecen, se desplazan en vertical y desaparecen
 * según el progreso del scroll. Cada mensaje tiene su propio tramo:
 *
 * | Mensaje | Posición | Tramo de scroll | Opacidad | Desplazamiento vertical |
 * |---|---|---|---|---|
 * | 1. "Jayanta / Creative Developer." | Abajo a la izquierda | 0 % – 20 % | Visible hasta el 10 %, se desvanece hasta el 20 % | 0 → -50 px |
 * | 2. "I build digital experiences." | Izquierda, centrado en vertical | 25 % – 50 % | Aparece del 25 % al 35 %, se mantiene hasta el 45 %, desaparece al 50 % | 50 → -50 px |
 * | 3. "Bridging design and engineering." | Derecha, alineado a la derecha | 55 % – 80 % | Aparece del 55 % al 65 %, se mantiene hasta el 75 %, desaparece al 80 % | 50 → -50 px |
 *
 * Entre tramos (20–25 % y 50–55 %) no se ve texto, y a partir del 80 % tampoco.
 * Con un contenedor de `500vh` y un bloque sticky de una pantalla, el recorrido real
 * de scroll es de unas 4 pantallas, así que cada 10 % equivale a unos 0,4 de pantalla.
 *
 * Funcionamiento:
 * - `useTransform` convierte el progreso de scroll en opacidad (`opacityN`) y desplazamiento
 *   vertical (`yN`) para cada mensaje. Fuera del rango indicado, el valor se mantiene en el
 *   extremo (comportamiento por defecto de `useTransform`).
 * - Al ser `MotionValue`, las animaciones no provocan re-renders de React.
 * - Los mensajes 2 y 3 entran desde abajo (+50 px) y salen hacia arriba (-50 px), lo que
 *   da sensación de movimiento continuo. El mensaje 1 solo sale hacia arriba.
 *
 * Requisitos:
 * - Client Component (`"use client"`): usa hooks de Framer Motion.
 * - Dependencias: `react` y `framer-motion`.
 * - Tailwind CSS.
 * - Debe colocarse dentro de un contenedor con `position: relative` (o sticky) y del tamaño
 *   de la pantalla, porque usa `absolute inset-0`. Es lo que hace `ScrollyCanvas`.
 *
 * Notas:
 * - El contenedor tiene `pointer-events-none`, por lo que el texto no se puede seleccionar
 *   y no bloquea los clics sobre lo que haya debajo.
 * - Los textos y los tramos están escritos directamente en el componente. Para cambiar el
 *   contenido o los tiempos, edita los arrays de `useTransform` y el JSX.
 * - Las clases `flex flex-col justify-center px-6 md:px-20` del contenedor no afectan al
 *   diseño, porque los tres mensajes están posicionados con `absolute`.
 * - Los mensajes con opacidad 0 siguen en el DOM, así que los lectores de pantalla leen
 *   los tres a la vez.
 * - No se respeta `prefers-reduced-motion`.
 *
 * @example
 * // Dentro de un bloque sticky, junto al canvas
 * const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
 *
 * <div className="sticky top-0 h-screen">
 *   <canvas />
 *   <Overlay scrollYProgress={scrollYProgress} />
 * </div>
 *
 * @param props {@link OverlayProps}
 * @returns {JSX.Element} Capa con los tres mensajes animados.
 */
export default function Overlay({ scrollYProgress }: OverlayProps) {
  // Section 1: 0% to 20% scroll
  // Visible desde el inicio; se desvanece y sube 50 px entre el 10 % y el 20 %
  const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  // Section 2: 25% to 50% scroll
  // Entra desde abajo (50 px), se mantiene visible del 35 % al 45 % y sale hacia arriba
  const opacity2 = useTransform(scrollYProgress, [0.25, 0.35, 0.45, 0.5], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.25, 0.5], [50, -50]);

  // Section 3: 55% to 80% scroll
  // Mismo patrón que la sección 2, en el tramo del 55 % al 80 %
  const opacity3 = useTransform(scrollYProgress, [0.55, 0.65, 0.75, 0.8], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.55, 0.8], [50, -50]);

  return (
    // Capa a pantalla completa, por encima del canvas (z-10) y sin capturar el ratón
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-center px-6 md:px-20 z-10">

      {/* Section 1: Bottom Left */}
      {/* Presentación: nombre (h1) y cargo, abajo a la izquierda */}
      <motion.div
        style={{ opacity: opacity1, y: y1 }}
        className="absolute inset-0 flex flex-col items-start justify-end text-left pb-32 pl-6 md:pl-20"
      >
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-2xl">
          Jayanta
        </h1>
        <p className="mt-4 text-xl md:text-3xl text-white/80 font-light tracking-wide">
          Creative Developer.
        </p>
      </motion.div>

      {/* Section 2: Left */}
      {/* Mensaje a la izquierda, centrado en vertical; `<br />` fuerza el salto de línea */}
      <motion.div
        style={{ opacity: opacity2, y: y2 }}
        className="absolute inset-y-0 left-6 md:left-20 flex flex-col justify-center max-w-xl"
      >
        <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-xl">
          I build digital <br />
          <span className="text-white/60 italic">experiences.</span>
        </h2>
      </motion.div>

      {/* Section 3: Right */}
      {/* Mensaje a la derecha, alineado a la derecha */}
      <motion.div
        style={{ opacity: opacity3, y: y3 }}
        className="absolute inset-y-0 right-6 md:right-20 flex flex-col justify-center max-w-xl text-right"
      >
        <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-xl">
          Bridging design <br />
          <span className="text-white/60 italic">and engineering.</span>
        </h2>
      </motion.div>

    </div>
  );
}