"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Componente de Indicador de Progreso de Scroll estilo Binario.
 * 
 * Muestra una columna vertical de dígitos binarios (0s y 1s) en el lado derecho 
 * de la pantalla. A medida que el usuario hace scroll hacia abajo, los dígitos 
 * se "iluminan" secuencialmente, y una línea verde crece para indicar el progreso 
 * global de la página.
 * 
 * Características clave:
 * - Diseño responsivo: Solo visible en pantallas medianas y grandes (`hidden md:flex`).
 * - No intrusivo: Usa `pointer-events-none` para no bloquear clics en elementos subyacentes.
 * - Física orgánica: Utiliza `useSpring` para que la línea de progreso tenga un 
 *   movimiento suave y natural, no robótico.
 * - Patrón de suscripción eficiente: Cada dígito escucha los cambios de scroll 
 *   de forma independiente y se limpia automáticamente al desmontarse.
 */
export default function BinaryScroll() {
  // useScroll proporciona el progreso del scroll de la página completa (de 0 a 1)
  const { scrollYProgress } = useScroll();

  // useSpring suaviza el valor crudo del scroll. 
  // - stiffness: Rigidez del resorte (100 es un equilibrio entre respuesta y suavidad).
  // - damping: Amortiguación (30 evita que la línea "rebote" excesivamente).
  // - restDelta: Umbral de precisión para detener los cálculos cuando el movimiento es imperceptible (ahorro de CPU).
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Estado para almacenar la secuencia binaria. 
  // Se genera una sola vez al montar el componente gracias al array de dependencias vacío [].
  const [binary, setBinary] = useState<string[]>([]);

  useEffect(() => {
    // Genera un array de 50 caracteres, cada uno siendo '0' o '1' aleatoriamente.
    const bits = Array.from({ length: 50 }, () => Math.round(Math.random()).toString());
    setBinary(bits);
  }, []);

  return (
    // Contenedor principal fijo en el lateral derecho, centrado verticalmente.
    // pointer-events-none: Crucial para que este elemento sea "atravesable" por el ratón, 
    // permitiendo hacer clic en scrolls bars nativas o elementos que queden detrás.
    // select-none: Evita que el usuario seleccione accidentalmente los números al hacer drag.
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-1 pointer-events-none select-none">

      {/* Renderizado de la lista de dígitos binarios */}
      {binary.map((bit, i) => (
        <BinaryBit
          key={i}
          bit={bit}
          index={i}
          total={binary.length}
          scrollProgress={scrollYProgress}
        />
      ))}

      {/* Pista de fondo (Track): Línea sutil que muestra el camino completo */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-white/5" />

      {/* Pista activa (Active Track): Línea verde que crece según el scroll */}
      <motion.div
        // origin-top es vital aquí: hace que el escalado (scaleY) crezca desde arriba hacia abajo,
        // simulando el llenado de una barra de progreso vertical.
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[1px] bg-green-500 origin-top"
        style={{ scaleY }}
      />
    </div>
  );
}

/**
 * Componente hijo que representa un solo dígito binario.
 * Se encarga de determinar si debe estar "activo" (iluminado) basándose 
 * en su posición relativa dentro del total y el progreso actual del scroll.
 */
function BinaryBit({ bit, index, total, scrollProgress }: {
  bit: string,
  index: number,
  total: number,
  scrollProgress: any // Tipo MotionValue de framer-motion
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Patrón de suscripción de Framer Motion:
    // Nos suscribimos a los cambios del valor del scroll. 
    // La función 'on("change", callback)' devuelve una función de limpieza (unsubscribe).
    const unsubscribe = scrollProgress.on("change", (latest: number) => {
      // Calculamos el umbral de activación para este dígito específico.
      // Ej: Si hay 50 dígitos, el índice 25 se activará cuando el scroll llegue a 25/50 = 0.5 (50%)
      const threshold = index / total;

      // Si el progreso actual supera o iguala el umbral de este dígito, se activa.
      setActive(latest >= threshold);
    });

    // Limpieza: Al desmontar este dígito específico, cancelamos la suscripción 
    // para evitar fugas de memoria (memory leaks) y llamadas a componentes desmontados.
    return () => {
      unsubscribe();
    };
  }, [index, total, scrollProgress]);

  return (
    <span
      className={`
        text-[10px] font-mono transition-colors duration-300
        ${active
          ? "text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" // Estado activo: Color verde + brillo (glow)
          : "text-white/10" // Estado inactivo: Muy sutil, casi invisible
        }
      `}
    >
      {bit}
    </span>
  );
}