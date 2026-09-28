"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Componente de Indicador de Progreso de Scroll Lateral (Scroll Path).
 * 
 * Dibuja una línea vertical fija en el borde izquierdo de la pantalla que se 
 * "llena" de arriba a abajo a medida que el usuario navega por la página.
 * 
 * Características clave:
 * - SVG escalable inteligente: Usa `viewBox` y `preserveAspectRatio="none"` 
 *   para adaptarse a cualquier altura de pantalla sin distorsionar el grosor 
 *   relativo de la línea.
 * - Física de resorte (Spring): `useSpring` suaviza el valor crudo del scroll, 
 *   eliminando el "jitter" (temblor) de los eventos de scroll y dando una 
 *   sensación de peso, fluidez y calidad premium.
 * - Efecto de resplandor (Glow): Capa adicional con desenfoque para un acabado 
 *   visual de alta gama (estilo neón/energía).
 * - No intrusivo: `pointer-events-none` y un `z-index` estratégico (45) aseguran 
 *   que no interfiera con la interacción del usuario ni con overlays mayores 
 *   (como menús contextuales o loaders).
 */
export default function ScrollPath() {
  // useScroll devuelve un MotionValue que va de 0 (inicio de la página) a 1 (final).
  const { scrollYProgress } = useScroll();

  // useSpring suaviza el progreso del scroll en tiempo real.
  // - stiffness: 100 (rigidez media: responde rápido pero no es brusco).
  // - damping: 30 (amortiguación: evita que la línea "rebote" como un resorte loco).
  // - restDelta: 0.001 (optimización crítica: detiene los cálculos de animación 
  //   cuando el cambio es menor al 0.1%, ahorrando ciclos de CPU/GPU cuando el 
  //   usuario deja de hacer scroll).
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    // SVG fijo en el borde izquierdo.
    // viewBox="0 0 10 100": Define un sistema de coordenadas interno de 10 unidades 
    // de ancho por 100 de alto. La línea se dibuja en x=5 (exactamente el centro).
    // preserveAspectRatio="none": CRUCIAL. Permite que el SVG se estire para ocupar 
    // el 100% de la altura de la ventana (h-full) sin mantener la proporción 10:100.
    // Esto estira la altura del lienzo, pero mantiene el grosor de la línea (strokeWidth)
    // visualmente correcto y constante, sin importar el tamaño de la pantalla.
    <svg
      className="fixed left-0 top-0 w-2 h-full z-[45] pointer-events-none"
      viewBox="0 0 10 100"
      preserveAspectRatio="none"
      aria-hidden="true" // Elemento puramente decorativo, oculto a lectores de pantalla
    >
      {/* CAPA 1: Pista de fondo (Track) */}
      {/* Línea base estática que muestra el camino completo disponible. */}
      <motion.line
        x1="5"
        y1="0"
        x2="5"
        y2="100"
        stroke="rgba(255, 255, 255, 0.1)" // Sutil para no competir visualmente con la línea activa
        strokeWidth="2"
      />

      {/* CAPA 2: Línea de progreso activa */}
      {/* La propiedad 'pathLength' de Framer Motion anima el trazado del SVG.
         Internamente, FM manipula 'stroke-dasharray' y 'stroke-dashoffset'.
         Un valor de 0 significa 0% dibujado, 1 significa 100% dibujado. */}
      <motion.line
        x1="5"
        y1="0"
        x2="5"
        y2="100"
        // NOTA DE MEJORA: Considera usar "var(--foreground)" o "currentColor" 
        // en lugar de "white" hardcodeado, para que respete automáticamente 
        // los cambios de tema (cyberpunk, forest, mono) de tu ThemeContext.
        stroke="white"
        strokeWidth="2"
        style={{ pathLength }}
      />

      {/* CAPA 3: Efecto de resplandor (Glow/Halo) */}
      {/* Se dibuja con un grosor mayor (6) y desenfoque (blur-md).
          Al compartir el mismo 'style={{ pathLength }}', el brillo crece 
          exactamente sincronizado con la línea principal, creando un efecto 
          de neón o energía que se propaga hacia abajo. */}
      <motion.line
        x1="5"
        y1="0"
        x2="5"
        y2="100"
        stroke="white"
        strokeWidth="6"
        className="blur-md opacity-30" // Opacidad ajustada para que el glow sea elegante, no abrumador
        style={{ pathLength }}
      />
    </svg>
  );
}