"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Componente de Iluminación Ambiental (Ambient Glow).
 * 
 * Crea una atmósfera visual de fondo mediante tres esferas de luz difusa que 
 * se mueven lentamente y de forma orgánica por la pantalla. Este efecto añade 
 * profundidad y vida al diseño sin distraer del contenido principal.
 * 
 * Características clave:
 * - Prevención de Hydration Mismatch: Solo renderiza en el cliente.
 * - Movimiento orgánico no sincronizado: Cada esfera tiene su propia duración,
 *   creando un efecto natural y no mecánico.
 * - Uso de variables CSS: El primer glow usa `var(--accent)` para adaptarse
 *   dinámicamente al tema activo del sitio.
 * - Ultra bajo impacto de rendimiento: Usa `blur` y `opacity` muy baja (0.03)
 *   para crear un efecto sutil que no satura la GPU.
 * - No intrusivo: `pointer-events-none` y `z-[-1]` garantizan que nunca
 *   bloquee interacciones con el contenido real.
 */
export default function AmbientGlow() {
  // Estado de montaje para prevenir errores de hidratación en Next.js.
  // El servidor renderiza `null`, y solo después de montar en el cliente
  // se renderizan las esferas animadas. Esto evita el "Hydration Mismatch"
  // que ocurre cuando el HTML del servidor difiere del renderizado del cliente.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marcamos como montado solo en el navegador
    setMounted(true);
  }, []);

  // Si aún no está montado, no renderizamos nada (previene hydration error)
  if (!mounted) return null;

  return (
    // Contenedor fijo que cubre toda la ventana del navegador
    // - z-[-1]: Coloca este elemento detrás de todo el contenido (stacking context negativo)
    // - pointer-events-none: Hace que el contenedor sea "invisible" al ratón,
    //   permitiendo clics y hovers en elementos que estén "debajo" visualmente
    // - overflow-hidden: Recorta cualquier parte de las esferas que salga de la pantalla
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">

      {/* Creamos 3 esferas de luz usando Array.map */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          // Animación de movimiento y escala:
          // Cada propiedad usa un array de valores para crear keyframes.
          // La esfera se mueve en patrones complejos: derecha, izquierda, centro.
          // Simultáneamente pulsa en tamaño (scale) creando un efecto de "respiración".
          animate={{
            x: [0, 50, -50, 0],      // Movimiento horizontal en píxeles
            y: [0, -50, 50, 0],      // Movimiento vertical en píxeles
            scale: [1, 1.1, 0.9, 1], // Pulsación de escala (110% → 90% → 100%)
          }}
          transition={{
            // Duración diferente para cada esfera (20s, 25s, 30s).
            // Esto es CRÍTICO: si todas tuvieran la misma duración, se moverían
            // en sincronía perfecta, creando un efecto robótico y artificial.
            // Las duraciones escalonadas crean un movimiento orgánico y caótico.
            duration: 20 + i * 5,
            repeat: Infinity,        // Repetir infinitamente
            ease: "easeInOut",       // Suavizado en los puntos de inflexión
          }}
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px]"
          style={{
            // Gradientes radiales personalizados para cada esfera:
            // - Esfera 0: Usa la variable CSS del tema (--accent) para adaptarse dinámicamente
            // - Esfera 1: Azul (#3b82f6) - tono frío
            // - Esfera 2: Púrpura (#a855f7) - tono cálido
            // El gradiente va del color sólido (0%) a transparente (70%),
            // creando un borde suave y difuso que se mezcla con el fondo.
            background: i === 0 ? "radial-gradient(circle, var(--accent) 0%, transparent 70%)" :
              i === 1 ? "radial-gradient(circle, #3b82f6 0%, transparent 70%)" :
                "radial-gradient(circle, #a855f7 0%, transparent 70%)",

            // Opacidad extremadamente baja (3%).
            // Esto es intencional: el efecto debe ser sutil y atmosférico,
            // no abrumador. Si lo subes a 0.1 o más, dominará visualmente la página.
            opacity: 0.03,

            // Posicionamiento en porcentajes para distribución espacial.
            // Las esferas se colocan en diferentes regiones de la pantalla:
            // - left: 15%, 45%, 75% (distribución horizontal)
            // - top: 15%, 35%, 55% (distribución vertical)
            // Esto crea una composición visual equilibrada que llena el espacio
            // sin concentrarse en una sola zona.
            left: `${15 + i * 30}%`,
            top: `${15 + i * 20}%`,
          }}
        />
      ))}
    </div>
  );
}