"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "./AudioManager";

/**
 * Componente de Visualizador Ambiental (Idle Visualizer / Screensaver).
 * 
 * Actúa como un "salvapantallas" visual que aparece cuando el usuario 
 * deja de interactuar con la página (inactividad de 5 segundos) Y el audio 
 * está activado. Refuerza la sensación de que el "sistema" está vivo y 
 * procesando el drone ambiental en segundo plano.
 * 
 * Características clave:
 * - Detección de inactividad (Idle detection): Escucha eventos globales de 
 *   interacción para resetear un temporizador de 5 segundos.
 * - Sincronización condicional: Solo se renderiza si el audio está activo 
 *   (para no mostrar un ecualizador si no hay "música" sonando).
 * - Animación orgánica escalonada: Usa keyframes de Framer Motion con 
 *   retrasos progresivos y duraciones variables para crear un efecto de "onda".
 * - No intrusivo: z-0 y pointer-events-none garantizan que sea un fondo 
 *   ambiental que nunca bloquee el contenido principal ni las interacciones.
 */
export default function AmbientVisualizer() {
  // Leemos el estado global del audio. Si está muteado, el visualizador no tiene sentido.
  const { isMuted } = useAudio();
  const [isIdle, setIsIdle] = useState(false);

  // --- Efecto 1: Detección de Inactividad (Idle Timer Pattern) ---
  useEffect(() => {
    // Usamos ReturnType<typeof setTimeout> en lugar de NodeJS.Timeout para 
    // mantener el código agnóstico al entorno (funciona igual en navegador y Node).
    let timeout: ReturnType<typeof setTimeout>;

    // Función que se dispara con cualquier interacción del usuario.
    // Resetea el estado a "activo" y reinicia el temporizador de 5 segundos.
    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsIdle(true), 5000);
    };

    // Registramos los eventos de interacción más comunes.
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Iniciamos el temporizador inmediatamente al montar el componente.
    // Si el usuario carga la página y no toca nada, a los 5s aparecerá el visualizador.
    timeout = setTimeout(() => setIsIdle(true), 5000);

    // Limpieza (Cleanup): Eliminamos listeners y cancelamos timeouts pendientes
    // para evitar fugas de memoria o comportamientos fantasma si el componente se desmonta.
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      clearTimeout(timeout);
    };
  }, []);

  return (
    // AnimatePresence permite que la animación de salida (fade out) se complete 
    // antes de eliminar el div del DOM cuando el usuario vuelve a mover el ratón.
    <AnimatePresence>
      {/* Renderizado condicional doble: Solo si el audio suena Y el usuario está inactivo */}
      {!isMuted && isIdle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }} // Fade in/out lento y elegante (1.5s)

          // z-0: Detrás de todo el contenido. A diferencia de los overlays (z-[10000]), 
          // este es un elemento de fondo ambiental.
          // pointer-events-none: Atravesable por el ratón.
          className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden"
        >
          {/* Contenedor de las barras del ecualizador */}
          <div className="flex items-end gap-2 h-64">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                // Keyframes de Framer Motion:
                // Define una secuencia de alturas y opacidades.
                // Framer interpola suavemente entre estos valores en bucle.
                animate={{
                  height: ["10%", "100%", "20%", "70%", "40%", "10%"],
                  opacity: [0.1, 0.3, 0.1, 0.2, 0.1]
                }}
                transition={{
                  // Duración variable basada en el índice (i % 5).
                  // Esto crea 5 grupos de barras (duraciones de 2s, 2.5s, 3s, 3.5s, 4s) 
                  // que se mueven a diferentes velocidades, evitando que todas parezcan 
                  // un bloque sólido y robótico.
                  duration: 2 + (i % 5) * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",

                  // Retraso progresivo: Cada barra empieza 0.1s después que la anterior.
                  // Esto crea el efecto de "ola" (wave) que recorre el visualizador 
                  // de izquierda a derecha de forma continua.
                  delay: i * 0.1
                }}
                // bg-white/20: Muy sutil. Al estar en z-0, no debe competir con el texto.
                // rounded-full: Bordes redondeados para un aspecto más orgánico y suave.
                className="w-4 bg-white/20 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}