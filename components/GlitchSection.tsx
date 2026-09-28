/**
 * GlitchSection.tsx
 * ----------------------------------------------------------------------------
 * Componente wrapper que aplica un efecto "glitch" (sacudida + distorsión
 * de color/blur) a su contenido cuando entra por primera vez en el viewport.
 *
 * Uso típico:
 * ```tsx
 * <GlitchSection delay={200}>
 *   <h2>Mi título con efecto glitch</h2>
 * </GlitchSection>
 * ```
 *
 * @component
 */

// Directiva de Next.js: este componente necesita interactividad en cliente
// (usa useState, useEffect y useInView de framer-motion).
"use client";

import React, { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

/** Props aceptadas por el componente GlitchSection. */
interface GlitchSectionProps {
  /** Contenido hijo que recibirá el efecto glitch al aparecer. */
  children: React.ReactNode;
  /**
   * Retardo en milisegundos antes de disparar el glitch
   * una vez que la sección entra en vista.
   * @default 0
   */
  delay?: number;
}

/**
 * Envuelve `children` y dispara una animación corta de glitch
 * cuando el contenedor entra en el viewport.
 *
 * @param children - Nodos a renderizar dentro del contenedor animado.
 * @param delay - Ms de espera tras entrar en vista antes del glitch.
 */
export default function GlitchSection({ children, delay = 0 }: GlitchSectionProps) {
  // Referencia al contenedor exterior: sirve para detectar visibilidad.
  const ref = React.useRef(null);

  // `isInView` se vuelve true la primera vez que el div entra en viewport,
  // con un margen de -100px para que el efecto dispare un poco antes/dentro.
  // `once: true` evita que se repita al hacer scroll arriba/abajo.
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Flag que controla si la animación de glitch está activa.
  const [isGlitching, setIsGlitching] = useState(false);

  // Cuando entra en vista, espera `delay` ms, activa el glitch
  // durante 500ms y luego lo desactiva. Limpia el timeout si desmonta.
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        // Inicia la sacudida / distorsión de color.
        setIsGlitching(true);
        // Detiene el efecto tras 500ms (dura lo que la animación).
        // Nota: este timeout interno no se limpia si el componente
        // se desmonta antes; es inofensivo pero podría extraerse a una ref.
        setTimeout(() => setIsGlitching(false), 500);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);

  return (
    // Contenedor relativo que actúa como sensor de visibilidad (ref).
    <div ref={ref} className="relative">
      <motion.div
        // Si `isGlitching` es true, anima keyframes de posición (x/y)
        // y de filtro (hue-rotate + blur) para simular interferencia RGB.
        // Si es false, no se aplica animación (`{}` = estado reposo).
        animate={isGlitching ? {
          // Sacudida horizontal: -2 -> 2 -> -3 -> 3 -> 0 (vuelve al origen).
          x: [-2, 2, -3, 3, 0],
          // Sacudida vertical combinada para un movimiento más orgánico.
          y: [1, -1, 2, -2, 0],
          // Distorsión de color y desenfoque progresivo que se resuelve.
          filter: [
            "hue-rotate(0deg) blur(0px)",
            "hue-rotate(90deg) blur(2px)",
            "hue-rotate(-90deg) blur(1px)",
            "hue-rotate(0deg) blur(0px)"
          ]
        } : {}}
        // Duración total del glitch: 0.4s, coherente con los 500ms del timeout.
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </div>
  );
}